import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(30, 32, 44, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif'
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#0a0b14' }
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#0a0b14' }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
