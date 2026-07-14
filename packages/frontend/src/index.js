import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565C0' },
    secondary: { main: '#2E7D32' },
    error: { main: '#C62828' },
    warning: { main: '#ED6C02' },
    background: { default: '#F7F9FC', paper: '#FFFFFF' },
    text: { primary: '#1A1A1A', secondary: '#4F4F4F' },
  },
  spacing: 8,
  typography: {
    fontFamily: "'Roboto', 'Segoe UI', sans-serif",
    h5: { fontWeight: 600, fontSize: '1.5rem' },
    h6: { fontWeight: 600, fontSize: '1.125rem' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);