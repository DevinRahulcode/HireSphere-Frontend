import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Check, X, Calendar, Clock, User, Link as LinkIcon, Info } from 'lucide-react';
import '../interviewer/css/InterviewerDashboard.css';

const InterviewerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      // Note: Ensure you have a GET /api/v1/interviewer/bookings endpoint in your backend
      const response = await api.get('/v1/interviewer/bookings');
      setBookings(response.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // Matches your @PatchMapping("/booking/status")
      await api.patch('/v1/interviewer/booking/status', {
        bookingId: bookingId,
        status: newStatus // "CONFIRMED" or "REJECTED"
      });
      
      // Refresh the list to show updated status
      fetchBookings();
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || "Server Error"));
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Upcoming Sessions</h1>
        <p>Review and manage your mock interview requests.</p>
      </header>

      {loading ? (
        <div className="loading-msg">Fetching your schedule...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <Info size={40} />
          <p>No interview requests yet. Make sure your availability is set!</p>
        </div>
      ) : (
        <div className="booking-requests-list">
          {bookings.map((booking) => (
            <div key={booking.id} className={`booking-request-card ${booking.status.toLowerCase()}`}>
              <div className="request-body">
                <div className="candidate-profile">
                  <div className="avatar-placeholder">
                    {booking.candidate?.firstName?.[0]}
                  </div>
                  <div>
                    <h3>{booking.candidate?.firstName} {booking.candidate?.lastName}</h3>
                    <span className="interview-type">{booking.interviewType || 'General Tech'}</span>
                  </div>
                </div>

                <div className="request-time">
                  <div className="time-row"><Calendar size={16}/> {new Date(booking.sessionTime).toLocaleDateString()}</div>
                  <div className="time-row"><Clock size={16}/> {new Date(booking.sessionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>

                <div className="request-status">
                  <span className={`status-tag ${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>

                {booking.status === 'PENDING' && (
                  <div className="request-actions">
                    <button 
                      className="action-btn accept" 
                      onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')}
                      title="Accept Booking"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      className="action-btn reject" 
                      onClick={() => handleStatusUpdate(booking.id, 'REJECTED')}
                      title="Reject Booking"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
              
              {booking.candidateSubmissionLink && (
                <div className="request-footer">
                  <a href={booking.candidateSubmissionLink} target="_blank" rel="noreferrer">
                    <LinkIcon size={14} /> View Candidate Attachment (Resume/GitHub)
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewerDashboard;