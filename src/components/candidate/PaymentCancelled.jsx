import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <AlertCircle size={80} color="#ef4444" />
      <h1 style={{ marginTop: '20px' }}>Payment Cancelled</h1>
      <p>The payment process was not completed. No charges were made.</p>
      <button 
        className="btn-outline" 
        onClick={() => navigate('/candidate/search')}
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Try Again
      </button>
    </div>
  );
};

export default PaymentCancelled;