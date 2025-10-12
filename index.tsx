import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './tailwind.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// This is the standard, correct way to render a React application.
// All complex, failed initialization logic has been removed.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
