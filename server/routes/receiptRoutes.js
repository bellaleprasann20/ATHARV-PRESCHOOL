// receiptRoutes.js
const express = require('express');
const receiptRouter = express.Router();
const { getReceipts, getReceipt, downloadReceipt } = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrTeacher } = require('../middleware/roleMiddleware');

receiptRouter.use(protect);
receiptRouter.get('/', adminOrTeacher, getReceipts);
receiptRouter.get('/:id', adminOrTeacher, getReceipt);
receiptRouter.get('/:id/download', downloadReceipt); // parent can also download

module.exports = receiptRouter;