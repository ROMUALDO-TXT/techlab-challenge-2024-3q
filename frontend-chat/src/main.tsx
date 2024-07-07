import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.js'
import { CookiesProvider } from 'react-cookie'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CookiesProvider>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </CookiesProvider>
  </React.StrictMode>,
)
