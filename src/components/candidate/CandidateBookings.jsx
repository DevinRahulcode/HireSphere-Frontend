import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  AlertCircle, 
  Award, 
  MessageCircle 
} from 'lucide-react';
import EvaluationReportModal from './EvaluationReportModal';
import ChatWindow from '../chat/ChatWindow'; // Ensure this path is correct
import '../candidate/css/CandidateBookings.css';

const CandidateBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the evaluation report modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // NEW: State for the chat window
  const [activeChat, setActiveChat] = useState(null);

  // Get current user from storage/context to pass to ChatWindow
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/v1/candidate/bookings');
        setBookings(response.data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <header className="page-header">
          <h1>My Scheduled Interviews</h1>
          <p>Manage your upcoming sessions and view past feedback</p>
        </header>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your sessions...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={64} strokeWidth={1.5} />
            <h3>No interviews booked yet</h3>
            <p>Start your journey by finding an experienced interviewer</p>
            <a href="/candidate/search" className="btn-primary">
              Find Interviewers
            </a>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-content">
                  <div className="interviewer-info">
                    <div className="avatar-sm">
                      {booking.interviewer?.firstName?.[0] || 'I'}
                    </div>
                    <div className="interviewer-details">
                      <h3>
                        {booking.interviewer?.firstName} {booking.interviewer?.lastName}
                      </h3>
                      <span className="interview-type">
                        {booking.interviewType || 'Technical Interview'}
                      </span>
                    </div>
                  </div>

                  <div className="booking-time">
                    <div className="time-row">
                      <Calendar size={18} />
                      <span>{new Date(booking.sessionTime).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'short', day: 'numeric'
                      })}</span>
                    </div>
                    <div className="time-row">
                      <Clock size={18} />
                      <span>{new Date(booking.sessionTime).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                      })}</span>
                    </div>
                  </div>

                  <div className="status-container">
                    <span className={`status-pill ${booking.status?.toLowerCase() || 'pending'}`}>
                      {booking.status || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="booking-actions">
                  {/* Global Chat Button: Always available to message the interviewer */}
                  <button 
                    className="btn-chat-icon" 
                    onClick={() => setActiveChat(booking)}
                    title="Chat with Interviewer"
                  >
                    <MessageCircle size={20} />
                  </button>

                  {/* Case 1: Interview is completed - Show Evaluation Feedback */}
                  {booking.status === 'COMPLETED' ? (
                    <button 
                      className="btn-success-report"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <Award size={18} />
                      View Feedback
                    </button>
                  ) : (
                    /* Case 2: Interview is Pending or Accepted - Show standard actions */
                    <>
                      <button className="btn-outline">
                        <FileText size={18} />
                        Details
                      </button>
                      <button 
                        className="btn-primary"
                        disabled={booking.status !== 'ACCEPTED'}
                        onClick={() => {
                          if (booking.meetingRoomId) {
                            window.location.href = `/video-call/${booking.meetingRoomId}`;
                          }
                        }}
                      >
                        <Video size={18} />
                        Join Interview
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing evaluation details */}
      {selectedBooking && (
        <EvaluationReportModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}

      {/* Chat Window Implementation */}
      {activeChat && (
        <ChatWindow 
          booking={activeChat} 
          currentUser={currentUser} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
};

export default CandidateBookings;