import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import {
  Check,
  X,
  Calendar,
  Clock,
  Link as LinkIcon,
  AlertCircle,
  ClipboardCheck,
  MessageCircle
} from 'lucide-react';
import EvaluationModal from '../../components/interviewer/EvaluationModal';
import ChatWindow from '../../components/chat/ChatWindow';
import '../interviewer/css/InterviewerSessions.css';

const Toast = ({ toasts, onDismiss }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className="toast" onClick={() => onDismiss(t.id)}>
        <div className="toast-avatar">{t.senderName?.[0] || '?'}</div>
        <div className="toast-body">
          <p className="toast-name">{t.senderName}</p>
          <p className="toast-msg">{t.content}</p>
        </div>
        <button className="toast-close"><X size={14} /></button>
      </div>
    ))}
  </div>
);

const InterviewerSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // unread counts per bookingId
  const [unreadCounts, setUnreadCounts] = useState({});
  // toast notifications
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setCurrentUser(JSON.parse(userData)); }
      catch (e) { console.error('Error parsing user data', e); }
    }
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/v1/interviewer/bookings');
      setSessions(response.data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await api.patch('/v1/interviewer/booking/status', { bookingId, status });
      fetchSessions();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update status: ' + (err.response?.data?.message || 'Error'));
    }
  };

  // Called by ChatWindow when a new message arrives from the other person
  const handleNewMessage = (bookingId, message) => {
    // Only show badge/toast if this chat is not currently open
    if (!activeChat || activeChat.id !== bookingId) {
      setUnreadCounts(prev => ({
        ...prev,
        [bookingId]: (prev[bookingId] || 0) + 1,
      }));

      // Find sender name from sessions
      const session = sessions.find(s => s.id === bookingId);
      const senderName = session?.candidate?.firstName || 'Candidate';

      const toastId = Date.now();
      setToasts(prev => [...prev, {
        id: toastId,
        bookingId,
        senderName,
        content: message.content.length > 50
          ? message.content.slice(0, 50) + '...'
          : message.content,
      }]);

      // Auto-dismiss after 4 seconds
      toastTimers.current[toastId] = setTimeout(() => {
        dismissToast(toastId);
      }, 4000);
    }
  };

  const dismissToast = (toastId) => {
    clearTimeout(toastTimers.current[toastId]);
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  // Clear unread count when chat is opened
  const openChat = (session) => {
    setActiveChat(session);
    setUnreadCounts(prev => ({ ...prev, [session.id]: 0 }));
  };

  return (
    <div className="sessions-container">
      <header className="sessions-header">
        <h1>Interview Requests</h1>
        <p>Review and manage your upcoming mock interview sessions.</p>
      </header>

      {loading ? (
        <div className="loader">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={40} />
          <p>No booking requests found.</p>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map((session) => (
            <div key={session.id} className={`session-card ${session.status.toLowerCase()}`}>
              <div className="session-main">
                <div className="candidate-info">
                  <div className="avatar-circle">{session.candidate?.firstName?.[0]}</div>
                  <div>
                    <h3>{session.candidate?.firstName} {session.candidate?.lastName}</h3>
                    <span className="type-tag">{session.interviewType || 'General'}</span>
                  </div>
                </div>

                <div className="session-details">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{new Date(session.sessionTime).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{new Date(session.sessionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {session.candidateSubmissionLink && (
                    <a href={session.candidateSubmissionLink} target="_blank" rel="noreferrer" className="link-item">
                      <LinkIcon size={14} /> Resume/GitHub
                    </a>
                  )}
                </div>

                <div className="session-status">
                  <span className={`status-label ${session.status.toLowerCase()}`}>
                    {session.status}
                  </span>
                </div>

                <div className="action-buttons">
                  {session.status !== 'REJECTED' && session.status !== 'CANCELLED' && (
                    <button
                      className="btn-chat-icon"
                      onClick={() => openChat(session)}
                      title="Chat with Candidate"
                    >
                      <MessageCircle size={20} />
                      {/* Unread badge */}
                      {unreadCounts[session.id] > 0 && (
                        <span className="unread-badge">
                          {unreadCounts[session.id] > 9 ? '9+' : unreadCounts[session.id]}
                        </span>
                      )}
                    </button>
                  )}

                  {session.status === 'PENDING' && (
                    <>
                      <button className="btn-accept" onClick={() => updateStatus(session.id, 'ACCEPTED')} title="Accept Session">
                        <Check size={20} />
                      </button>
                      <button className="btn-reject" onClick={() => updateStatus(session.id, 'REJECTED')} title="Reject Session">
                        <X size={20} />
                      </button>
                    </>
                  )}

                  {session.status === 'ACCEPTED' && (
                    <button className="btn-evaluate" onClick={() => setSelectedBooking(session)}>
                      <ClipboardCheck size={18} />
                      <span>Evaluate</span>
                    </button>
                  )}

                  {session.status === 'COMPLETED' && (
                    <span className="completed-check"><Check size={18} /> Done</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <EvaluationModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onSuccess={fetchSessions}
        />
      )}

      {activeChat && currentUser && (
        <ChatWindow
          booking={activeChat}
          currentUser={currentUser}
          onClose={() => setActiveChat(null)}
          onNewMessage={handleNewMessage}
        />
      )}

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default InterviewerSessions;