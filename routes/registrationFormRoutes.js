const express = require('express');
const router = express.Router();
const { createRegistrationForm, listRegistrations } = require('../controllers/registrationFormController');

// POST /registration
router.post('/', createRegistrationForm);
router.get('/', listRegistrations);
module.exports = router;
