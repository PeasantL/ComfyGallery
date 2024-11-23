import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme} from '@mui/material';
//import { GlobalStyles } from '@mui/system';
import App from './App';

// Define the debug styles
// const debugStyles = {
//   '*': {
//     border: '1px dashed rgba(255, 0, 0, 0.5) !important', // Debug border for all elements
//     boxSizing: 'border-box',
//   },
//   '*::before': {
//     border: '1px dashed rgba(255, 0, 0, 0.5) !important',
//   },
//   '*::after': {
//     border: '1px dashed rgba(255, 0, 0, 0.5) !important',
//   },
// };

// Define your dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {/* <GlobalStyles styles={debugStyles} />  */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
