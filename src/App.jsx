import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import PublicLayout from './components/PublicLayout';
import LandingPage from './pages/LandingPage';
import PetPublicPage from './pages/PetPublicPage';
import AppDashboard from './AppDashboard';

const App = () => (
  <ToastProvider>
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pet" element={<PetPublicPage />} />
          <Route path="/pet/:petId" element={<PetPublicPage />} />
        </Route>
        <Route path="/app/*" element={<AppDashboard />} />
      </Routes>
    </Router>
  </ToastProvider>
);

export default App;
