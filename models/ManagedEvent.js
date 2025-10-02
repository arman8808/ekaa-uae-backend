const mongoose = require("mongoose");

const managedEventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: [true, "Event is required"],
      trim: true,
    },
    level: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (v) {
          if (this.startDate) {
            return v >= this.startDate;
          }
          return true;
        },
        message: "End date must be on or after start date",
      },
    },
    // Additional requested fields
    location: {
      type: String,
      trim: true,
      default: "",
    },
    conductedBy: {
      type: String,
      trim: true,
      default: "",
    },
    totalParticipants: {
      type: Number,
      min: 0,
      default: 0,
    },
    programFees: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: ["Open", "Closed"],
        message: "{VALUE} is not a valid status",
      },
      default: "Open",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ManagedEvent", managedEventSchema);


