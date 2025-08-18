const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig'); 
const {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramById
} = require('../controllers/hypnotherapyController');

router.get('/', getPrograms);
router.post('/', upload.single('thumbnail'), createProgram); 
router.get('/:id', getProgramById);
router.put('/:id', upload.single('thumbnail'), updateProgram); 
router.delete('/:id', deleteProgram);

module.exports = router;