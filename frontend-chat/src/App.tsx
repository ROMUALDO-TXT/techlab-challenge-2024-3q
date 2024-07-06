import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Home from './pages/Home';
import { PrivateRoute } from './components/PrivateRoute';
import { ColorModeProvider } from './contexts/ColorModeContext.js';
import { CssBaseline } from '@mui/material';

const queryClient = new QueryClient()


export function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <ColorModeProvider>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route index element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } />
            </Routes>
          </BrowserRouter>
        </ColorModeProvider>
    </QueryClientProvider>
  )
}
