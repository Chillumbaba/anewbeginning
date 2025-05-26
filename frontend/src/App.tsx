import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProgressGrid from './components/ProgressGrid';
import Home from './components/Home';
import Rules from './components/Rules';

function App() {
  return (
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
  );
}

export default App; 