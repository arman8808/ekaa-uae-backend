const familyConsitalionRegistration = require("../models/family.consitalation.registration.modal");
const { sendRegistrationEmails } = require("../utils/mailer");
// const { sendRegistrationEmails } = require('../services/emailService');

// Doctor email mapping
const DOCTOR_EMAIL_MAP = {
  "Dr Aiyasawmy's": "Aiyasawmy@gmail.com",
  "Dr Manoj's": "docbhardwaj@gmail.com",
  "Dr. Sonia Gupte's": "Sonia@enso-nia.com",
};


exports.createRegistration = async (req, res) => {
  try {
    const { session, fullName, email, phone } = req.body;

    const doctorEmail =
      DOCTOR_EMAIL_MAP[session.organisedby] || "default@example.com";

    const registrationData = {
      sessionId: session.id,
      event: session.Event,
      date: session.Date,
      location: session.Location,
      organisedBy: session.organisedby,
      organiserEmail: session.organiserEmail,
      fullName,
      email,
      phone,
    };

    // Save to database
    const newRegistration = new familyConsitalionRegistration(registrationData);
    await newRegistration.save();
   const emailData = {
      ...registrationData,
      _id: newRegistration._id
    };

    // Send emails
    const emailSent = await sendRegistrationEmails(emailData);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Registration saved but email sending failed'
      });
    }
    res.status(201).json({
      success: true,
      message: "Registration successful!",
      registration: newRegistration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

exports.getAllRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { event: { $regex: search, $options: "i" } },
            { organisedBy: { $regex: search, $options: "i" } },
            { organiserEmail: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const registrations = await familyConsitalionRegistration
      .find(searchQuery)
      .sort({ createdAt: -1 }) // Always show newest first
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await familyConsitalionRegistration.countDocuments(
      searchQuery
    );

    res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
      error: error.message,
    });
  }
};

exports.getRegistrationById = async (req, res) => {
  try {
    const registration = await familyConsitalionRegistration.findById(
      req.params.id
    );
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }
    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch registration",
      error: error.message,
    });
  }
};
exports.downloadRegistrationsCSV = async (req, res) => {
  try {
    // Date filter parameters
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build filter
    const filter = {};
    
    // Add date filter if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) {
        // Include the entire end date by setting to end of day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }

    // Search filter
    const search = req.query.search || "";
    if (search) {
      filter.$or = [
        { event: { $regex: search, $options: "i" } },
        { organisedBy: { $regex: search, $options: "i" } },
        { organiserEmail: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Get all registrations matching the filter
    const registrations = await familyConsitalionRegistration.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No registrations found matching the criteria",
      });
    }

    // Define CSV headers
    const headers = [
      'ID', 'Event', 'Date', 'Location', 'Organised By', 'Organiser Email',
      'Full Name', 'Email', 'Phone', 'Registration Date'
    ];

    // Convert registrations to CSV rows
    const rows = registrations.map(reg => [
      reg._id,
      `"${reg.event || ''}"`,
      `"${reg.date || ''}"`,
      `"${reg.location || ''}"`,
      `"${reg.organisedBy || ''}"`,
      `"${reg.organiserEmail || ''}"`,
      `"${reg.fullName || ''}"`,
      `"${reg.email || ''}"`,
      `"${reg.phone || ''}"`,
      `"${reg.createdAt.toISOString()}"`
    ]);

    // Combine headers and rows
    const csvData = [headers, ...rows].map(row => row.join(',')).join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=family_consultation_registrations.csv');
    
    // Send the CSV data
    res.status(200).send(csvData);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate CSV export",
    });
  }
};
exports.deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await familyConsitalionRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Delete the registration
    await familyConsitalionRegistration.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Registration deleted successfully",
      deletedRegistration: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete registration",
      error: error.message,
    });
  }
};