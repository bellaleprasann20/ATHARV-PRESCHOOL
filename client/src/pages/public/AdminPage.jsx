import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const AdminPage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // 1. Handle Loading State
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium tracking-wide">Securing Session...</p>
      </div>
    );
  }

  // 2. Security Check: Redirect to Login if not authenticated or not an admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Persistent Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <Navbar 
          user={user} 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* The <Outlet /> component is where child routes 
              (Dashboard, StudentsPage, etc.) will be rendered.
            */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;