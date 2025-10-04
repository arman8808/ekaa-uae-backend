const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/decodeRegistration.controller');

const validation = [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('nameAsCertificate').notEmpty(),
  body('currentAddress').notEmpty(),
  body('permanenetAddress').notEmpty(),
  body('city').notEmpty(),
  body('mobileNo').notEmpty(),
  body('email').notEmpty().isEmail(),
  body('dob').notEmpty().isISO8601().toDate(),
  body('occupation').notEmpty(),
  body('communicationPreferences').isBoolean(),
  body('termsandcondition').isBoolean().custom(v => v === true),
];

router.post('/', validation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  controller.createDecodeRegistration(req, res);
});

router.get('/', controller.getDecodeRegistrations);
router.get('/download', controller.downloadDecodeByDateRange);
router.get('/:id', controller.getDecodeRegistrationById);

module.exports = router;


