import { useState } from 'react';
import axios from '../api/axios';
import { useToast } from './useToast';

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const { notifySuccess, notifyError } = useToast();

  // 1. Create Order for Razorpay (Online Payment)
  const createOnlineOrder = async (amount, studentId) => {
    setLoading(true);
    try {
      // Backend should return order_id, amount, and currency
      const res = await axios.post('/payments/create-order', { amount, studentId });
      return res.data; 
    } catch (err) {
      notifyError("Failed to initiate online payment.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Razorpay Signature and Save Transaction
  const verifyPayment = async (paymentResponse, studentId) => {
    setLoading(true);
    try {
      const res = await axios.post('/payments/verify', {
        ...paymentResponse,
        studentId
      });
      notifySuccess("Payment Verified & Recorded!");
      return res.data;
    } catch (err) {
      notifyError("Payment verification failed. Please contact support.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch All Transactions (Admin View)
  const fetchPayments = async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(`/payments?${queryParams}`);
      setTransactions(res.data.payments);
    } catch (err) {
      notifyError("Could not load payment history.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Record Manual Payment (Cash/Cheque - Admin Only)
  const recordManualPayment = async (paymentData) => {
    setLoading(true);
    try {
      const res = await axios.post('/payments/manual', paymentData);
      notifySuccess("Cash payment recorded successfully!");
      return res.data;
    } catch (err) {
      notifyError(err.response?.data?.message || "Error recording payment.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    transactions,
    createOnlineOrder,
    verifyPayment,
    fetchPayments,
    recordManualPayment
  };
};