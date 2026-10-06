const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createAppointment,
  listAppointments,
  getAppointmentById,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
} = require('../controllers/appointment.controller');

router.get('/', authenticate, listAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.post('/', authenticate, createAppointment);

router.patch('/:id/cancel', authenticate, cancelAppointment);
router.patch('/:id/confirm', authenticate, confirmAppointment);
router.patch('/:id/complete', authenticate, completeAppointment);

module.exports = router;