import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Calendar, Home, Menu, X, ClipboardList, Search } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Improved role extraction for Cognito JWT
  const getDisplayRole = () => {
    if (!user) return '';

    // Cognito puts groups in 'cognito:groups'
    let groups = user['cognito:groups'];

    if (!groups) {
      // Fallback: check if role exists directly
      groups = user.role || user.groups;
    }

    if (Array.isArray(groups)) {
      const firstGroup = groups[0];
      return typeof firstGroup === 'string' 
        ? firstGroup.replace('ROLE_', '').toLowerCase() 
        : '';
    }

    if (typeof groups === 'string') {
      return groups.replace('ROLE_', '').toLowerCase();
    }

    return '';
  };

  const displayRole = getDisplayRole();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Home size={22} />
          </div>
          <span>HireSphere</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          {!user ? (
            <div className="auth-buttons">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          ) : (
            <>
              <div className="nav-links">
                {/* Interviewer Links */}
                {displayRole === 'interviewer' && (
                  <>
                    <Link to="/interviewer/availability" className="nav-item">
                      <Calendar size={20} />
                      <span>Availability</span>
                    </Link>
                    <Link to="/interviewer/sessions" className="nav-item">
                      <ClipboardList size={20} />
                      <span>Scheduled Sessions</span>
                    </Link>
                  </>
                )}

                {/* Candidate Links */}
                {displayRole === 'candidate' && (
                  <>
                    <Link to="/candidate/search" className="nav-item">
                      <Search size={20} />
                      <span>Find Interviewers</span>
                    </Link>
                    <Link to="/candidate/bookings" className="nav-item">
                      <ClipboardList size={20} />
                      <span>My Bookings</span>
                    </Link>
                  </>
                )}
              </div>

              {/* User Profile Section */}
              <div className="user-menu">
                <div className="user-profile">
                  <div className="avatar">
                    {user.sub?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <p className="user-name">
                      {user.given_name || user.email || user.sub}
                    </p>
                    <p className="user-role">{displayRole}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="logout-btn" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            {!user ? (
              <>
                <Link to="/login" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary mobile-cta" onClick={() => setIsMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {displayRole === 'interviewer' && (
                  <>
                    <Link to="/interviewer/availability" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                      <Calendar size={24} /> Availability
                    </Link>
                    <Link to="/interviewer/sessions" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                      <ClipboardList size={24} /> Scheduled Sessions
                    </Link>
                  </>
                )}

                {displayRole === 'candidate' && (
                  <>
                    <Link to="/candidate/search" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                      <Search size={24} /> Find Interviewers
                    </Link>
                    <Link to="/candidate/bookings" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                      <ClipboardList size={24} /> My Bookings
                    </Link>
                  </>
                )}

                <div className="mobile-user-section">
                  <div className="mobile-user-profile">
                    <div className="avatar avatar-large">
                      {user.sub?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="user-name">{user.given_name || user.email}</p>
                      <p className="user-role">{displayRole}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={24} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;