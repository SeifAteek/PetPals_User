import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import PublicLayout from './components/PublicLayout';
import LandingPage from './pages/LandingPage';
import PetPublicPage from './pages/PetPublicPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AppDashboard from './AppDashboard';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

const App = () => (
  <ToastProvider>
    <Router basename={basename}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/app/*" element={<AppDashboard />} />
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pet" element={<PetPublicPage />} />
          <Route path="/pet/:petId" element={<PetPublicPage />} />
        </Route>
      </Routes>
    </Router>
  </ToastProvider>
);

export default App;
