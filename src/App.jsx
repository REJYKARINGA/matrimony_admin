import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Verifications from './pages/Verifications';
import Users from './pages/Users';
import UserProfiles from './pages/UserProfiles';
import Reports from './pages/Reports';
import SuccessStories from './pages/SuccessStories';
import Payments from './pages/Payments';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Verifications />} />
          <Route path="/users" element={<Users />} />
          <Route path="/user-profiles" element={<UserProfiles />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/payments" element={<Payments />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
