require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health-check: confirms Express <-> Postgres connectivity (Day 6 checkpoint)
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Quick sanity check that seed data landed correctly
app.get('/api/specialties', async (req, res) => {
  const specialties = await prisma.specialty.findMany();
  res.json(specialties);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown so Prisma connections close cleanly
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});