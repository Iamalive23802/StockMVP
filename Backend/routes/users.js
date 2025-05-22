const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

// Routes
router.get('/', getAllUsers);          // Fetch all users
router.post('/', addUser);             // Add new user
router.put('/:id', updateUser);        // Update user by ID
router.delete('/:id', deleteUser);     // Delete user by ID

module.exports = router;
