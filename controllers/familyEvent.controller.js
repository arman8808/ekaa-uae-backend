const asyncHandler = require("express-async-handler");
const familyEvent = require("../models/familyEvent");

// Helper function to format date for display
const formatLegacyDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const { search } = req.query;

  let query = {};

  if (search) {
    query = {
      $or: [
        { location: { $regex: search, $options: "i" } },
        { organisedby: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { date: { $regex: search, $options: "i" } },
        { "facilitator": { $regex: search, $options: "i" } }
      ],
    };
  }

  const events = await familyEvent
    .find(query)
    .sort({ startDate: 1 }) // Sort by startDate in ascending order
    .lean() // Convert to plain JavaScript objects
    .exec();

  // Format dates for display
  const formattedEvents = events.map(event => {
    // For backward compatibility, include the old date format if it exists
    if (!event.date && event.startDate) {
      event.date = formatLegacyDate(event.startDate);
    }
    return event;
  });

  res.json({
    events: formattedEvents,
    totalEvents: formattedEvents.length,
  });
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    location,
    capacity,
    organisedby,
    organiserEmail,
    price,
    paymentLink,
    status,
    facilitator,
    externalLink,
  } = req.body;

  // Convert to Date objects and validate
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end <= start) {
    res.status(400);
    throw new Error("End date must be after start date");
  }

  const event = await familyEvent.create({
    event: "Family Constellation",
    startDate: start,
    endDate: end,
    location,
    capacity,
    organisedby,
    organiserEmail,
    price,
    paymentLink,
    status,
    facilitator,
    externalLink,
  });

  res.status(201).json(event);
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  const event = await familyEvent.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Convert string dates to Date objects if they exist in the request
  let startDate, endDate;
  
  if (req.body.startDate) {
    startDate = new Date(req.body.startDate);
    if (isNaN(startDate.getTime())) {
      res.status(400);
      throw new Error("Invalid start date format");
    }
    req.body.startDate = startDate;
  }
  
  if (req.body.endDate) {
    endDate = new Date(req.body.endDate);
    if (isNaN(endDate.getTime())) {
      res.status(400);
      throw new Error("Invalid end date format");
    }
    req.body.endDate = endDate;
  }

  // Validate date relationships
  if (startDate && endDate) {
    // Both dates are being updated
    if (endDate < startDate) {
      res.status(400);
      throw new Error("End date must be on or after start date");
    }
  } else if (startDate && !endDate) {
    // Only startDate is being updated
    if (startDate >= event.endDate) {
      res.status(400);
      throw new Error("New start date must be before existing end date");
    }
  } else if (endDate && !startDate) {
    // Only endDate is being updated
    if (endDate <= event.startDate) {
      res.status(400);
      throw new Error("End date must be after start date");
    }
  }

  const updatedEvent = await familyEvent.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedEvent);
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await familyEvent.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  await event.deleteOne();

  res.json({ message: "Event removed" });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = asyncHandler(async (req, res) => {
  const event = await familyEvent.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // For backward compatibility
  if (!event.date && event.startDate) {
    event.date = formatLegacyDate(event.startDate);
  }

  res.json(event);
});

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
};