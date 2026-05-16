import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// 1. Import Amplify
import { Amplify } from 'aws-amplify';

// 2. Configure Amplify with your Cognito details
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_piKKL6eqs',
      userPoolClientId: '5o6l8ggdh4u205bvvg7am3l399', // The one you found in Step 1
      signUpVerificationMethod: 'code' // Usually 'code' for email verification
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);