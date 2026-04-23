import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import Home from './pages/Home';
import AdminPage from './pages/Admin';
import LoginPage from './pages/Login';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const { toasts, toast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} toast={toast} />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminPage toast={toast} />
          </ProtectedRoute>
        } />
      </Routes>
      <Toast toasts={toasts} />
    </BrowserRouter>
  );
}
