// const express = require('express');
// const router = express.Router();

// // Import multer configuration
// const  upload  = require('../config/multerConfig');




// // Import controller functions
// const {
//   createContact,
//   getAllContacts,
//   getContactById,
//   updateContactStatus,
//   deleteContact,
// } = require('../controllers/contactController');

// // ========================= PUBLIC ROUTES =========================
// // Create new contact (with file upload)
// router.post('/contact', upload.single('uploadImage'), createContact);

// // ========================= ADMIN ROUTES =========================
// // Note: Add authentication middleware here as needed
// // Example: router.use(authenticateAdmin);

// // Get all contacts with pagination and filtering
// router.get('/contacts', getAllContacts);

// // Get contact statistics
// // router.get('/contacts/stats', getContactStats);

// // Get single contact by ID
// router.get('/contacts/:id', getContactById);

// // Update contact status
// router.put('/contacts/:id/status', updateContactStatus);

// // Delete contact
// router.delete('/contacts/:id', deleteContact);

// module.exports = router







const express = require('express');
const router = express.Router();

const {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');



router.post('/contact', createContact);

router.get('/contacts', getAllContacts);

router.get('/contacts/stats', getContactStats);

router.get('/contacts/:id', getContactById);

router.put('/contacts/:id/status', updateContactStatus);

router.delete('/contacts/:id', deleteContact);

module.exports = router;