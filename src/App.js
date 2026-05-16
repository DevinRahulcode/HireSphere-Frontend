import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import InterviewerAvailability from './pages/interviewer/InterviewerAvailability';
import InterviewerSearch from './components/candidate/InterviewerSearch';

import './App.css';
import CandidateBookings from './components/candidate/CandidateBookings';
import InterviewerSessions from './pages/interviewer/InterviewerSessions';
import InterviewerDashboard from './pages/interviewer/InterviewerDashboard';
import PaymentSuccess from './components/candidate/PaymentSuccess';
import PaymentCancelled from './components/candidate/PaymentCancelled';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Interviewer Routes */}
          <Route path="/interviewer/availability" element={<InterviewerAvailability />} />
          <Route path="/interviewer/sessions" element={<InterviewerSessions />} />
          <Route path="/interviewer/dashboard" element={<InterviewerDashboard />} />

          {/* Candidate Routes */}
          <Route path="/candidate/search" element={<InterviewerSearch />} />
          {/* This route should show the list of interviews the candidate has already booked */}
          <Route path="/candidate/bookings" element={<CandidateBookings />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
        </Routes>
      </div>
    </Router>
  );
}

/* ==================== Modern Home Page ==================== */
const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="beta-badge">
            <span className="pulse-dot"></span>
            <span>Now Open for Beta</span>
          </div>

          <h1 className="hero-title">
            Master Interviews with{' '}
            <span className="gradient-text">Real Professionals</span>
          </h1>

          <p className="hero-subtitle">
            Practice technical interviews with experienced engineers.<br />
            Get real-time feedback and boost your confidence.
          </p>

          <div className="hero-buttons">
            <a href="/register" className="btn-primary">Get Started for Free</a>
            <a href="/candidate/search" className="btn-secondary">Explore Interviewers</a>
          </div>

          <div className="hero-trust">
            <div>✓ No credit card required</div>
            <div>✓ 1000+ mock interviews conducted</div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Why Choose MockInterviews?</h2>
          <p>Everything you need to ace your next interview</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: "🎯",
    title: "Real Interview Experience",
    desc: "Practice with senior engineers from top tech companies in realistic 45-60 minute sessions."
  },
  {
    icon: "📝",
    title: "Detailed Feedback",
    desc: "Get structured feedback on communication, problem-solving, system design, and behavioral skills."
  },
  {
    icon: "📅",
    title: "Flexible Scheduling",
    desc: "Book sessions that fit your timezone and schedule. Cancel or reschedule anytime."
  }
];

export default App;