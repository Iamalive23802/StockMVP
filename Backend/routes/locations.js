const express = require('express');
const router = express.Router();

const {
  getLocations,     
  addLocation,
  deleteLocation,
} = require('../controllers/location');

router.get('/', getLocations);
router.post('/', addLocation);
router.delete('/:id', deleteLocation);

module.exports = router;
