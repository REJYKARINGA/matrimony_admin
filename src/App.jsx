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
import Payments from './pages/Payments';
import Education from './pages/Education';
import Occupation from './pages/Occupation';
import FamilyDetails from './pages/FamilyDetails';
import Preferences from './pages/Preferences';
import PromotionSettings from './pages/PromotionSettings';
import MediatorPromotions from './pages/MediatorPromotions';
import WalletTransactions from './pages/WalletTransactions';
import ReligionManagement from './pages/ReligionManagement';

function App() {
  return (
    <BrowserRouter>
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
          <Route path="/payments" element={<Payments />} />
          <Route path="/education" element={<Education />} />
          <Route path="/occupation" element={<Occupation />} />
          <Route path="/religion-management" element={<ReligionManagement />} />
          <Route path="/family-details" element={<FamilyDetails />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/promotion-settings" element={<PromotionSettings />} />
          <Route path="/mediator-promotions" element={<MediatorPromotions />} />
          <Route path="/wallet-transactions" element={<WalletTransactions />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
