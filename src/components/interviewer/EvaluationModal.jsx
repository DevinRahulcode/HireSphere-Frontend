import React, { useState } from 'react';
import api from '../../api/axios';
import { X, ClipboardCheck, MessageSquare, Send } from 'lucide-react';
import '../interviewer/css/EvaluationModal.css';

const EvaluationModal = ({ booking, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    report: '',
    annotations: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Matches @PostMapping("/booking/{bookingId}/evaluation")
      await api.post(`/v1/interviewer/booking/${booking.id}/evaluation`, {
        report: formData.report,
        annotations: formData.annotations
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to submit evaluation: " + (err.response?.data?.message || "Error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content evaluation-modal">
        <div className="modal-header">
          <div className="header-title">
            <ClipboardCheck size={24} className="icon-blue" />
            <h2>Submit Evaluation</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><MessageSquare size={18} /> Performance Report</label>
            <textarea
              required
              placeholder="Provide a detailed summary of the candidate's performance..."
              value={formData.report}
              onChange={(e) => setFormData({...formData, report: e.target.value})}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label><Send size={18} /> Interviewer Annotations (Private Notes)</label>
            <textarea
              placeholder="Add technical notes, score breakdowns, or specific feedback..."
              value={formData.annotations}
              onChange={(e) => setFormData({...formData, annotations: e.target.value})}
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Complete Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationModal;