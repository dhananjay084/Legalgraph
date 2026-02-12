import React from 'react';
import {
  ChevronDown,
  Sparkles,
  HelpCircle,
  Moon,
  Sun,
  Mail
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface HeaderProps {
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

const Header: React.FC<HeaderProps> = ({ onThemeChange }) => {
  const [isDark, setIsDark] = useState(false);
  const [isReminderMenuOpen, setIsReminderMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    if (onThemeChange) onThemeChange(newTheme);
    toast.info(`Theme switched to ${newTheme} mode`);
  };
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">COI Review Dashboard</h1>
        <p className="page-subtitle">Overview of all Certificate of insurance</p>
      </div>
      <div className="header-right">
        <div className="dropdown-container">
          <button className="btn btn-outline" onClick={() => setIsReminderMenuOpen(!isReminderMenuOpen)}>
            <Mail size={16} className="btn-icon-mobile" />
            <span className="btn-text">Send Bulk Reminder</span> <ChevronDown size={16} />
          </button>
          {isReminderMenuOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { toast.success('Primary Reminder Sent'); setIsReminderMenuOpen(false); }}>Primary Reminder</button>
              <button onClick={() => { toast.success('Secondary Reminder Sent'); setIsReminderMenuOpen(false); }}>Secondary Reminder</button>
              <button onClick={() => { toast.success('Final Notice Sent'); setIsReminderMenuOpen(false); }}>Final Notice</button>
            </div>
          )}
        </div>
        <button className="btn btn-primary-outline">
          <Sparkles size={16} />
          <span className="btn-text">Ask LegalGraph AI</span>
        </button>
        <button className="btn btn-help" onClick={toggleTheme}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="btn btn-help">
          <HelpCircle size={16} />
          <span className="btn-text">Help</span>
        </button>
        <div className="dropdown-container">
          <div className="user-profile" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
            <div className="user-avatar">S</div>
            <div className="user-info">
              <span className="user-name">Shubham</span>
              <span className="user-email">shubham@gmail.com</span>
            </div>
            <ChevronDown size={14} className="dropdown-icon" style={{ position: 'relative', right: 0, marginLeft: '0.5rem' }} />
          </div>
          {isProfileMenuOpen && (
            <div className="dropdown-menu" style={{ right: 0, left: 'auto' }}>
              <button onClick={() => { toast.info('Profile clicked'); setIsProfileMenuOpen(false); }}>My Profile</button>
              <button onClick={() => { toast.info('Settings clicked'); setIsProfileMenuOpen(false); }}>Settings</button>
              <button onClick={() => { toast.info('Logged out'); setIsProfileMenuOpen(false); }} style={{ color: '#de350b' }}>Logout</button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};

export default Header;
