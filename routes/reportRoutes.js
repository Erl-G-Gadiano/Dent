const express = require('express');
const reportController = require('../controllers/reportController');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/reports', requireLogin, requireRole(['Admin', 'Subadmin']), reportController.reportsPage);
router.get('/reports/export/pdf', requireLogin, requireRole(['Admin', 'Subadmin']), reportController.exportPdf);
router.get('/reports/export/excel', requireLogin, requireRole(['Admin', 'Subadmin']), reportController.exportExcel);

module.exports = router;
