import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MediatorDashboard from './pages/MediatorDashboard';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Verifications from './pages/Verifications';
import Users from './pages/Users';
import UserProfiles from './pages/UserProfiles';
import Reports from './pages/Reports';
import SuccessStories from './pages/SuccessStories';
import EngagementPosters from './pages/EngagementPosters';
import Payments from './pages/Payments';
import Education from './pages/Education';
import Occupation from './pages/Occupation';
import FamilyDetails from './pages/FamilyDetails';
import Preferences from './pages/Preferences';
import PromotionSettings from './pages/PromotionSettings';
import MediatorPromotions from './pages/MediatorPromotions';
import WalletTransactions from './pages/WalletTransactions';
import ReligionManagement from './pages/ReligionManagement';
import Interests from './pages/Interests';
import Personalities from './pages/Personalities';
import AuditLogs from './pages/AuditLogs';
import ContactUnlocks from './pages/ContactUnlocks';
import Suggestions from './pages/Suggestions';
import PhotoVerifications from './pages/PhotoVerifications';
import ProfileVerifications from './pages/ProfileVerifications';
import PhotoRequests from './pages/PhotoRequests';
import ErrorBoundary from './components/ErrorBoundary';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          {showSplash ? (
            <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
          ) : (
            <div key="app-content">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/mediator/dashboard" element={<MediatorDashboard />} />

                {/* Protected Admin Routes */}
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/verifications" element={<Verifications />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/user-profiles" element={<UserProfiles />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/success-stories" element={<SuccessStories />} />
                  <Route path="/engagement-posters" element={<EngagementPosters />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/occupation" element={<Occupation />} />
                  <Route path="/interests" element={<Interests />} />
                  <Route path="/personalities" element={<Personalities />} />
                  <Route path="/audit-logs" element={<AuditLogs />} />
                  <Route path="/contact-unlocks" element={<ContactUnlocks />} />
                  <Route path="/religion-management" element={<ReligionManagement />} />
                  <Route path="/family-details" element={<FamilyDetails />} />
                  <Route path="/preferences" element={<Preferences />} />
                  <Route path="/promotion-settings" element={<PromotionSettings />} />
                  <Route path="/mediator-promotions" element={<MediatorPromotions />} />
                  <Route path="/wallet-transactions" element={<WalletTransactions />} />
                  <Route path="/suggestions" element={<Suggestions />} />
                  <Route path="/photo-verifications" element={<PhotoVerifications />} />
                  <Route path="/profile-verifications" element={<ProfileVerifications />} />
                  <Route path="/photo-requests" element={<PhotoRequests />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          )}
        </AnimatePresence>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
