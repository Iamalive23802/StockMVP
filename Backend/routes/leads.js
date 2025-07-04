const express = require('express');
const router = express.Router();

const {
  getLeads,
  addLead,
  updateLead,
  deleteLead,
  uploadLeads,
  assignLead,
  googleSheetsUpload // ✅ added this!
} = require('../controllers/leads');

// Routes
router.get('/', getLeads);
router.post('/', addLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/upload', uploadLeads);
router.patch('/:id/assign', assignLead);
router.post('/google-sheets', googleSheetsUpload); // ✅ this line

module.exports = router;
