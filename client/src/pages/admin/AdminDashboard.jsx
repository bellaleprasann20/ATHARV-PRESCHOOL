import React, { useEffect, useState } from 'react';
import { Users, IndianRupee, AlertCircle, TrendingUp } from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import FeeCollectionChart from '../../components/dashboard/FeeCollectionChart';
import RecentPayments from '../../components/dashboard/RecentPayments';
import QuickActions from '../../components/dashboard/QuickActions';
import DueAlertBanner from '../../components/dashboard/DueAlertBanner';
import axios from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    monthlyCollection: 0,
    pendingFees: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/admin/stats-summary');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm">Welcome back to Atharv Preschool Management.</p>
      </div>

      <DueAlertBanner count={12} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Students" value={stats.totalStudents} icon={Users} color="blue" trend="up" trendValue={5} />
        <StatsCard title="Monthly Collection" value={`₹${stats.monthlyCollection}`} icon={IndianRupee} color="green" />
        <StatsCard title="Pending Fees" value={`₹${stats.pendingFees}`} icon={AlertCircle} color="red" />
        <StatsCard title="Avg. Attendance" value={`${stats.attendanceRate}%`} icon={TrendingUp} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FeeCollectionChart />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
          <RecentPayments />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;