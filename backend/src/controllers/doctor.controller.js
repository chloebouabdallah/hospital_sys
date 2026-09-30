const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- POST /doctors (admin only) ----
// Creates a User (role='doctor') AND the linked Doctor record together.
async function createDoctor(req, res) {
  try {
    const { name, email, password, specialtyId, bio, yearsExperience } = req.body;

    if (!name || !email || !password || !specialtyId) {
      return res.status(400).json({
        error: 'name, email, password, and specialtyId are required.',
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const specialty = await prisma.specialty.findUnique({ where: { id: specialtyId } });
    if (!specialty) {
      return res.status(400).json({ error: 'specialtyId does not match a real specialty.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Transaction: if either create fails, both roll back — we never want
    // a doctor User floating around with no linked Doctor record, or vice versa.
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash, role: 'doctor' },
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          specialtyId,
          bio: bio ?? null,
          yearsExperience: yearsExperience ?? null,
        },
      });

      return { user, doctor };
    });

    return res.status(201).json({
      doctor: {
        id: result.doctor.id,
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        specialtyId: result.doctor.specialtyId,
        bio: result.doctor.bio,
        yearsExperience: result.doctor.yearsExperience,
      },
    });
  } catch (err) {
    console.error('createDoctor error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

// ---- GET /doctors (public — doctor search) ----
async function getAllDoctors(req, res) {
  try {
    const { specialtyId } = req.query;

    const where = {};
    if (specialtyId) where.specialtyId = parseInt(specialtyId, 10);

    const doctors = await prisma.doctor.findMany({
      where,
      select: {
        id: true,
        bio: true,
        yearsExperience: true,
        specialty: { select: { id: true, name: true } },
        user: { select: { name: true } }, // never expose email/passwordHash publicly
      },
    });

    return res.status(200).json({ doctors });
  } catch (err) {
    console.error('getAllDoctors error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

// ---- GET /doctors/:id (public — doctor profile page) ----
async function getDoctorById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        bio: true,
        yearsExperience: true,
        specialty: { select: { id: true, name: true } },
        user: { select: { name: true } },
        availability: {
          select: { dayOfWeek: true, startTime: true, endTime: true, isAvailable: true },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    return res.status(200).json({ doctor });
  } catch (err) {
    console.error('getDoctorById error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

// ---- PATCH /doctors/:id (doctor edits own profile subset, admin edits anything) ----
async function updateDoctor(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { bio, yearsExperience, specialtyId } = req.body;

    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    const data = {};
    if (bio !== undefined) data.bio = bio;
    if (yearsExperience !== undefined) data.yearsExperience = yearsExperience;

    // Only admin may reassign specialty — a doctor changing their own
    // specialty is exactly the kind of self-service abuse we want to prevent.
    if (specialtyId !== undefined) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only an admin can change a doctor\'s specialty.' });
      }
      const specialty = await prisma.specialty.findUnique({ where: { id: specialtyId } });
      if (!specialty) {
        return res.status(400).json({ error: 'specialtyId does not match a real specialty.' });
      }
      data.specialtyId = specialtyId;
    }

    const updated = await prisma.doctor.update({
      where: { id },
      data,
      select: {
        id: true,
        bio: true,
        yearsExperience: true,
        specialty: { select: { id: true, name: true } },
      },
    });

    return res.status(200).json({ doctor: updated });
  } catch (err) {
    console.error('updateDoctor error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

// ---- DELETE /doctors/:id (admin only) ----
async function deleteDoctor(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    // Deleting the Doctor record only. The linked User (and its login) stays
    // intact unless you explicitly also delete the user — deciding that
    // for you here would silently kill their login, which is a bigger call
    // than "remove them from doctor search." Flag if you want cascading delete instead.
    await prisma.doctor.delete({ where: { id } });

    return res.status(200).json({ message: 'Doctor deleted.' });
  } catch (err) {
    console.error('deleteDoctor error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};