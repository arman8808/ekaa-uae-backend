const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/family.consitalation.registration.controller");

router.get("/", registrationController.getAllRegistrations);
router.post("/register", registrationController.createRegistration);
router.get("/download-csv", registrationController.downloadRegistrationsCSV);
router.get("/:id", registrationController.getRegistrationById);
router.delete("/:id", registrationController.deleteRegistration);
module.exports = router;
