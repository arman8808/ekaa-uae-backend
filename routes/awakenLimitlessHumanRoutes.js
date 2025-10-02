const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const awakenLimitlessHumanController = require('../controllers/awakenLimitlessHumanController');

const awakenLimitlessHumanValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('nameAsCertificate').notEmpty().withMessage('Name as on certificate is required'),
  body('currentAddress').notEmpty().withMessage('Current address is required'),
  body('permanenetAddress').notEmpty().withMessage('Permanent address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('mobileNo').notEmpty().isMobilePhone().withMessage('Valid mobile number is required'),
  body('email').notEmpty().isEmail().withMessage('Valid email is required'),
  body('dob').notEmpty().isISO8601().toDate().withMessage('Valid date of birth is required'),
  body('occupation').notEmpty().withMessage('Occupation is required'),
  body('communicationPreferences').isBoolean().withMessage('Communication preference must be true or false'),
  body('termsandcondition').isBoolean().custom(val => val === true).withMessage('Terms and conditions must be accepted'),
  body('levelName').notEmpty().withMessage('Level name is required'),
];

// Create new AWAKEN THE LIMITLESS HUMAN registration
router.post('/', 
  awakenLimitlessHumanValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }
    awakenLimitlessHumanController.createAwakenLimitlessHumanRegistration(req, res, next);
  }
);

// Get all AWAKEN THE LIMITLESS HUMAN registrations
router.get('/', awakenLimitlessHumanController.getAwakenLimitlessHumanRegistrations);

// Download registrations within date range (CSV)
router.get('/download', awakenLimitlessHumanController.downloadAwakenLimitlessHumanByDateRange);

// Get single AWAKEN THE LIMITLESS HUMAN registration by ID
router.get('/:id', awakenLimitlessHumanController.getAwakenLimitlessHumanRegistrationById);

module.exports = router;
