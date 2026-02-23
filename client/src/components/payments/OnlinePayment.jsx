import { useEffect } from 'react';
import { IndianRupee, ShieldCheck } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const OnlinePayment = ({ amount, studentData, onPaymentSuccess }) => {
  const { notifySuccess, notifyError } = useToast();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();

    if (!res) {
      notifyError("Razorpay SDK failed to load. Check your connection.");
      return;
    }

    // 1. Call your backend to create an order
    // const order = await paymentApi.createOrder({ amount, studentId: studentData.id });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY, // Your Public Key
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      name: "Atharv Preschool",
      description: `School Fee - ${studentData.name}`,
      order_id: "order_9A33Xdb9432", // This will come from your backend order creation
      handler: function (response) {
        // 2. Call your backend to verify signature
        onPaymentSuccess(response);
        notifySuccess("Payment Successful! Receipt generated.");
      },
      prefill: {
        name: studentData.parentName,
        email: studentData.email,
        contact: studentData.phone,
      },
      theme: { color: "#2563eb" }, // Blue theme to match your app
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
          <IndianRupee size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Online Payment</h3>
          <p className="text-slate-500 text-sm">Secure payment via Razorpay</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-slate-600">Payable Amount:</span>
          <span className="font-bold text-slate-900">₹{amount}</span>
        </div>
        <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
          <ShieldCheck size={14} /> 256-bit SSL Encrypted
        </div>
      </div>

      <button
        onClick={handlePayment}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
      >
        Pay Now ₹{amount}
      </button>
    </div>
  );
};

export default OnlinePayment;