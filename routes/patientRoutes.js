const express = require('express');
const patientController = require('../controllers/patientController');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/patients', requireLogin, requireRole(['Admin', 'Subadmin']), patientController.listPatients);
router.post('/patients', requireLogin, requireRole(['Admin', 'Subadmin']), patientController.createPatient);

module.exports = router;
