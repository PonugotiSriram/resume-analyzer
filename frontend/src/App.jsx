import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import Dashboard from './pages/Dashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
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
    <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
        <BrainCircuit className="text-indigo-400 w-8 h-8" />
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 hidden sm:block">
          NexusAI
        </h1>
      </Link>

      <nav className="flex items-center gap-6 text-sm font-medium">
        {!user || user.role === 'jobseeker' ? (
          <Link to="/upload" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
            <Upload className="w-4 h-4" /> Analyze Resume
          </Link>
        ) : null}

        {user ? (
          <>
            {user.role === 'recruiter' && (
              <Link to="/recruiter" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-gray-300">
                <Users className="w-4 h-4" /> Recruiter Dashboard
              </Link>
            )}

            <Link to="/papers" className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-gray-300">
              <BookOpen className="w-4 h-4" /> Papers
            </Link>

            {user.role === 'jobseeker' && (
              <Link to="/history" className="hover:text-rose-400 transition-colors flex items-center gap-1 text-gray-300">
                <Clock className="w-4 h-4" /> History
              </Link>
            )}

            <button onClick={handleLogout} className="hover:text-red-400 transition-colors flex items-center gap-1 ml-4 text-gray-400">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold transition flex items-center gap-1 shadow-lg shadow-indigo-500/20">
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
      <Route path="/" element={user ? (user.role === 'recruiter' ? <Navigate to="/recruiter" replace /> : <Navigate to="/upload" replace />) : <LandingPage />} />
      <Route path="/login" element={user ? (user.role === 'recruiter' ? <Navigate to="/recruiter" replace /> : <Navigate to="/upload" replace />) : <LoginPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Protected Routes */}
      <Route path="/recruiter" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/papers" element={<ProtectedRoute><PapersPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <LoginCelebration />
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
          <Navbar />
          <main className="flex-1 relative overflow-auto">
            <AppRoutes />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
