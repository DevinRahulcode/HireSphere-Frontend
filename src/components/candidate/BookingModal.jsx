import React, { useState } from 'react';
import api from '../../api/axios';
import { Calendar, Link as LinkIcon, Briefcase, X, CreditCard, Upload, File } from 'lucide-react';
import '../candidate/css/BookingModal.css';

const BookingModal = ({ interviewer, onClose }) => {
  const [formData, setFormData] = useState({
    sessionTime: '',
    interviewType: 'DSA',
    submissionLink: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('link');
  const [loading, setLoading] = useState(false);

  if (!interviewer) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('interviewerId', interviewer.id);

      // Ensure sessionTime is clean ISO format without timezone offset
      // LocalDateTime.parse() needs exactly: 2025-05-15T10:00:00
      const rawTime = formData.sessionTime;
      const cleanTime = rawTime.includes('T')
        ? rawTime.substring(0, 19)   // trim any timezone/milliseconds
        : rawTime;
      data.append('sessionTime', cleanTime);
      data.append('interviewType', formData.interviewType);

      if (uploadMode === 'file' && selectedFile) {
        data.append('file', selectedFile);
      } else if (uploadMode === 'link' && formData.submissionLink) {
        data.append('submissionLink', formData.submissionLink);
      }

      // Step 1: Create booking
      const bookingResponse = await api.post('/v1/candidate/book', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const bookingId = bookingResponse.data.id;
      console.log('Booking created with ID:', bookingId);

      // Step 2: Create Stripe checkout session
      // NOTE: axios baseURL already includes /api, so this calls /api/v1/payments/...
      const paymentResponse = await api.post('/v1/payments/create-checkout-session', {
        bookingId: bookingId
      });

      console.log('Payment response:', paymentResponse.data);

      if (paymentResponse.data.checkoutUrl) {
        window.location.href = paymentResponse.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from server');
      }

    } catch (err) {
      console.error('Full error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      alert(
        err.response?.data?.message ||
        err.message ||
        'Failed to initiate payment. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>Book & Pay</h2>
          <p>Interviewer: <strong>{interviewer?.firstName} {interviewer?.lastName}</strong></p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Slot selection */}
          <div className="form-group">
            <label><Calendar size={18} /> Select Available Slot</label>
            <div className="slots-grid">
              {interviewer.availabilitySlots?.length > 0 ? (
                interviewer.availabilitySlots.map((slot, index) => (
                  <div key={index} className="slot-item">
                    <input
                      type="radio"
                      id={`slot-${index}`}
                      name="sessionTime"
                      value={slot}
                      onChange={(e) => setFormData({ ...formData, sessionTime: e.target.value })}
                      required
                    />
                    <label htmlFor={`slot-${index}`}>
                      {new Date(slot).toLocaleString([], {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </label>
                  </div>
                ))
              ) : (
                <p className="no-slots">No slots available for this interviewer.</p>
              )}
            </div>
          </div>

          {/* Interview type */}
          <div className="form-group">
            <label><Briefcase size={18} /> Interview Type</label>
            <select
              value={formData.interviewType}
              onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
              required
            >
              <option value="DSA">Data Structures & Algorithms</option>
              <option value="System Design">System Design</option>
              <option value="Behavioral">Behavioral / HR</option>
              <option value="Full Stack">Full Stack / Web Development</option>
            </select>
          </div>

          {/* Submission toggle */}
          <div className="form-group">
            <label>Resume / GitHub</label>
            <div className="upload-toggle">
              <button
                type="button"
                className={`toggle-btn ${uploadMode === 'link' ? 'active' : ''}`}
                onClick={() => setUploadMode('link')}
              >
                <LinkIcon size={15} /> Link
              </button>
              <button
                type="button"
                className={`toggle-btn ${uploadMode === 'file' ? 'active' : ''}`}
                onClick={() => setUploadMode('file')}
              >
                <Upload size={15} /> Upload File
              </button>
            </div>

            {uploadMode === 'link' ? (
              <input
                type="url"
                placeholder="https://github.com/yourprofile"
                value={formData.submissionLink}
                onChange={(e) => setFormData({ ...formData, submissionLink: e.target.value })}
              />
            ) : (
              <div
                className={`drop-zone ${selectedFile ? 'has-file' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {selectedFile ? (
                  <div className="file-selected">
                    <File size={20} />
                    <span>{selectedFile.name}</span>
                    <small>{(selectedFile.size / 1024).toFixed(1)} KB</small>
                    <button
                      type="button"
                      className="remove-file"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="drop-prompt">
                    <Upload size={24} />
                    <p>Drag & drop or click to upload</p>
                    <small>PDF, DOC, DOCX, TXT, ZIP, PNG, JPG up to 10MB</small>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <div className="price-details">
              <span className="label">Amount Due</span>
              <span className="price-info">${interviewer?.pricePerSession || 20}</span>
            </div>
            <button type="submit" className="confirm-btn pay-btn" disabled={loading}>
              <CreditCard size={18} style={{ marginRight: '8px' }} />
              {loading ? 'Redirecting...' : 'Pay & Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;