import React from 'react';
import { X, Award, MessageSquare, Info, Calendar, User } from 'lucide-react';
import './css/EvaluationReportModal.css';

const EvaluationReportModal = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content report-modal">
        <div className="report-header">
          <div className="header-main">
            <Award size={32} className="award-icon" />
            <div>
              <h2>Interview Feedback</h2>
              <p>Session with {booking.interviewer?.firstName} {booking.interviewer?.lastName}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
 
        <div className="report-body">
          <div className="session-meta">
            <div className="meta-item">
              <Calendar size={18} />
              <span>{new Date(booking.sessionTime).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <User size={18} />
              <span>{booking.interviewType || 'Technical Interview'}</span>
            </div>
          </div>

          <section className="report-section">
            <h3><MessageSquare size={20} /> Detailed Performance Report</h3>
            <div className="content-box">
              {booking.evaluationReport ? (
                <p className="report-text">{booking.evaluationReport}</p>
              ) : (
                <p className="placeholder-text">Detailed report is being processed...</p>
              )}
            </div>
          </section>

          {/* Optional: Only show annotations if they are meant for the candidate */}
          {booking.interviewerAnnotations && (
            <section className="report-section">
              <h3><Info size={20} /> Interviewer Key Notes</h3>
              <div className="content-box highlight">
                <p className="report-text">{booking.interviewerAnnotations}</p>
              </div>
            </section>
          )}
        </div>

        <div className="report-footer">
          <button className="btn-primary" onClick={onClose}>Close Report</button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationReportModal;