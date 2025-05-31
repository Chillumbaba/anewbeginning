import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from './components/Navigation';
import ProgressGrid from './components/ProgressGrid';
import Home from './components/Home';
import Rules from './components/Rules';

const theme = createTheme({
  components: {
    MuiPopover: {
      defaultProps: {
        container: document.body
      }
    },
    MuiPopper: {
      defaultProps: {
        container: document.body
      }
    },
    MuiModal: {
      defaultProps: {
        container: document.body
      }
    }
  }
});

function App() {
  return (
    <HashRouter>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navigation />
            <div style={{ flex: 1, padding: '20px' }}>
              <Routes>
                <Route path="/grid" element={<ProgressGrid />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/" element={<Home />} />
              </Routes>
            </div>
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    </HashRouter>
  );
}

export default App; 