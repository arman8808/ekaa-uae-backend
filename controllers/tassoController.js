const DecodeProgram = require("../models/tasso.modal");
const fs = require("fs");
const path = require("path");

// Enhanced helper to parse and transform form data
const parseFormDataFields = (body) => {
  const parsed = { ...body };
  
  // Fields that might be JSON strings
  const arrayFields = ["cardPoints", "learningSections", "upcomingEvents"];
  
  arrayFields.forEach((field) => {
    if (typeof body[field] === "string") {
      try {
        parsed[field] = JSON.parse(body[field]);
      } catch (e) {
        console.error(`Error parsing ${field}:`, e);
        parsed[field] = [];
      }
    }
  });

      // Convert legacy data format if needed
    if (parsed.learningSections) {
      parsed.learningSections = parsed.learningSections.map(section => {
        // Convert old points array to content if needed
        if (section.points && !section.content) {
          return {
            title: section.title,
            content: `<ul>${section.points.map(point => `<li>${point}</li>`).join('')}</ul>`
          };
        }
        return section;
      });
    }

    // Handle organizerEmail field for upcomingEvents
    if (parsed.upcomingEvents) {
      parsed.upcomingEvents = parsed.upcomingEvents.map(event => {
        // Ensure organizerEmail is present, if not set a default or make it required
        if (!event.organizerEmail) {
          // You can set a default email or throw an error
          // For now, we'll set a placeholder that should be updated
          event.organizerEmail = 'admin@example.com'; // Default placeholder
        }
        return event;
      });
    }

  if (parsed.upcomingEvents) {
    // Filter out empty events
    parsed.upcomingEvents = parsed.upcomingEvents.filter(event => {
      return event.startDate || event.endDate || event.eventName || 
             event.location || event.organiser || event.price || event.paymentLink;
    });

    // Convert legacy date format if needed
    parsed.upcomingEvents = parsed.upcomingEvents.map(event => {
      if (event.date && !event.startDate) {
        const eventDate = new Date(event.date);
        const endDate = new Date(eventDate);
        endDate.setHours(eventDate.getHours() + 2); // Default 2-hour duration
        
        return {
          ...event,
          startDate: eventDate,
          endDate: endDate,
          date: undefined // Remove old field
        };
      }
      return event;
    });
  }

  return parsed;
};

// Get all programs with pagination and search
exports.getPrograms = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const currentDate = new Date();

    const query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ],
    };

    const programs = await DecodeProgram.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await DecodeProgram.countDocuments(query);

    res.json({
      programs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalPrograms: count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new program
exports.createProgram = async (req, res) => {
  try {
    const parsedBody = parseFormDataFields(req.body);

    const programData = {
      ...parsedBody,
      thumbnail: req.file ? req.file.filename : null,
    };

    const program = new DecodeProgram(programData);
    await program.save();
    res.status(201).json(program);
  } catch (err) {
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(path.join('uploads', req.file.filename));
    }
    res.status(400).json({ message: err.message });
  }
};

// Update a program
exports.updateProgram = async (req, res) => {
  try {
    const program = await DecodeProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    const parsedBody = parseFormDataFields(req.body);
    const updateData = { ...parsedBody };

    // Handle thumbnail update
    if (req.file) {
      // Delete old thumbnail if exists
      if (program.thumbnail) {
        const oldThumbnailPath = path.join('uploads', program.thumbnail);
        fs.unlink(oldThumbnailPath, (err) => {
          if (err) console.error("Failed to delete old thumbnail:", err);
        });
      }
      updateData.thumbnail = req.file.filename;
    }

    const updatedProgram = await DecodeProgram.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedProgram);
  } catch (err) {
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(path.join('uploads', req.file.filename));
    }
    res.status(400).json({ message: err.message });
  }
};

// Delete a program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await DecodeProgram.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // Delete associated thumbnail
    if (program.thumbnail) {
      const thumbnailPath = path.join('uploads', program.thumbnail);
      fs.unlink(thumbnailPath, (err) => {
        if (err) console.error("Failed to delete thumbnail:", err);
      });
    }

    res.json({ message: "Program deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single program by ID
exports.getProgramById = async (req, res) => {
  try {
    const program = await DecodeProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single program by ID for user panel (filtered - no expired events)
exports.getProgramByIdForUsers = async (req, res) => {
  try {
    const program = await DecodeProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // Check if program is active (status: 'Open') for user panel
    if (program.status !== 'Open') {
      return res.status(404).json({ message: "Program not found" });
    }

    const currentDate = new Date();
    const programCopy = program.toObject();

    // Filter out expired events from upcomingEvents array only
    if (programCopy.upcomingEvents && programCopy.upcomingEvents.length > 0) {
      const validEvents = programCopy.upcomingEvents.filter(event => {
        if (!event.endDate) return false; // Skip events without end date
        return new Date(event.endDate) >= currentDate;
      });

      // Update only the upcomingEvents array
      programCopy.upcomingEvents = validEvents;
    }

    res.json(programCopy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all programs for user panel (filtered - no expired events)
exports.getProgramsForUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const currentDate = new Date();

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { subtitle: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Always filter for active programs (status: 'Open') for user panel
    const query = {
      ...searchQuery,
      status: 'Open'
    };

    const programs = await DecodeProgram.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Show ALL programs, but filter only the upcomingEvents array
    const programsWithFilteredEvents = programs.map(program => {
      const programCopy = program.toObject();
      
      if (programCopy.upcomingEvents && programCopy.upcomingEvents.length > 0) {
        // Filter out expired events from upcomingEvents array only
        const validEvents = programCopy.upcomingEvents.filter(event => {
          if (!event.endDate) return false; // Skip events without end date
          return new Date(event.endDate) >= currentDate;
        });
        
        // Update only the upcomingEvents array
        programCopy.upcomingEvents = validEvents;
      }
      
      return programCopy;
    });

    const count = await DecodeProgram.countDocuments(query);

    res.json({
      programs: programsWithFilteredEvents,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalPrograms: count,
      totalProgramsReturned: programsWithFilteredEvents.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};