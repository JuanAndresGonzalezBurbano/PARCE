import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './controllers/AuthContext'
import { ServiceProvider } from './controllers/ServiceContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ServiceProvider>
        <App />
      </ServiceProvider>
    </AuthProvider>
  </React.StrictMode>,
)
