const registrationRoutes = require("./routes/registration");
const familyConsiltalition = require("./routes/family.consitalation.registration.routes");
const ich = require("./routes/ICH.Registartion.routes");
const contactRoutes = require("./routes/contact");
const adminRoutes = require('./routes/adminRoutes');
const familyEvent = require('./routes/familyEventRoutes');
const hypnotherapy = require('./routes/hypnotherapyRoutes');
const decodeRoutes = require('./routes/decodeRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const awakenLimitlessHumanRoutes = require('./routes/awakenLimitlessHumanRoutes');
const managedEventsRoutes = require('./routes/managedEventsRoutes');
const familyConstellationRoutes = require('./routes/familyConstellation.routes');
const decodeRegistrationRoutes = require('./routes/decodeRegistration.routes');
const tassoRegistrationRoutes = require('./routes/tassoRegistration.routes');

const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(`/api/registration`, registrationRoutes);
app.use(`/api/familyConsitalation`, familyConsiltalition);
app.use(`/api/ich`, ich);
app.use(`/api/`, contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/familyEvent', familyEvent);
app.use('/api/hypnotherapy', hypnotherapy);
app.use('/api/decode', decodeRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/awakenLimitlessHuman', awakenLimitlessHumanRoutes);
app.use('/api/managed-events', managedEventsRoutes);
app.use('/api/family-constellation', familyConstellationRoutes);
app.use('/api/decode-registration', decodeRegistrationRoutes);
app.use('/api/tasso-registration', tassoRegistrationRoutes);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

module.exports = app;
