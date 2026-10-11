const express = require('express');
const router = express.Router();
const { authenticate, can } = require('../middleware/auth');
const { getOverview } = require('../controllers/admin.controller');

const isAdmin = can((req) => req.user.role === 'admin');

router.get('/overview', authenticate, isAdmin, getOverview);

module.exports = router;