const express = require('express');
const reportController = require('../controllers/reportController');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/reports', requireLogin, requireRole(['Admin', 'Subadmin']), reportController.reportsPage);

module.exports = router;
