const AwakenLimitlessHuman = require("../models/AwakenLimitlessHuman");
const {
  sendAwakenLimitlessHumanAdminNotification,
  sendAwakenLimitlessHumanUserConfirmation,
} = require("../utils/mailer");

exports.createAwakenLimitlessHumanRegistration = async (req, res) => {
  try {
    const registrationData = {
      ...req.body,
    };
    const registration = new AwakenLimitlessHuman(registrationData);
    await registration.save();

    // Send notification email to admin
    await sendAwakenLimitlessHumanAdminNotification(registration);

    // Send confirmation email to user (without payment link)
    await sendAwakenLimitlessHumanUserConfirmation(registration);

    res.status(201).json({
      success: true,
      message: "AWAKEN THE LIMITLESS HUMAN Registration successful!",
      data: registration,
    });
  } catch (error) {

    res.status(400).json({
      success: false,
      message: "Registration failed. Please check your input and try again.",
      error: error.message,
    });
  }
};

exports.getAwakenLimitlessHumanRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalRegistrations = await AwakenLimitlessHuman.countDocuments();
    const totalPages = Math.ceil(totalRegistrations / limit);

    const registrations = await AwakenLimitlessHuman.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "AWAKEN THE LIMITLESS HUMAN Registrations fetched successfully.",
      data: registrations,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalRegistrations: totalRegistrations,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch AWAKEN THE LIMITLESS HUMAN registrations.",
      error: error.message,
    });
  }
};

exports.getAwakenLimitlessHumanRegistrationById = async (req, res) => {
  try {
    const registration = await AwakenLimitlessHuman.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "AWAKEN THE LIMITLESS HUMAN Registration not found",
      });
    }
    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch AWAKEN THE LIMITLESS HUMAN registration",
      error: error.message,
    });
  }
};

// Download registrations within a date range as CSV
exports.downloadAwakenLimitlessHumanByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate query parameters are required (YYYY-MM-DD)",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Normalize to full days
    const startOfDay = new Date(start.setHours(0, 0, 0, 0));
    const endOfDay = new Date(end.setHours(23, 59, 59, 999));

    const registrations = await AwakenLimitlessHuman.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: 1 });

    // Prepare CSV
    const headers = [
      "firstName",
      "middleName",
      "lastName",
      "nameAsCertificate",
      "currentAddress",
      "permanenetAddress",
      "city",
      "timeslot",
      "TelNo",
      "mobileNo",
      "office",
      "email",
      "dob",
      "occupation",
      "courseDetailDate",
      "courseDetailTime",
      "courseDetailVenue",
      "hearAbout",
      "communicationPreferences",
      "termsandcondition",
      "levelName",
      "createdAt",
      "updatedAt",
      "_id",
    ];

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes('"') || str.includes(',') || str.includes("\n") || str.includes("\r")) {
        return '"' + str.replaceAll('"', '""') + '"';
      }
      return str;
    };

    const rows = registrations.map((doc) => {
      const obj = doc.toObject({ getters: true, virtuals: false });
      return headers
        .map((key) => {
          if (key === "dob" || key === "createdAt" || key === "updatedAt") {
            const val = obj[key];
            return escapeCsv(val ? new Date(val).toISOString() : "");
          }
          if (typeof obj[key] === "boolean") return escapeCsv(obj[key] ? "true" : "false");
          return escapeCsv(obj[key]);
        })
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\r\n");

    const filename = `awaken-limitless-human-${startOfDay.toISOString().slice(0, 10)}_to_${endOfDay
      .toISOString()
      .slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to download AWAKEN THE LIMITLESS HUMAN registrations",
      error: error.message,
    });
  }
};