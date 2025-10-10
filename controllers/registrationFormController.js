const RegistrationForm = require('../models/RegistrationForm');

/**
 * Basic validation helper.
 * Keeps server-side validation simple and aligned with react-hook-form rules.
 */
function validatePayload(payload) {
  const errors = [];

  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim();
  const phone = (payload.phone || '').trim();
  const selectedTrainings = Array.isArray(payload.selectedTrainings) ? payload.selectedTrainings : [];

  if (!name) errors.push('Full name is required.');
  else if (name.length < 3) errors.push('Name must be at least 3 characters.');

  // basic email regex (sufficient for server-side sanity checking)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) errors.push('Email is required.');
  else if (!emailRegex.test(email)) errors.push('Email is invalid.');

  const digits = phone.replace(/\D/g, '');
  if (!phone) errors.push('Phone number is required.');
  else if (digits.length < 7 || digits.length > 15) errors.push('Phone number must be between 7 and 15 digits.');

  if (selectedTrainings.length === 0) errors.push('At least one program level must be selected.');

  return errors;
}

exports.createRegistrationForm = async (req, res) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    connectedWith: req.body.connectedWith,
    selectedTrainings: req.body.selectedTrainings,
  };

  // Validate
  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      status: 'error',
      errors: validationErrors,
    });
  }

  // Sanitize / normalize
  payload.email = payload.email.toLowerCase().trim();
  payload.phone = (payload.phone || '').trim();
  payload.name = (payload.name || '').trim();

  // Add meta
  const meta = {
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent') || '',
  };

  // Optional duplicate detection: try to find existing by email+phone
  const existing = await RegistrationForm.findOne({ email: payload.email, phone: payload.phone }).exec();
  if (existing) {
    // You may choose to return 409 or continue and create a new doc.
    return res.status(409).json({
      message: 'A registration with the same email and phone already exists.',
      status: 'conflict',
      data: { id: existing._id },
    });
  }

  // Create
  const doc = new RegistrationForm({
    ...payload,
    meta,
  });

  const saved = await doc.save();

  // Respond with useful payload; frontend expects `response.data.message`
  return res.status(201).json({
    message: 'Registration received successfully.',
    status: 'success',
    data: {
      id: saved._id,
      createdAt: saved.createdAt,
    },
  });
};
