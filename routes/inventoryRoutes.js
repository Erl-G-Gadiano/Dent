const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/inventory', requireLogin, requireRole(['Admin', 'Subadmin']), inventoryController.listInventory);
router.post('/inventory', requireLogin, requireRole(['Admin', 'Subadmin']), inventoryController.createItem);

module.exports = router;
