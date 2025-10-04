const Contact = require("../models/Contact");
const {
  sendAdminNotification,
  sendClientConfirmation,
} = require("../utils/mailer");

// ========================= VALIDATION UTILITIES =========================

const validateContactData = (data) => {
  const errors = [];
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "country",
    "zipCode",
    "message",
  ];

  // Check required fields
  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors.push(`${field} is required`);
    }
  });

  // Validate email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Please enter a valid email address");
  }

  // Validate privacy policy is provided and is boolean-like
  if (data.acceptPrivacyPolicy === undefined || data.acceptPrivacyPolicy === null) {
    errors.push("Privacy policy selection is required");
  } else if (
    ![true, false, "true", "false"].includes(data.acceptPrivacyPolicy)
  ) {
    errors.push("Privacy policy must be true or false");
  }

  // Validate phone number
  if (
    data.phoneNumber &&
    (data.phoneNumber.length < 10 || data.phoneNumber.length > 15)
  ) {
    errors.push("Phone number must be between 10-15 digits");
  }



  // Validate name lengths
  if (
    data.firstName &&
    (data.firstName.length < 2 || data.firstName.length > 50)
  ) {
    errors.push("First name must be between 2-50 characters");
  }

  if (
    data.lastName &&
    (data.lastName.length < 2 || data.lastName.length > 50)
  ) {
    errors.push("Last name must be between 2-50 characters");
  }

  return errors;
};

// ========================= CONTROLLER FUNCTIONS =========================

const createContact = async (req, res) => {
  try {

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      zipCode,
      message,
      acceptPrivacyPolicy,
    } = req.body;

    // Validate input data
    const validationErrors = validateContactData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Prepare contact data
    const contactData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      country: country.trim(),
      zipCode: zipCode.trim(),
      message: message.trim(),
      acceptPrivacyPolicy:
        acceptPrivacyPolicy === true || acceptPrivacyPolicy === "true",
    };

    // Save to database
    const newContact = new Contact(contactData);
    const savedContact = await newContact.save();

    // Send emails
    const emailResults = {
      admin: { success: false, error: null },
      client: { success: false, error: null },
    };

    // Send admin notification
    try {
      emailResults.admin = await sendAdminNotification(savedContact);
    } catch (adminEmailError) {
      emailResults.admin.error = adminEmailError.message;
    }

    // Send client confirmation
    try {
      emailResults.client = await sendClientConfirmation(savedContact);
    } catch (clientEmailError) {
      emailResults.client.error = clientEmailError.message;
    }

    // Generate reference ID
    const referenceId = `#${savedContact._id
      .toString()
      .slice(-8)
      .toUpperCase()}`;

    // Success response
    res.status(201).json({
      success: true,
      message: "Your message has been successfully submitted!",
      data: {
        id: savedContact._id,
        referenceId: referenceId,
        submittedAt: savedContact.createdAt,
        fullName: savedContact.fullName,
        email: savedContact.email,
        emailStatus: {
          adminNotified: emailResults.admin.success,
          confirmationSent: emailResults.client.success,
        },
      },
    });


  } catch (error) {

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const mongooseErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: mongooseErrors,
      });
    }

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A contact with this email already exists",
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: "Failed to submit your message. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllContacts = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const contacts = await Contact.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await Contact.countDocuments(filter);



    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id).select("-__v");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch contact",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "in-progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }



    res.json({
      success: true,
      message: "Contact status updated successfully",
      data: updatedContact,
    });
  } catch (error) {

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update contact status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }



    res.json({
      success: true,
      message: "Contact deleted successfully",
      data: { id: deletedContact._id },
    });
  } catch (error) {

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete contact",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getContactStats = async (req, res) => {
  try {

    // Get status distribution
    const statusStats = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total counts
    const totalContacts = await Contact.countDocuments();
    const todayContacts = await Contact.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    // Get this month's contacts
    const thisMonthContacts = await Contact.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    // Format status counts
    const statusCounts = {
      pending: 0,
      "in-progress": 0,
      resolved: 0,
      closed: 0,
    };

    statusStats.forEach((stat) => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        total: totalContacts,
        today: todayContacts,
        thisMonth: thisMonthContacts,
        byStatus: statusCounts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
};
