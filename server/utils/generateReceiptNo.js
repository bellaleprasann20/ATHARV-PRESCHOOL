const Receipt = require('../models/Receipt');

const generateReceiptNo = async () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = await Receipt.countDocuments();
  return `ATH-RCP-${year}${month}-${String(count + 1).padStart(5, '0')}`;
};

module.exports = generateReceiptNo;