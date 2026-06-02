import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import PublicLayout from './components/PublicLayout';
import LandingPage from './pages/LandingPage';
import PetPublicPage from './pages/PetPublicPage';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

const App = () => (
  <ToastProvider>
    <Router basename={basename}>
      <Routes>
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
