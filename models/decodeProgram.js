const mongoose = require('mongoose');

const UpcomingEventSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: function() {
      // Only require if the parent document has upcomingEvents
      return this.parent().upcomingEvents && this.parent().upcomingEvents.length > 0;
    }
  },
  endDate: {
    type: Date,
    required: function() {
      // Only require if the parent document has upcomingEvents
      return this.parent().upcomingEvents && this.parent().upcomingEvents.length > 0;
    },
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
    required: function() {
      return this.parent().upcomingEvents && this.parent().upcomingEvents.length > 0;
    },
    minlength: [5, 'Event name must be at least 5 characters']
  },
  location: {
    type: String,
    required: function() {
      return this.parent().upcomingEvents && this.parent().upcomingEvents.length > 0;
    },
    minlength: [3, 'Location must be at least 3 characters']
  },
  organiser: {
    type: String,
    required: function() {
      return this.parent().upcomingEvents && this.parent().upcomingEvents.length > 0;
    },
    minlength: [3, 'Organizer name must be at least 3 characters']
  },
  price: {
    type: String,
    required: function() {
      return this.parent().upcomingEvents && this.parent().upcomingEvents.length > 0;
    },
    match: [/^\$?\d+(\.\d{1,2})?$/, 'Price must be in currency format']
  },
  paymentLink: {
    type: String,
    required: function() {
      return this.parent().upcomingEvents && this.parent().upcomingEvents.length > 0;
    },
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Invalid URL format']
  }
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

const DecodeProgramSchema = new mongoose.Schema({
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
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
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
    default: undefined // Makes the array optional
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  }
}, { timestamps: true });

module.exports = mongoose.model('DecodeProgram', DecodeProgramSchema);