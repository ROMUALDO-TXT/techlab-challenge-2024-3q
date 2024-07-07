import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute.js';
import SignIn from './pages/SignIn.js';
import Home from './pages/Home.js';
import Users from './pages/Users.js';
import Consumers from './pages/Consumers.js';
import Conversations from './pages/Conversations.js';
import { ColorModeProvider } from './contexts/ColorModeContext.js';

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeProvider>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<SignIn />} />
            <Route path="/:param?" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            } />
            <Route path="/consumers" element={
              <PrivateRoute>
                <Consumers />
              </PrivateRoute>
            } />
            <Route path="/conversations" element={
              <PrivateRoute>
                <Conversations />
              </PrivateRoute>
            } />
          </Routes>
        </BrowserRouter>
      </ColorModeProvider>
    </QueryClientProvider>
  )
}
