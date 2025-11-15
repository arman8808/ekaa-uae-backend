const ManagedEvent = require("../models/ManagedEvent");

// Allowed options from UI
const EVENT_OPTIONS = [
  {
    value: "AWAKEN THE LIMITLESS HUMAN",
    label: "AWAKEN THE LIMITLESS HUMAN",
    hasLevels: true,
    levels: [
      "Level 1 | Basic Integrated Hypnosis Training",
      "Level 2 | Advanced Module for Behavioral Resolutions",
      "Level 3 | Advanced Modalities for Health Resolutions",
      "Level 4 | Metaphysical Hypnosis Training",
      "Level 5 | Hypnosis Training through Integrated Healing",
      "Level 6 | Advanced Module in Inner Child Healing",
    ],
  },
  {
    value: "Decode",
    label: "Decode",
    hasLevels: true,
    levels: [
      "Decode Your Mind",
      "Decode Your Behaviour",
      "Decode Your Relationships",
      "Decode Your Blue Print",
    ],
  },
  {
    value: "TASSO",
    label: "TASSO",
    hasLevels: true,
    levels: [
      "Module 1",
      "Module 2",
      "Module 3",
      "Module 4",
      "Module 5",
      "Module 6",
    ],
  },
  {
    value: "Family Constellation",
    label: "Family Constellation",
    hasLevels: false,
  },
  {
    value: "Specialized Workshop / Experiential Workshop",
    label: "Specialized Workshop / Experiential Workshop",
    hasLevels: false,
  },
];

const isValidEventPayload = ({ event, level }) => {
  const def = EVENT_OPTIONS.find((e) => e.value === event);
  if (!def) return { ok: false, message: "Invalid event" };
  if (def.hasLevels) {
    if (!level)
      return { ok: false, message: "Level is required for this event" };
    if (!def.levels.includes(level))
      return { ok: false, message: "Invalid level for selected event" };
  }
  return { ok: true };
};

exports.createManagedEvent = async (req, res) => {
  try {
    const {
      event,
      level,
      startDate,
      endDate,
      status,
      location,
      conductedBy,
      totalParticipants,
      programFees,
    } = req.body;
    const validation = isValidEventPayload({ event, level });
    if (!validation.ok) {
      return res
        .status(400)
        .json({ success: false, message: validation.message });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid dates" });
    }
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "endDate must be on or after startDate",
      });
    }

    const doc = await ManagedEvent.create({
      event,
      level: level || "",
      startDate: start,
      endDate: end,
      status: status || "Open",
      location: location || "",
      conductedBy: conductedBy || "",
      totalParticipants:
        typeof totalParticipants === "number" ? totalParticipants : 0,
      programFees: programFees || "",
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
};

exports.getManagedEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.event) {
      filter.event = req.query.event;
    }
    if (req.query.search) {
      const search = String(req.query.search).trim();
      if (search.length > 0) {
        const regex = { $regex: search, $options: "i" };
        filter.$or = [{ event: regex }, { level: regex }];
      }
    }

    const total = await ManagedEvent.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const data = await ManagedEvent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

exports.getManagedEventById = async (req, res) => {
  try {
    const doc = await ManagedEvent.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};

exports.updateManagedEvent = async (req, res) => {
  try {
    const {
      event,
      level,
      startDate,
      endDate,
      status,
      location,
      conductedBy,
      totalParticipants,
      programFees,
    } = req.body;

    if (event || level) {
      const validation = isValidEventPayload({
        event: event || req.body.event,
        level,
      });
      if (!validation.ok) {
        return res
          .status(400)
          .json({ success: false, message: validation.message });
      }
    }

    const updates = {};
    if (event !== undefined) updates.event = event;
    if (level !== undefined) updates.level = level;
    if (startDate !== undefined) updates.startDate = new Date(startDate);
    if (endDate !== undefined) updates.endDate = new Date(endDate);
    if (status !== undefined) updates.status = status;
    if (location !== undefined) updates.location = location;
    if (conductedBy !== undefined) updates.conductedBy = conductedBy;
    if (totalParticipants !== undefined)
      updates.totalParticipants = totalParticipants;
    if (programFees !== undefined) updates.programFees = programFees;

    if (
      updates.startDate &&
      updates.endDate &&
      updates.endDate < updates.startDate
    ) {
      return res.status(400).json({
        success: false,
        message: "endDate must be on or after startDate",
      });
    }

    const doc = await ManagedEvent.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updates,
      { new: true }
    );

    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
};

exports.softDeleteManagedEvent = async (req, res) => {
  try {
    const doc = await ManagedEvent.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    return res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
};

// Public listing for user panel: active events starting today or later, no pagination
exports.getManagedEventsForUserPanel = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await ManagedEvent.find({
      isDeleted: false,
      status: "Open",
      startDate: { $gte: today },
    }).sort({ startDate: 1 });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};
exports.getFamiluConitalationEventsForUserPanel = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await ManagedEvent.find({
      event: "Family Constellation",
      isDeleted: false,
      status: "Open",
      startDate: { $gte: today },
    }).sort({ startDate: 1 });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};
