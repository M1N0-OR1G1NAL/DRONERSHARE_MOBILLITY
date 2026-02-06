const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.post('/logout', authenticate, authController.logout);
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');

// Public routes with strict rate limiting
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

// Protected routes with general API rate limiting
router.get('/me', apiLimiter, authenticate, authController.getMe);

module.exports = router;
