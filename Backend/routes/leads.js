const express = require('express');
const router = express.Router();

const {
  getLeads,
  addLead,
  updateLead,
  deleteLead,
  uploadLeads,
  assignLead // ✅ added here
} = require('../controllers/leads');

// Routes
router.get('/', getLeads);
router.post('/', addLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/upload', uploadLeads);

// ✅ NEW route for assigning leads
router.patch('/:id/assign', assignLead);

module.exports = router;
