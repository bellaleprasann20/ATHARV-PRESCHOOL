import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FeeCollectionChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Monthly Fee Collection (₹)', align: 'start', color: '#64748b' },
    },
    scales: {
      y: { beginAtZero: true, grid: { drawBorder: false } },
      x: { grid: { display: false } }
    }
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Collection',
      data: data || [45000, 52000, 48000, 61000, 55000, 67000],
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }]
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default FeeCollectionChart;