import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const StatCards: React.FC = () => {
  const cois = useSelector((state: RootState) => state.cois.cois);

  const total = cois.length;
  const accepted = cois.filter(c => c.status === 'Active').length; // Assuming Active as Accepted for stats
  const rejected = cois.filter(c => c.status === 'Rejected').length;
  
  // Expiring in 30 days
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  const expiringSoon = cois.filter(c => {
    const expiry = new Date(c.expiryDate);
    return expiry > now && expiry <= thirtyDaysFromNow;
  }).length;

  return (
    <section className="stat-cards">
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Total COI Processed</span>
          <div className="stat-value-container">
            <div className="stat-icon-wrapper blue">
              <FileText size={20} />
            </div>
            <span className="stat-value">{total}</span>
          </div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Accepted</span>
          <div className="stat-value-container">
            <div className="stat-icon-wrapper green">
              <CheckCircle2 size={20} />
            </div>
            <span className="stat-value">{accepted}</span>
          </div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Rejected</span>
          <div className="stat-value-container">
            <div className="stat-icon-wrapper red">
              <XCircle size={20} />
            </div>
            <span className="stat-value">{rejected}</span>
          </div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Expiring in 30 days</span>
          <div className="stat-value-container">
            <div className="stat-icon-wrapper orange">
              <Clock size={20} />
            </div>
            <span className="stat-value">{expiringSoon}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatCards;
