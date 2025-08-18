const DecodeProgram = require("../models/decodeProgram");
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