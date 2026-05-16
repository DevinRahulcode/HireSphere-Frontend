import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Optional: You can call your backend here to verify the session
      // and show a specific confirmation message.
      console.log("Payment successful for session:", sessionId);
    }
  }, [sessionId]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <CheckCircle size={80} color="#22c55e" />
      <h1 style={{ marginTop: '20px' }}>Payment Successful!</h1>
      <p>Your interview session has been confirmed and paid.</p>
      <button 
        className="btn-primary" 
        onClick={() => navigate('/candidate/bookings')}
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Go to My Bookings
      </button>
    </div>
  );
};

export default PaymentSuccess;