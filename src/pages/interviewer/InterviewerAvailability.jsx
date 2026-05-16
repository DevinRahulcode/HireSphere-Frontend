import React, { useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Save, Calendar } from 'lucide-react';
import '../interviewer/css/InterviewerAvailability.css';

const InterviewerAvailability = () => {
  const [slots, setSlots] = useState(['']);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const addSlot = () => setSlots([...slots, '']);

  const removeSlot = (index) => {
    const newSlots = slots.filter((_, i) => i !== index);
    setSlots(newSlots);
  };

  const handleSlotChange = (index, value) => {
    const newSlots = [...slots];
    newSlots[index] = value;
    setSlots(newSlots);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/v1/interviewer/availability', {
        slots: slots.filter(s => s !== ''),
        price: parseFloat(price)
      });
      alert("Availability and pricing updated successfully!");
    } catch (err) {
      alert("Error updating availability: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="availability-page">
      <div className="availability-container">
        <div className="availability-card">
          <div className="page-header">
            <div className="icon-wrapper">
              <Calendar size={32} />
            </div>
            <div>
              <h1>Manage Availability</h1>
              <p>Set your available time slots and session price</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="availability-form">
            {/* Pricing Section */}
            <div className="form-section">
              <label className="section-label">Price Per Session</label>
              <div className="price-input-wrapper">
                <span className="dollar-sign">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="price-input"
                  required
                />
              </div>
            </div>

            {/* Time Slots Section */}
            <div className="form-section">
              <label className="section-label">Available Time Slots</label>
              
              <div className="slots-container">
                {slots.map((slot, index) => (
                  <div key={index} className="slot-row">
                    <input
                      type="datetime-local"
                      value={slot}
                      onChange={(e) => handleSlotChange(index, e.target.value)}
                      className="slot-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      className="remove-btn"
                      disabled={slots.length === 1}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addSlot}
                className="add-slot-btn"
              >
                <Plus size={20} />
                Add Another Slot
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="save-btn"
            >
              <Save size={22} />
              {loading ? 'Saving Changes...' : 'Save Availability'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewerAvailability;