import React, { useState, useEffect } from 'react';
import ReceiptList from '../../components/receipts/ReceiptList';
import Modal from '../../components/common/Modal';
import ReceiptView from '../../components/receipts/ReceiptView';
import ReceiptDownload from '../../components/receipts/ReceiptDownload';
import axios from '../../api/axios';

const ParentReceiptsPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchMyReceipts = async () => {
      const res = await axios.get('/parent/my-receipts');
      setReceipts(res.data);
    };
    fetchMyReceipts();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Receipts</h1>
      <ReceiptList 
        receipts={receipts} 
        onView={(r) => setSelectedReceipt(r)} 
      />

      <Modal isOpen={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} title="Receipt Preview">
        {selectedReceipt && (
          <div className="space-y-6">
            <div className="max-h-[60vh] overflow-auto rounded-lg">
              <ReceiptView receiptData={selectedReceipt} id="parent-receipt-pdf" />
            </div>
            <ReceiptDownload targetId="parent-receipt-pdf" fileName={`Receipt_${selectedReceipt.receiptNo}.pdf`} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ParentReceiptsPage;