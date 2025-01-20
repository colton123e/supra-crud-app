import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { loadConfig } from './utils/config';

async function init() {
  try {
      // Load the configuration file before rendering the app
      await loadConfig();
      createRoot(document.getElementById('root')).render(
        <StrictMode>
          <App />
        </StrictMode>,
      );
  } catch (error) {
      console.error('Failed to initialize app:', error);
      // Optionally, render an error screen or fallback UI
      createRoot(document.getElementById('root')).render(
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <h1>Failed to load configuration</h1>
              <p>Please try again later.</p>
          </div>
      );
  }
}

init();