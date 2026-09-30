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

router.get('/', getAllDoctors);           // public
router.get('/:id', getDoctorById);        // public

router.post('/', authenticate, authorize('admin'), createDoctor);
router.patch('/:id', authenticate, isAssignedDoctorOrAdmin, updateDoctor);
router.delete('/:id', authenticate, authorize('admin'), deleteDoctor);

module.exports = router;