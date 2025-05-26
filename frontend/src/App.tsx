import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProgressGrid from './components/ProgressGrid';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route path="/grid" element={<ProgressGrid />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 