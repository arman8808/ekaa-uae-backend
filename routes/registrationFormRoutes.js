const express = require('express');
const router = express.Router();
const { createRegistrationForm } = require('../controllers/registrationFormController');

// POST /registration
router.post('/', createRegistrationForm);

module.exports = router;
        