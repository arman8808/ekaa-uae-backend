const express = require("express");
const router = express.Router();
const ichRegistrationController = require("../controllers/ICH.Registartion.controller");
const { ichRegistrationUpload } = require("../config/ichMulter");
router.post(
  "/ich-registration",
  ichRegistrationUpload,
  ichRegistrationController.submitICHRegistration
);

router.get('/', ichRegistrationController.getAllICHRegistrations);
router.get(
  '/download-csv', 
  ichRegistrationController.downloadICHRegistrationsCSV
);
router.get('/:id', ichRegistrationController.getOneICHRegistration);
router.delete('/:id', ichRegistrationController.deleteICHRegistration);
module.exports = router;
