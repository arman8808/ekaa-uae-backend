const mongoose = require("mongoose");

const TassoSchema = new mongoose.Schema(
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
    videoUrl: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    thumbnail: {
      type: String,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      minlength: [3, "Duration must be at least 3 characters"],
    },
    cardPoints: [
      {
        type: String,
        required: [true, "Card point is required"],
        validate: {
          validator: function (v) {
            // Remove HTML tags and check length
            const textContent = v.replace(/<[^>]*>/g, "").trim();
            return textContent.length >= 5;
          },
          message: "Card point must be at least 5 characters (excluding HTML)",
        },
      },
    ],

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tasso", TassoSchema);
