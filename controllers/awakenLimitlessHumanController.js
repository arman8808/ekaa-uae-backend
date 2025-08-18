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
