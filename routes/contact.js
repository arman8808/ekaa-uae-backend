


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