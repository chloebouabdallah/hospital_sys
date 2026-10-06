require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const prisma = require('./lib/prisma');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const doctorRoutes = require('./routes/doctor.routes');
const specialtyRoutes = require('./routes/specialty.routes');
const symptomRoutes = require('./routes/symptom.routes');
const conditionRoutes = require('./routes/condition.routes');
const questionRoutes = require('./routes/question.routes');
const optionRoutes = require('./routes/option.routes');
const checkerRoutes = require('./routes/checker.routes');
const triageRuleRoutes = require('./routes/triage-rule.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const availabilityRoutes = require('./routes/availability.routes');

const app = express();

// CORS must allow credentials (cookies) from the frontend origin.
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/conditions', conditionRoutes);
app.use('/api/symptom-questions', questionRoutes);
app.use('/api/symptom-question-options', optionRoutes);
app.use('/api/symptom-checker', checkerRoutes);
app.use('/api/triage-rules', triageRuleRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctor-availability', availabilityRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large.' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Something went wrong.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});