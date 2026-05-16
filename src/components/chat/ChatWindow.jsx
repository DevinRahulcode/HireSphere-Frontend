import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../../api/axios';
import { Send, X } from 'lucide-react';
import '../chat/css/ChatWindow.css';

const ChatWindow = ({ booking, currentUser, onClose, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [newMsgPreview, setNewMsgPreview] = useState('');
  const stompClient = useRef(null);
  const scrollRef = useRef(null);

  const isInterviewer =
    currentUser?.role === 'INTERVIEWER' || currentUser?.role === 'ROLE_INTERVIEWER';
  const recipientEmail = isInterviewer
    ? booking?.candidate?.email
    : booking?.interviewer?.email;
  const chatPartnerName = isInterviewer
    ? booking?.candidate?.firstName || 'Candidate'
    : booking?.interviewer?.firstName || 'Interviewer';

  useEffect(() => {
    if (!booking?.id || !currentUser?.email) return;

    api.get(`/v1/chat/history/${booking.id}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('History load failed:', err));

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws-message'),
      reconnectDelay: 5000,
      connectHeaders: { email: currentUser.email },
      onConnect: () => {
        setConnected(true);
        client.subscribe(
          `/user/${currentUser.email}/queue/messages`,
          (msg) => {
            const incoming = JSON.parse(msg.body);
            if (String(incoming.bookingId) === String(booking.id)) {
              setMessages(prev => [...prev, incoming]);
              // Notify parent that a new message arrived from the other person
              if (incoming.senderEmail !== currentUser.email && onNewMessage) {
                onNewMessage(booking.id, incoming);
              }
              // Show in-window new message indicator
              if (incoming.senderEmail !== currentUser.email) {
                setHasNewMessage(true);
                setNewMsgPreview(incoming.content?.slice(0, 60) || '');
              }
            }
          }
        );
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => console.error('STOMP error:', frame.headers['message']),
    });

    client.activate();
    stompClient.current = client;
    return () => client.deactivate();
  }, [booking?.id, currentUser?.email]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !stompClient.current?.connected) return;

    const payload = {
      bookingId: booking.id,
      senderEmail: currentUser.email,
      recipientEmail,
      content: text,
    };

    setMessages(prev => [...prev, { ...payload, timestamp: new Date().toISOString() }]);
    stompClient.current.publish({ destination: '/app/chat.send', body: JSON.stringify(payload) });
    setInput('');
  };

  const handleInputFocus = () => setHasNewMessage(false);

  const handleBannerClick = () => {
    setHasNewMessage(false);
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!currentUser) {
    return (
      <div className="chat-sidebar">
        <div className="chat-header">
          <span>Session Missing</span>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="placeholder-text">Please log in to chat.</p>
      </div>
    );
  }

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <div className="user-info">
          <div className={`status-dot ${connected ? 'online' : 'offline'}`} />
          <span>Chatting with <strong>{chatPartnerName}</strong></span>
        </div>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
      </div>

      <div className="chat-messages">
        {hasNewMessage && (
          <div className="new-msg-banner" onClick={handleBannerClick}>
            <span className="new-msg-dot" />
            New message · {newMsgPreview}{newMsgPreview.length === 60 ? '…' : ''}
          </div>
        )}
        {messages.length === 0 && (
          <p className="placeholder-text">No messages yet. Say hi! 👋</p>
        )}
        {messages.map((m, i) => (
          <div
            key={m.id ?? i}
            className={`msg-wrapper ${m.senderEmail === currentUser.email ? 'me' : 'them'}`}
          >
            <div className="msg-bubble">
              <span>{m.content}</span>
              <small>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="chat-input-area">
        <input
          value={input}
          placeholder="Write a message..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          onFocus={handleInputFocus}
        />
        <button onClick={handleSend} className="send-btn" disabled={!connected}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;