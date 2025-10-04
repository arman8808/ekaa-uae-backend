const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/tassoRegistration.controller');

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
  controller.createTassoRegistration(req, res);
});

router.get('/', controller.getTassoRegistrations);
router.get('/download', controller.downloadTassoByDateRange);
router.get('/:id', controller.getTassoRegistrationById);

module.exports = router;


