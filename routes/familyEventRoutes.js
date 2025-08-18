const express = require('express');
const router = express.Router();
const eventController = require('../controllers/familyEvent.controller');
const { protect } = require('../middlewares/auth');

router.route('/')
  .get(eventController.getEvents)
  .post(protect, eventController.createEvent);

router.route('/:id')
  .get(eventController.getEvent)
  .put(protect, eventController.updateEvent)
  .delete(protect, eventController.deleteEvent);

module.exports = router;