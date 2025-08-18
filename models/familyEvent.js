const mongoose = require("mongoose");
const { isEmail } = require("validator");

const eventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: [true, "Event name is required"],
      default: "Family Constellation",
    },
    // Keep the old date field for backward compatibility
    date: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional now
          return /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2},\s\d{4}$/.test(
            v
          );
        },
        message: (props) =>
          `${props.value} is not a valid date format (MMM DD, YYYY)`,
      },
    },
    // Add new date fields
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (v) {
          // For new documents, validate against startDate
          if (this.startDate) {
            return v >= this.startDate;
          }
          // For updates, we'll handle validation in the controller
          return true;
        },
        message: "End date must be on or after start date",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      minLength: [3, "Location must be at least 3 characters"],
    },
    capacity: {
      type: String,
      required: [true, "Capacity is required"],
      validate: {
        validator: function (v) {
          return /^\d+\sSeats?$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid capacity format (e.g., "10 Seats")`,
      },
    },
    organisedby: {
      type: String,
      required: [true, "Organizer name is required"],
      minLength: [3, "Organizer name must be at least 3 characters"],
    },
    organiserEmail: {
      type: String,
      required: [true, "Organizer email is required"],
      validate: [isEmail, "Please enter a valid email"],
    },
    price: {
      type: String,
      required: [true, "Price is required"],
      validate: {
        validator: function (v) {
          return /^\$\s?\d+(,\d{3})*(\.\d{2})?$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid price format (e.g., "$375", "$ 375", or "$375.00")`,
      },
    },
    paymentLink: {
      type: String,
      required: [true, "Payment link is required"],
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid URL`,
      },
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Open", "Closed"],
        message: "{VALUE} is not a valid status",
      },
      default: "Open",
    },
    facilitator: {
      type: String,
      default: "",
    },
    externalLink: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z]{2,})([\/\w \.\-?=&%\[\]]*)*\/?$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid URL`,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FamilyEvent", eventSchema);
