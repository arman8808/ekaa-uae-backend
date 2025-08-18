const Registration = require("../models/Registration");
const {
  sendRegistrationEmail,
  sendUserConfirmationEmail,
} = require(".././utils/mailer");
const EVENT_DOCTOR_MAP = {
  "Decode The Child": "Dr Aiyasawmy's A/C",
  "L 1": "Dr. Sonia Gupte",
};
const PAYMENT_LINK_MAP = {
  // "Dr Manoj's A/C": "https://buy.stripe.com/xxxx_for_manoj",
  "Dr Aiyasawmy's A/C": "https://buy.stripe.com/6oU6ozgGsc45cfCgYj93y02",
  "Dr. Sonia Gupte": "https://buy.stripe.com/14A3cxdvCbBn8qU32O7Vm0z",
};
exports.createRegistration = async (req, res) => {
  try {
    const idPhotofrontPath = req.files.idPhotofront[0].path;
    const idphotobackPath = req.files.idphotoback?.[0]?.path;
    const profilePhotoPath = req.files.profileImage[0].path;

    const registrationData = {
      ...req.body,
      idPhotofront: idPhotofrontPath,
      idphotoback: idphotobackPath,
      profileImage: profilePhotoPath,
    };

    const registration = new Registration(registrationData);
    await registration.save();

    // Send notification email to admin
    await sendRegistrationEmail(registration);

    // determine payment link for user
    const cityParts = registration.city?.split("|") || [];
    const eventName = cityParts[1]?.trim();
    const doctorKey = EVENT_DOCTOR_MAP[eventName];
    
    const paymentLink =
      PAYMENT_LINK_MAP[doctorKey] || "https://buy.stripe.com/default_link";
    await sendUserConfirmationEmail(registration, paymentLink);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
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

exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({createdAt:-1});
    res.status(200).json({
      success: true,
      message: "Registrations fetched successfully.",
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations.",
      error: error.message,
    });
  }
};
