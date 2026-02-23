const express = require('express');
const router = express.Router();
const { createBackup, getBackups, downloadBackup, deleteBackup, restoreBackup } = require('../controllers/backupController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(protect, adminOnly);

router.post('/', createBackup);
router.get('/', getBackups);
router.get('/:id/download', downloadBackup);
router.delete('/:id', deleteBackup);
router.post('/:id/restore', restoreBackup);

module.exports = router;