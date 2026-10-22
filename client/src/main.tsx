import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#1a1a1a',
          border: '1px solid #e8e2d9',
          borderRadius: '10px',
          fontSize: '13px',
          fontFamily: 'Inter, system-ui, sans-serif',
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#3b6ef0',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  </React.StrictMode>,
)
