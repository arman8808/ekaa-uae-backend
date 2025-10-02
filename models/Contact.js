const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
      index: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      minlength: [10, "Phone number must be at least 10 digits"],
      maxlength: [15, "Phone number cannot exceed 15 digits"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: [50, "Country name cannot exceed 50 characters"],
    },
    zipCode: {
      type: String,
      required: [true, "Zip code is required"],
      trim: true,
      maxlength: [10, "Zip code cannot exceed 10 characters"],
    },
    message: {
      type: String,
      required: [false, "Message is required"],
      trim: true,
    },
    acceptPrivacyPolicy: {
      type: Boolean,
      required: [true, "Privacy policy selection is required"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "closed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for optimized queries
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });

// Virtual for full name
contactSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted creation date
contactSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

module.exports = mongoose.model("Contact", contactSchema);
