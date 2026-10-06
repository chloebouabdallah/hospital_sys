const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createAppointment } = require('../controllers/appointment.controller');

router.post('/', authenticate, createAppointment);

module.exports = router;