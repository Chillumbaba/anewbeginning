import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthProvider';
import SignIn from './components/SignIn';
import ProgressGrid from './components/ProgressGrid';
import Rules from './components/Rules';
import Statistics from './components/Statistics';
import Navigation from './components/Navigation';
import DbAdmin from './components/DbAdmin';
import { Box, CircularProgress } from '@mui/material';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Navigation />
      <Routes>
        <Route path="/" element={<ProgressGrid />} />
        <Route path="/dashboard" element={<Statistics />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/administer" element={<DbAdmin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
};

export default App; 