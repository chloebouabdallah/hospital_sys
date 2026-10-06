const express = require('express');
const router = express.Router();
const { authenticate, authorize, isAssignedDoctorOrAdmin } = require('../middleware/auth');
const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctor.controller');
const { getAvailableSlots } = require('../controllers/availability.controller');

router.get('/', getAllDoctors);
router.get('/:id/available-slots', getAvailableSlots);
router.get('/:id', getDoctorById);

router.post('/', authenticate, authorize('admin'), createDoctor);
router.patch('/:id', authenticate, isAssignedDoctorOrAdmin, updateDoctor);
router.delete('/:id', authenticate, authorize('admin'), deleteDoctor);

module.exports = router;