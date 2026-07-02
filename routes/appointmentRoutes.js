const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/appointments', requireLogin, appointmentController.listAppointments);
router.post('/appointments', requireLogin, requireRole(['Admin', 'Subadmin', 'Client']), appointmentController.createAppointment);
router.post('/appointments/:id/status', requireLogin, requireRole(['Admin', 'Subadmin']), appointmentController.updateStatus);

module.exports = router;
