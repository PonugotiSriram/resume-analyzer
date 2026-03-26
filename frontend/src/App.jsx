import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import Dashboard from './pages/Dashboard';

import PapersPage from './pages/PapersPage';
import HistoryPage from './pages/HistoryPage';
import LoginCelebration from './components/LoginCelebration';

import { LogIn, LogOut, Upload, Users, BrainCircuit, BookOpen, Clock } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
        <BrainCircuit className="text-blue-600 w-8 h-8" />
        <h1 className="text-xl font-extrabold text-blue-900 hidden sm:block tracking-tight">
          NexusAI
        </h1>
      </Link>

      <nav className="flex items-center gap-6 text-sm font-bold text-gray-600">
        {!user || user.role === 'jobseeker' ? (
          <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <Upload className="w-4 h-4" /> Analyze Resume
          </Link>
        ) : null}

        {user ? (
          <>
            <Link to="/papers" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Papers
            </Link>

            {user.role === 'jobseeker' && (
              <Link to="/history" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <Clock className="w-4 h-4" /> History
              </Link>
            )}

            <button onClick={handleLogout} className="hover:text-rose-500 transition-colors flex items-center gap-1 ml-4">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold transition flex items-center gap-1 shadow-md shadow-blue-500/20">
            <LogIn className="w-4 h-4" /> Login
          </Link>
        )}
      </nav>
    </header>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/upload" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/upload" replace /> : <LoginPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Protected Routes */}
      <Route path="/papers" element={<ProtectedRoute><PapersPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      
      {/* Vercel SPA Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <LoginCelebration />
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col relative overflow-x-hidden selection:bg-blue-500/30">
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 relative overflow-hidden">
              <AppRoutes />
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
