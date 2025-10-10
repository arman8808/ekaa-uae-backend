const mongoose = require('mongoose');

const RegistrationFormSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    connectedWith: { type: String, trim: true, default: '' },
    selectedTrainings: { type: [String], required: true, default: [] },
    meta: {
      ip: { type: String },
      userAgent: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Prevent duplicate exact registrations by email + phone
RegistrationSchema.index({ email: 1, phone: 1 }, { unique: false });

// Export model
module.exports = mongoose.model('RegistrationForm', RegistrationFormSchema);
