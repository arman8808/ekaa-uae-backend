const mongoose = require("mongoose");

const familyConsitalionRegistrationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  event: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  organisedBy: {
    type: String,
    required: true,
  },
  organiserEmail: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "familyConsitalionRegistration",
  familyConsitalionRegistrationSchema
);
