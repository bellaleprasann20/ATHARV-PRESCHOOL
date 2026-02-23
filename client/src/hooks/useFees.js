import { useState } from 'react';
import axios from '../api/axios';
import { useToast } from './useToast';

export const useFees = () => {
  const [loading, setLoading] = useState(false);
  const { notifySuccess, notifyError } = useToast();

  const collectFee = async (paymentData) => {
    setLoading(true);
    try {
      const res = await axios.post('/fees/collect', paymentData);
      notifySuccess("Payment recorded successfully!");
      return res.data;
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to record payment");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const calculateDues = (student) => {
    const totalExpected = student.feeStructures?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const paid = student.totalPaid || 0;
    return totalExpected - paid;
  };

  return { collectFee, calculateDues, loading };
};