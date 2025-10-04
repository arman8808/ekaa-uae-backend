const DecodeRegistration = require("../models/DecodeRegistration");
const { sendProgramAdminNotification, sendProgramUserConfirmation } = require("../utils/mailer");

exports.createDecodeRegistration = async (req, res) => {
  try {
    const registration = new DecodeRegistration({ ...req.body });
    await registration.save();
    await sendProgramAdminNotification("Decode", registration);
    await sendProgramUserConfirmation("Decode", registration);
    res.status(201).json({ success: true, message: "Decode registration successful!", data: registration });
  } catch (error) {
    res.status(400).json({ success: false, message: "Registration failed.", error: error.message });
  }
};

exports.getDecodeRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalRegistrations = await DecodeRegistration.countDocuments();
    const totalPages = Math.ceil(totalRegistrations / limit);
    const registrations = await DecodeRegistration.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      message: "Decode registrations fetched successfully.",
      data: registrations,
      pagination: {
        currentPage: page,
        totalPages,
        totalRegistrations,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch Decode registrations.", error: error.message });
  }
};

exports.getDecodeRegistrationById = async (req, res) => {
  try {
    const registration = await DecodeRegistration.findById(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: "Decode registration not found" });
    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch Decode registration", error: error.message });
  }
};

exports.downloadDecodeByDateRange = async (req, res) => {
    try {
      // Date filter parameters
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
  console.log("startDate", startDate);
  console.log("endDate", endDate);
      // Build filter
      const filter = {};
      
      // Add date filter if provided
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startDate;
        if (endDate) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = endOfDay;
        }
      }
  
      // Search filter
      const search = req.query.search || "";
      if (search) {
        filter.$or = [
          { city: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
  
      // Get all registrations matching the filter
      const registrations = await DecodeRegistration.find(filter)
        .sort({ createdAt: -1 })
        .lean();
  
      if (registrations.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No registrations found matching the criteria",
        });
      }
  
      // Update CSV headers to match your actual schema
      const headers = [
        'ID', 'First Name', 'Middle Name', 'Last Name', 'Name as Certificate',
        'Current Address', 'Permanent Address', 'City', 'Timeslot', 'Telephone',
        'Mobile', 'Email', 'Date of Birth', 'Occupation', 'Course Date',
        'Course Time', 'Course Venue', 'Hear About', 'Communication Preferences',
        'Terms Accepted', 'Level Name', 'Registration Date'
      ];
  console.log("headers", headers);
      // Convert registrations to CSV rows matching your schema
      const rows = registrations.map(reg => [
        reg._id,
        `"${reg.firstName || ''}"`,
        `"${reg.middleName || ''}"`,
        `"${reg.lastName || ''}"`,
        `"${reg.nameAsCertificate || ''}"`,
        `"${reg.currentAddress || ''}"`,
        `"${reg.permanenetAddress || ''}"`, // Note: typo in field name
        `"${reg.city || ''}"`,
        `"${reg.timeslot || ''}"`,
        `"${reg.TelNo || ''}"`,
        `"${reg.mobileNo || ''}"`,
        `"${reg.email || ''}"`,
        reg.dob ? `"${reg.dob.toISOString().split('T')[0]}"` : '',
        `"${reg.occupation || ''}"`,
        `"${reg.courseDetailDate || ''}"`,
        `"${reg.courseDetailTime || ''}"`,
        `"${reg.courseDetailVenue || ''}"`,
        `"${reg.hearAbout || ''}"`,
        reg.communicationPreferences ? 'Yes' : 'No',
        reg.termsandcondition ? 'Yes' : 'No', // Note: lowercase in your schema
        `"${reg.levelName || ''}"`,
        `"${reg.createdAt.toISOString()}"`
      ]);
  
      // Combine headers and rows
      const csvData = [headers, ...rows].map(row => row.join(',')).join('\n');
  
      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=decode_registrations.csv');
      console.log("csvData", csvData);
      // Send the CSV data
      res.status(200).send(csvData);
  
    } catch (error) {
      console.error("Download registrations CSV error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate CSV export",
      });
    }
  };


