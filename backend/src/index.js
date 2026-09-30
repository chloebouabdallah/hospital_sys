require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const doctorRoutes = require('./routes/doctor.routes');


const app = express();

// Middleware first
app.use(cors());
app.use(express.json());

// Then routes
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.get('/api/specialties', async (req, res) => {
  const specialties = await prisma.specialty.findMany();
  res.json(specialties);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);  
app.use('/api/doctors', doctorRoutes);
 // ← moved here, corrected prefix

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});