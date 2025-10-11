const express = require('express');
const router = express.Router();
const managedEventsController = require('../controllers/managedEventsController');

// Create
router.post('/', managedEventsController.createManagedEvent);

// List with pagination (limit 10)
router.get('/', managedEventsController.getManagedEvents);

// Public list for user panel (no pagination, only active from today onwards)
router.get('/public/list', managedEventsController.getManagedEventsForUserPanel);
router.get('/public/list/family-consitalation', managedEventsController.getFamiluConitalationEventsForUserPanel);

// Get one
router.get('/:id', managedEventsController.getManagedEventById);

// Update one
router.put('/:id', managedEventsController.updateManagedEvent);

// Soft delete
router.delete('/:id', managedEventsController.softDeleteManagedEvent);

module.exports = router;


