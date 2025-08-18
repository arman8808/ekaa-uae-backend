const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

// GET /api/events/open
router.get('/open', eventsController.getOpenEvents);

module.exports = router;