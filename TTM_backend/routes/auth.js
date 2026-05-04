const express = require('express');
const { body } = require('express-validator');
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  signup
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').notEmpty()
  ],
  login
);

router.get('/me', protect, getMe);

module.exports = router;
