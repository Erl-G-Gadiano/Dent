const express = require('express');
const userController = require('../controllers/userController');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/users', requireLogin, requireRole(['Admin']), userController.listUsers);
router.post('/users', requireLogin, requireRole(['Admin']), userController.createUser);

module.exports = router;
