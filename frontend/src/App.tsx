import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from './components/Navigation';
import ProgressGrid from './components/ProgressGrid';
import Home from './components/Home';
import Rules from './components/Rules';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <Navigation />
          <Routes>
            <Route path="/grid" element={<ProgressGrid />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 