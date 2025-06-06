import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from './components/Navigation';
import ProgressGrid from './components/ProgressGrid';
import Home from './components/Home';
import Rules from './components/Rules';
import Statistics from './components/Statistics';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
  },
  palette: {
    primary: {
      main: '#000000',
      dark: '#000000',
      light: '#333333',
    },
    background: {
      default: '#F7C06B',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    // Custom colors for our application
    custom: {
      lightBlue: '#A7D1E1',
      yellow: '#F7C06B',
      beige: '#E8E1D5',
      orange: '#E87C3E',
      purple: '#D4C6E3',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          borderRadius: '12px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: 'none',
          borderRadius: '12px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#F7C06B',
          color: '#000000',
          boxShadow: 'none',
          borderBottom: 'none',
        },
      },
    },
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
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          '&.Mui-selected': {
            color: '#000000',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#E8E1D5',
          borderRadius: 8,
          height: 8,
        },
        bar: {
          backgroundColor: '#E87C3E',
          borderRadius: 8,
        },
      },
    },
  },
});

// Add custom colors to the theme type
declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      lightBlue: string;
      yellow: string;
      beige: string;
      orange: string;
      purple: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      lightBlue: string;
      yellow: string;
      beige: string;
      orange: string;
      purple: string;
    };
  }
}

function App() {
  return (
    <HashRouter>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            backgroundColor: '#F7C06B',
          }}>
            <Navigation />
            <div style={{ 
              flex: 1, 
              padding: '40px 20px',
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%',
            }}>
              <Routes>
                <Route path="/grid" element={<ProgressGrid />} />
                <Route path="/stats" element={<Statistics />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/test-db" element={<Home />} />
                <Route path="/" element={<Navigate to="/grid" replace />} />
              </Routes>
            </div>
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    </HashRouter>
  );
}

export default App; 