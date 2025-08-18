const mongoose = require("mongoose");

const UpcomingEventSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
    validate: {
      validator: function (value) {
        // Only validate if the field exists
        if (!value) return true;
        return value instanceof Date && !isNaN(value);
      },
      message: "Start date must be a valid date",
    },
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
    validate: {
      validator: function (endDate) {
        // Only validate if both dates exist
        if (!endDate || !this.startDate) return true;
        return endDate > this.startDate;
      },
      message: "End date must be after start date",
    },
  },
  eventName: {
    type: String,
    required: [true, "Event name is required"],
    minlength: [5, "Event name must be at least 5 characters"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    minlength: [3, "Location must be at least 3 characters"],
  },
  organiser: {
    type: String,
    required: [true, "Organizer name is required"],
    minlength: [3, "Organizer name must be at least 3 characters"],
  },
  price: {
    type: String,
    required: [true, "Price is required"],
    match: [/^\$?\d+(\.\d{1,2})?$/, "Price must be in currency format"],
  },
  paymentLink: {
    type: String,
    required: [true, "Payment link is required"],
    match: [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      "Invalid URL format",
    ],
  },
  status: {
    type: String,
    enum: ["Open", "Closed"],
    default: "Open",
  },
});

const LearningSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Section title is required"],
    minlength: [5, "Section title must be at least 5 characters"],
  },
  content: {
    type: String,
    required: [true, "Content is required"],
    minlength: [10, "Content must be at least 10 characters"],
  },
});

const HypnotherapyProgramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [5, "Title must be at least 5 characters"],
    },
    subtitle: {
      type: String,
      required: [true, "Subtitle is required"],
      minlength: [5, "Subtitle must be at least 5 characters"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      minlength: [3, "Duration must be at least 3 characters"],
    },
    videoUrl: {
      type: String,
      validate: {
        validator: function (v) {
          // URL is optional, but if provided must be valid
          if (!v) return true;
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: (props) => `${props.value} is not a valid URL`,
      },
    },
    thumbnail: {
      type: String,
    },
    cardPoints: [
      {
        type: String,
        required: [true, "Card point is required"],
      },
    ],
    learningSections: [LearningSectionSchema],
    upcomingEvents: {
      type: [UpcomingEventSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "HypnotherapyProgram",
  HypnotherapyProgramSchema
);
