const FamilyEvent = require("../models/familyEvent");
const HypnotherapyProgram = require("../models/HypnotherapyProgram");
const DecodeProgram = require("../models/decodeProgram");

// Get all open events (future dates only)
exports.getOpenEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day



    // 1. Get Family Events (using new schema with startDate/endDate)
    const familyEvents = await FamilyEvent.find({
      status: "Open",
      endDate: { $gte: today }, // Events that end today or later
    }).sort({ startDate: 1 }); // Sort by start date ascending



    // 2. Get Hypnotherapy Events
    const hypnoPrograms = await HypnotherapyProgram.find({ status: "Open" });

    
    const validHypnoEvents = hypnoPrograms.flatMap((program) => {

      
      if (!program.upcomingEvents || program.upcomingEvents.length === 0) {
        return [];
      }
      
      return program.upcomingEvents
        .filter((event) => {
          // Filter events that start today or later, OR are currently happening
          if (!event.startDate || !event.endDate) {
  
            return false;
          }
          
          const eventStartDate = new Date(event.startDate);
          const eventEndDate = new Date(event.endDate);
          
          // Event is valid if:
          // 1. It starts today or later (upcoming), OR
          // 2. It started before today but ends today or later (currently happening)
          const isUpcoming = eventStartDate >= today;
          const isCurrentlyHappening = eventStartDate <= today && eventEndDate >= today;
          const isValid = isUpcoming || isCurrentlyHappening;
          

          return isValid;
        })
        .map((event) => ({
          ...event.toObject(),
          programTitle: program.title,
          programType: "hypnotherapy",
          // For consistent response format
          event: event.eventName,
          organisedby: event.organiser,
          // Calculate duration in hours for display
          duration: Math.round(
            (new Date(event.endDate) - new Date(event.startDate)) /
              (1000 * 60 * 60)
          ),
        }));
    });



    // 3. Get Decode Events
    const decodePrograms = await DecodeProgram.find({ status: "Open" });

    
    const validDecodeEvents = decodePrograms.flatMap((program) => {
      if (!program.upcomingEvents || program.upcomingEvents.length === 0) {
        return [];
      }
      
      return program.upcomingEvents
        .filter((event) => {
          // Filter events that start today or later, OR are currently happening
          if (!event.startDate || !event.endDate) {
            return false;
          }
          
          const eventStartDate = new Date(event.startDate);
          const eventEndDate = new Date(event.endDate);
          
          // Event is valid if:
          // 1. It starts today or later (upcoming), OR
          // 2. It started before today but ends today or later (currently happening)
          const isUpcoming = eventStartDate >= today;
          const isCurrentlyHappening = eventStartDate <= today && eventEndDate >= today;
          return isUpcoming || isCurrentlyHappening;
        })
        .map((event) => ({
          ...event.toObject(),
          programTitle: program.title,
          programType: "decode",
          // For consistent response format
          event: event.eventName,
          organisedby: event.organiser,
          // Calculate duration in hours for display
          duration: Math.round(
            (new Date(event.endDate) - new Date(event.startDate)) /
              (1000 * 60 * 60)
          ),
        }));
    });



    // Combine all events
    const allEvents = [
      ...familyEvents.map((event) => ({
        ...event.toObject(),
        programType: "family",
        // Calculate duration in hours for display
        duration: Math.round(
          (new Date(event.endDate) - new Date(event.startDate)) /
            (1000 * 60 * 60)
        ),
      })),
      ...validHypnoEvents,
      ...validDecodeEvents,
    ];



    // Sort all events by start date (ascending)
    allEvents.sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });

    // Format dates consistently for response
    const formattedEvents = allEvents.map((event) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      return {
        ...event,
        // Format dates for display
        formattedStartDate: startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        formattedStartTime: startDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        formattedEndTime: endDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        // For backward compatibility with old date field
        date: startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    });


    res.json(formattedEvents);
  } catch (error) {

    res.status(500).json({ message: "Server error", error: error.message });
  }
};
