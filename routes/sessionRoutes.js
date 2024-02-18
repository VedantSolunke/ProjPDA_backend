// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Create a new session
router.post('/sessions', sessionController.createSession);

// Get all sessions
router.get('/sessions', sessionController.getSessions);

module.exports = router;
