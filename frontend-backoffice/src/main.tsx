import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.js'
import { AuthProvider } from './contexts/AuthContext.js'
import { CookiesProvider } from 'react-cookie'
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
