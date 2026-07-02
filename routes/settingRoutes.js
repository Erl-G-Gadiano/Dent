const express = require('express');
const settingController = require('../controllers/settingController');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/settings', requireLogin, requireRole(['Admin']), settingController.settingsPage);
router.post('/settings', requireLogin, requireRole(['Admin']), settingController.updateSettings);

module.exports = router;
