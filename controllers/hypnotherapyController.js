const HypnotherapyProgram = require('../models/HypnotherapyProgram');
const fs = require('fs');
const path = require('path');

// Helper function to process form data
const processProgramData = (req) => {
  let programData;
  
  if (req.file) {
    programData = JSON.parse(JSON.stringify(req.body));
    
    if (programData.cardPoints) {
      programData.cardPoints = JSON.parse(programData.cardPoints);
    }
    if (programData.learningSections) {
      programData.learningSections = JSON.parse(programData.learningSections);
    }
    if (programData.upcomingEvents) {
      programData.upcomingEvents = JSON.parse(programData.upcomingEvents);
      
      // Filter out any empty event objects
      programData.upcomingEvents = programData.upcomingEvents.filter(event => 
        event && (event.startDate || event.endDate || event.eventName || 
                 event.location || event.organiser || event.price || event.paymentLink)
      );
      
      // Convert legacy date format if needed
      programData.upcomingEvents = programData.upcomingEvents.map(event => {
        if (event.date && !event.startDate) {
          const eventDate = new Date(event.date);
          const endDate = new Date(eventDate);
          endDate.setHours(eventDate.getHours() + 2);
          
          return {
            ...event,
            startDate: eventDate,
            endDate: endDate,
            date: undefined
          };
        }
        return event;
      });
    } else {
      programData.upcomingEvents = []; // Ensure it's an empty array if not provided
    }
    
    programData.thumbnail = req.file.filename;
  } else {
    programData = req.body;
    
    if (programData.upcomingEvents) {
      // Filter out any empty event objects
      programData.upcomingEvents = programData.upcomingEvents.filter(event => 
        event && (event.startDate || event.endDate || event.eventName || 
                 event.location || event.organiser || event.price || event.paymentLink)
      );
      
      // Convert legacy date format if needed
      programData.upcomingEvents = programData.upcomingEvents.map(event => {
        if (event.date && !event.startDate) {
          const eventDate = new Date(event.date);
          const endDate = new Date(eventDate);
          endDate.setHours(eventDate.getHours() + 2);
          
          return {
            ...event,
            startDate: eventDate,
            endDate: endDate,
            date: undefined
          };
        }
        return event;
      });
    } else {
      programData.upcomingEvents = []; // Ensure it's an empty array if not provided
    }
  }
  
  return programData;
};

// Get all programs with search
exports.getPrograms = async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    const query = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ]
    };

    const programs = await HypnotherapyProgram.find(query)
      .sort({ createdAt: -1 });

    res.json({
      programs,
      totalPrograms: programs.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new program
exports.createProgram = async (req, res) => {
  try {
    const programData = processProgramData(req);
    const program = new HypnotherapyProgram(programData);
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
    let oldThumbnail = null;
    
    // Get the current program to check for existing thumbnail
    const currentProgram = await HypnotherapyProgram.findById(req.params.id);
    if (currentProgram && currentProgram.thumbnail) {
      oldThumbnail = currentProgram.thumbnail;
    }
    
    const programData = processProgramData(req);
    
    // If no new thumbnail is provided, keep the existing one
    if (!req.file && oldThumbnail) {
      programData.thumbnail = oldThumbnail;
    }
    
    const program = await HypnotherapyProgram.findByIdAndUpdate(
      req.params.id,
      programData,
      { new: true, runValidators: true }
    );
    
    if (!program) {
      // Clean up the new thumbnail if program wasn't found
      if (req.file) {
        fs.unlinkSync(path.join('uploads', req.file.filename));
      }
      return res.status(404).json({ message: 'Program not found' });
    }
    
    // Delete old thumbnail if it was replaced
    if (req.file && oldThumbnail) {
      try {
        fs.unlinkSync(path.join('uploads', oldThumbnail));
      } catch (err) {

      }
    }
    
    res.json(program);
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
    const program = await HypnotherapyProgram.findByIdAndDelete(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    // Delete associated thumbnail if it exists
    if (program.thumbnail) {
      try {
        fs.unlinkSync(path.join('uploads', program.thumbnail));
      } catch (err) {

      }
    }
    
    res.json({ message: 'Program deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single program by ID
exports.getProgramById = async (req, res) => {
  try {
    const program = await HypnotherapyProgram.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};