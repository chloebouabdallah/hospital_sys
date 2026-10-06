const prisma = require('../lib/prisma');
const {
  isAlignedToSlot,
  findMatchingAvailability,
  findConflictingAppointment,
} = require('../services/availability.service');

const APPT_SELECT = {
  id: true,
  dateTime: true,
  status: true,
  notes: true,
  createdAt: true,
  patient: { select: { id: true, name: true, email: true } },
  doctor: {
    select: {
      id: true,
      bio: true,
      yearsExperience: true,
      user: { select: { name: true } },
      specialty: { select: { id: true, name: true } },
    },
  },
  hospital: { select: { id: true, name: true, city: true } },
};

// ---- POST /appointments ----
// Patient books own appointment. Admin can book for any patient.
async function createAppointment(req, res) {
  try {
    const { doctorId, hospitalId, dateTime } = req.body;
    let { patientId } = req.body;

    // Who is the patient? Self by default; admin can override.
    if (req.user.role === 'admin') {
      patientId = patientId !== undefined ? patientId : req.user.id;
    } else if (req.user.role === 'patient') {
      patientId = req.user.id;
    } else {
      return res.status(403).json({ error: 'Only patients and admins can create appointments.' });
    }

    if (!Number.isInteger(doctorId) || !Number.isInteger(hospitalId) || !dateTime || !Number.isInteger(patientId)) {
      return res.status(400).json({ error: 'doctorId, hospitalId (integers), dateTime (ISO), and a valid patient are required.' });
    }

    const when = new Date(dateTime);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ error: 'dateTime is not a valid ISO date.' });
    }
    if (when.getTime() <= Date.now()) {
      return res.status(400).json({ error: 'dateTime must be in the future.' });
    }
    if (!isAlignedToSlot(when)) {
      return res.status(400).json({ error: 'dateTime must be aligned to a 45-minute slot (e.g. 09:00, 09:45, 10:30).' });
    }

    const [patient, doctor, hospital] = await Promise.all([
      prisma.user.findUnique({ where: { id: patientId } }),
      prisma.doctor.findUnique({ where: { id: doctorId } }),
      prisma.hospital.findUnique({ where: { id: hospitalId } }),
    ]);
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({ error: 'patientId does not match a real patient.' });
    }
    if (!doctor) return res.status(400).json({ error: 'doctorId does not match a real doctor.' });
    if (!hospital) return res.status(400).json({ error: 'hospitalId does not match a real hospital.' });

    const block = await findMatchingAvailability({ doctorId, hospitalId, dateTime: when });
    if (!block) {
      return res.status(400).json({ error: 'The doctor is not available at this hospital on this day/time.' });
    }

    const clash = await findConflictingAppointment({ doctorId, dateTime: when });
    if (clash) {
      return res.status(409).json({ error: 'That slot is already booked for this doctor.' });
    }

    const appt = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        hospitalId,
        dateTime: when,
        status: 'pending',
        notes: typeof req.body.notes === 'string' ? req.body.notes : null,
      },
      select: APPT_SELECT,
    });

    return res.status(201).json({ appointment: appt });
  } catch (err) {
    console.error('createAppointment error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

module.exports = { createAppointment };