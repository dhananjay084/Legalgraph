import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import { ToastContainer } from 'react-toastify';
import './App.css';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  return (
    <Router>
      <div className={`dashboard-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

        <main className="main-content">
          <Header onThemeChange={handleThemeChange} />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vault" element={<Placeholder title="Contract Vault" />} />
            <Route path="/analysis" element={<Placeholder title="Analysis Results" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} theme={theme} />
      </div>
    </Router>
  );
};

// Simple placeholder for other routes
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '2rem', background: 'var(--bg-white)', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: 'var(--text-main)' }}>
    <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
    <p style={{ color: 'var(--text-muted)' }}>This page is under development. Please check back later.</p>
  </div>
);

export default App;
