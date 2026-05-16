import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; // Main service API (port 8081)
import { Search, DollarSign, Briefcase, Calendar, Star, Filter } from 'lucide-react';
import BookingModal from './BookingModal';
import '../candidate/css/InterviewerSearch.css';

const InterviewerSearch = () => {
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    specialization: '',
    maxPrice: ''
  });

  const [selectedInterviewer, setSelectedInterviewer] = useState(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};

      if (filters.specialization?.trim()) {
        params.spec = filters.specialization.trim();
      }
      if (filters.maxPrice) {
        params.price = filters.maxPrice;
      }

      const response = await api.get('/v1/candidate/search', { params });

      setInterviewers(response.data || []);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.response?.data?.message || "Failed to fetch interviewers. Please try again.");
      setInterviewers([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch when filters change (better UX)
  useEffect(() => {
    fetchResults();
  }, [filters.specialization, filters.maxPrice]); // Re-fetch when filters change

  return (
    <div className="search-container">
      <aside className="search-sidebar">
        <div className="filter-header">
          <Filter size={20} />
          <h2>Filters</h2>
        </div>

        <div className="filter-group">
          <label>Specialization</label>
          <div className="input-with-icon">
            <Briefcase size={18} />
            <input
              type="text"
              placeholder="e.g. Java, React, Python"
              value={filters.specialization}
              onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Max Price ($/hr)</label>
          <div className="input-with-icon">
            <DollarSign size={18} />
            <input
              type="number"
              placeholder="Max budget"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
        </div>

        <button className="apply-btn" onClick={fetchResults}>
          Apply Filters
        </button>
      </aside>

      <main className="search-results">
        <header className="results-header">
          <h1>Available Experts</h1>
          <p>{interviewers.length} interviewers found</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-state">Finding the best matches...</div>
        ) : interviewers.length === 0 ? (
          <div className="no-results">
            <p>No interviewers found matching your criteria.</p>
            <button onClick={fetchResults}>Try Again</button>
          </div>
        ) : (
          <div className="interviewer-grid">
            {interviewers.map((interviewer) => (
              <div key={interviewer.id} className="interviewer-card">
                <div className="card-accent"></div>
                <div className="card-content">
                  <div className="user-info">
                    <div className="avatar">
                      {interviewer.firstName?.[0]}{interviewer.lastName?.[0]}
                    </div>
                    <div>
                      <h3>{interviewer.firstName} {interviewer.lastName}</h3>
                      <span className="spec-tag">
                        {interviewer.specialization || 'Tech Expert'}
                      </span>
                    </div>
                  </div>

                  <p className="bio-text">
                    {interviewer.bio || "Experienced professional ready to help you ace your next technical interview."}
                  </p>

                  <div className="card-stats">
                    <div className="stat">
                      <Calendar size={16} />
                      <span>{interviewer.availabilitySlots?.length || 0} slots</span>
                    </div>
                    <div className="stat">
                      <Star size={16} className="star-icon" />
                      <span>4.9 (New)</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="price">
                      ${interviewer.pricePerSession}<span>/hr</span>
                    </div>
                    <button
                      className="book-now-btn"
                      onClick={() => setSelectedInterviewer(interviewer)}
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedInterviewer && (
        <BookingModal
          interviewer={selectedInterviewer}
          onClose={() => setSelectedInterviewer(null)}
        />
      )}
    </div>
  );
};

export default InterviewerSearch;