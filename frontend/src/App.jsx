/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { fetchProfile } from './api';
import { clearToken, getToken } from './auth';
import NavBar from './components/NavBar';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AllCardsPage from './components/AllCardsPage';
import CardDetail from './components/CardDetail';
import CollectionPage from './components/CollectionPage';
import PackOpening from './components/PackOpening';
import AdminPanel from './components/AdminPanel';

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ user, children }) {
  return user?.admin ? children : <Navigate to="/" replace />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      clearToken();
      setUser(null);
      setLoading(false);
    }, 5000); // 5 second timeout

    fetchProfile()
      .then((data) => {
        clearTimeout(timeoutId);
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        clearToken();
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    clearToken();
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div className="app-shell">Loading session...</div>;
  }

  return (
    <div className="app-shell">
      <NavBar user={user} onLogout={handleLogout} />
      <main className="page-container">
        <Routes>
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cards" element={<ProtectedRoute user={user}><AllCardsPage /></ProtectedRoute>} />
          <Route path="/cards/:id" element={<ProtectedRoute user={user}><CardDetail /></ProtectedRoute>} />
          <Route path="/collection" element={<ProtectedRoute user={user}><CollectionPage /></ProtectedRoute>} />
          <Route path="/pack" element={<ProtectedRoute user={user}><PackOpening /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute user={user}><AdminRoute user={user}><AdminPanel /></AdminRoute></ProtectedRoute>} />
          <Route path="/" element={user ? <Navigate to="/cards" replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
