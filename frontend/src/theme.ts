import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Inter, Helvetica, Arial, sans-serif',
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
});

// Extend the Palette type
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

export default theme; 