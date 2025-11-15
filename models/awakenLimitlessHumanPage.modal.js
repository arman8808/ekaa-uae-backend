const mongoose = require('mongoose');

const UpcomingEventSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
    validate: {
      validator: function(endDate) {
        // Only validate if both dates exist
        if (!endDate || !this.startDate) return true;
        return endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  eventName: {
    type: String,
    required: [true, "Event name is required"],
    minlength: [5, 'Event name must be at least 5 characters']
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    minlength: [3, 'Location must be at least 3 characters']
  },
  organiser: {
    type: String,
    required: [true, "Organizer name is required"],
    minlength: [3, 'Organizer name must be at least 3 characters']
  },
  organizerEmail: {
    type: String,
    required: [true, "Organizer email is required"],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  price: {
    type: String,
    required: [false, "Price is required"],
    match: [/^\$?\d+(\.\d{1,2})?$/, 'Price must be in currency format']
  },
  paymentLink: {
    type: String,
    required: [true, "Payment link is required"],
    validate: {
      validator: function(v) {
        if (!v) return true;
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
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
    required: [true, 'Section title is required'],
    minlength: [5, 'Section title must be at least 5 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    validate: {
      validator: function(v) {
        // Remove HTML tags and check length
        const textContent = v.replace(/<[^>]*>/g, '').trim();
        return textContent.length >= 10;
      },
      message: 'Content must be at least 10 characters (excluding HTML)'
    }
  }
});

const AwakenLimitlessHumanPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [5, 'Title must be at least 5 characters']
  },
  subtitle: {
    type: String,
    required: [true, 'Subtitle is required'],
    minlength: [5, 'Subtitle must be at least 5 characters']
  },
  videoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  thumbnail: {
    type: String
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    minlength: [3, 'Duration must be at least 3 characters']
  },
  cardPoints: [{
    type: String,
    required: [true, 'Card point is required'],
    validate: {
      validator: function(v) {
        // Remove HTML tags and check length
        const textContent = v.replace(/<[^>]*>/g, '').trim();
        return textContent.length >= 5;
      },
      message: 'Card point must be at least 5 characters (excluding HTML)'
    }
  }],
  learningSections: [LearningSectionSchema],
  upcomingEvents: {
    type: [UpcomingEventSchema],
    default: [],
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  }
}, { timestamps: true });

module.exports = mongoose.model('AwakenLimitlessHumanPage', AwakenLimitlessHumanPageSchema);