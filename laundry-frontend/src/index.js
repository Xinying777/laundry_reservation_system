// app entry point, responsible for initializing the React app and rendering the root component
// Main functions: Create React root node, enable strict mode to check for potential issues, mount main App components to DOM


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);