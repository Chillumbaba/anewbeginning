import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { GoogleLogin, GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import { useAuth } from './AuthProvider';
import benjamin from '../assets/benjamin-franklin.png';
import axios from 'axios';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const API_URL = process.env.REACT_APP_API_URL || '/api';

const SignIn: React.FC = () => {
  const { setUserAndToken, loading } = useAuth();

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    try {
      const response = await axios.post(`${API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });
      setUserAndToken(response.data.user, response.data.token);
    } catch (error) {
      alert('Google Sign-In failed');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            minWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <img
            src={benjamin}
            alt="Benjamin Franklin"
            style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 8 }}
          />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Sign in to A New Beginning
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Track your progress, set your own rules, and start your journey.
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => alert('Google Sign-In failed')}
              width="100%"
              theme="filled_blue"
              shape="pill"
              text="signin_with"
            />
          )}
        </Paper>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default SignIn; 