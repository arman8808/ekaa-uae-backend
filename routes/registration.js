const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.fieldname + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const registrationValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('nameAsCertificate').notEmpty().withMessage('Name as on certificate is required'),
  body('currentAddress').notEmpty().withMessage('Current address is required'),
  body('permanenetAddress').notEmpty().withMessage('Permanent address is required'),
  body('city').notEmpty().withMessage('City is required'),
  // body('timeslot').notEmpty().withMessage('Timeslot is required'),
  body('mobileNo').notEmpty().isMobilePhone().withMessage('Valid mobile number is required'),
  body('email').notEmpty().isEmail().withMessage('Valid email is required'),
  body('dob').notEmpty().isISO8601().toDate().withMessage('Valid date of birth is required'),
  body('occupation').notEmpty().withMessage('Occupation is required'),
  // body('courseDetailDate').notEmpty().isISO8601().toDate().withMessage('Valid course date is required'),
  // body('courseDetailTime').notEmpty().withMessage('Course time is required'),
  // body('courseDetailVenue').notEmpty().withMessage('Course venue is required'),
  // body('communicationPreferences').isBoolean().withMessage('Communication preference must be true or false'),
  // body('termsandcondition').isBoolean().custom(val => val === true).withMessage('Terms and conditions must be accepted'),
  body('levelName').notEmpty().withMessage('Level name is required'),
];

router.post('/', 
  upload.fields([
    { name: 'idPhotofront', maxCount: 1 },
    { name: 'idphotoback', maxCount: 1 },
    {name:'profileImage',maxCount:1}
  ]),
  registrationValidation,
  (req, res, next) => {
    // Check for file uploads
    if (!req.files || !req.files.idPhotofront || !req.files.profileImage) {
      return res.status(422).json({ success: false, errors: [{ msg: 'Both ID photo front and back are required.' }] });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }
    registrationController.createRegistration(req, res, next);
  }
);

router.get('/', registrationController.getRegistrations);

module.exports = router; 