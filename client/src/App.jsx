import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Context & global components
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Toast from './components/common/Toast';
import Loader from './components/common/Loader';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// ── Public pages (eager — small, always needed) ─────────────
import HomePage    from './pages/public/HomePage';
import LoginPage   from './pages/public/LoginPage';

// ── Lazy-loaded pages ────────────────────────────────────────
const AboutPage       = lazy(() => import('./pages/public/AboutPage'));
const AdmissionPage   = lazy(() => import('./pages/public/AdmissionPage'));
const ContactPage     = lazy(() => import('./pages/public/ContactPage'));
const ProgramsPage    = lazy(() => import('./pages/public/ProgramsPage'));
const GalleryPage     = lazy(() => import('./pages/public/GalleryPage'));

const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const StudentsPage    = lazy(() => import('./pages/admin/StudentsPage'));
const AddStudentPage  = lazy(() => import('./pages/admin/AddStudentPage'));
const EditStudentPage = lazy(() => import('./pages/admin/EditStudentPage'));
const FeeStructurePage= lazy(() => import('./pages/admin/FeeStructurePage'));
const CollectFeePage  = lazy(() => import('./pages/admin/CollectFeePage'));
const PaymentsPage    = lazy(() => import('./pages/admin/PaymentsPage'));
const ReceiptsPage    = lazy(() => import('./pages/admin/ReceiptsPage'));
const ReportsPage     = lazy(() => import('./pages/admin/ReportsPage'));
const BackupPage      = lazy(() => import('./pages/admin/BackupPage'));
const SettingsPage    = lazy(() => import('./pages/admin/SettingsPage'));

const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'));
const ChildProfile    = lazy(() => import('./pages/parent/ChildProfile'));
const FeeStatus       = lazy(() => import('./pages/parent/FeeStatus'));
const PayOnline       = lazy(() => import('./pages/parent/PayOnlinePage'));
const MyReceipts      = lazy(() => import('./pages/parent/MyReceipts'));

// ── Layout: Public pages (Navbar + Footer) ───────────────────
const PublicLayout = () => (
  <>
    <Navbar />
    <Suspense fallback={<Loader fullScreen />}>
      <Outlet />
    </Suspense>
    <Footer />
  </>
);

// ── Layout: Admin panel (Sidebar + scrollable main) ──────────
const AdminLayout = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto min-h-screen">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  </ProtectedRoute>
);

// ── Layout: Parent portal (Navbar + Footer) ──────────────────
const ParentLayout = () => (
  <ProtectedRoute allowedRoles={['parent']}>
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pb-10" style={{ paddingTop: 88 }}>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  </ProtectedRoute>
);

// ── App ──────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toast />
        <Routes>

          {/* ── Public ── */}
          <Route element={<PublicLayout />}>
            <Route path="/"           element={<HomePage />} />
            <Route path="/about"      element={<AboutPage />} />
            <Route path="/admission"  element={<AdmissionPage />} />
            <Route path="/contact"    element={<ContactPage />} />
            <Route path="/programs"   element={<ProgramsPage />} />
            <Route path="/gallery"   element={<GalleryPage />} />
          </Route>

          {/* Login has no layout wrapper */}
          <Route path="/login" element={<LoginPage />} />

          {/* ── Admin ── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index                   element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"        element={<AdminDashboard />} />
            <Route path="students"         element={<StudentsPage />} />
            <Route path="students/add"     element={<AddStudentPage />} />
            <Route path="students/:id/edit"element={<EditStudentPage />} />
            <Route path="fees"             element={<FeeStructurePage />} />
            <Route path="collect-fee"      element={<CollectFeePage />} />
            <Route path="payments"         element={<PaymentsPage />} />
            <Route path="receipts"         element={<ReceiptsPage />} />
            <Route path="reports"          element={<ReportsPage />} />
            <Route path="backup"           element={<BackupPage />} />
            <Route path="settings"         element={<SettingsPage />} />
            <Route path="*"                element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ── Parent ── */}
          <Route path="/parent" element={<ParentLayout />}>
            <Route index               element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"    element={<ParentDashboard />} />
            <Route path="profile"      element={<ChildProfile />} />
            <Route path="fees"         element={<FeeStatus />} />
            <Route path="pay"          element={<PayOnline />} />
            <Route path="receipts"     element={<MyReceipts />} />
            <Route path="*"            element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ── Fallbacks ── */}
          <Route
            path="/unauthorized"
            element={
              <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <div className="text-6xl">🚫</div>
                <h1 className="text-2xl font-black text-gray-700">Access Denied</h1>
                <p className="text-gray-400 text-sm">You don't have permission to view this page.</p>
                <a href="/login" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
                  Go to Login
                </a>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;