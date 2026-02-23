const FeeBreakdown = ({ items, total }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Fee Breakup</h4>
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span className="text-slate-500">{item.label}</span>
          <span className="text-slate-800 font-medium">₹{item.amount.toLocaleString()}</span>
        </div>
      ))}
      <div className="flex justify-between text-base font-bold text-slate-900 border-t pt-2 mt-2">
        <span>Grand Total</span>
        <span>₹{total.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default FeeBreakdown;