import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardPlaceholder from './pages/DashboardPlaceholder';
import './pages/DashboardHome.css';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminSchedules from './pages/admin/AdminSchedules';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            {/* Patient */}
            <Route path="symptom-checker" element={<DashboardPlaceholder title="Symptom checker" description="Answer a few questions and get a recommendation." />} />
            <Route path="find-care" element={<DashboardPlaceholder title="Find care nearby" description="Hospitals near you and the specialists they have." />} />
            <Route path="appointments" element={<AdminAppointments />} />
            {/* Doctor */}
            <Route path="requests" element={<DashboardPlaceholder title="Pending requests" description="Confirm or cancel bookings." />} />
            <Route path="schedule" element={<DashboardPlaceholder title="My schedule" description="Your hours per hospital." />} />
            <Route path="patients" element={<DashboardPlaceholder title="My patients" description="People you've seen." />} />

            {/* Admin */}
            <Route path="users" element={<DashboardPlaceholder title="Users" description="Manage accounts." />} />
            <Route path="doctors" element={<AdminDoctors />} />          
            <Route path="hospitals" element={<AdminHospitals />} />
            <Route path="schedules" element={<AdminSchedules />} /> 
            <Route path="specialties" element={<DashboardPlaceholder title="Specialties" description="Manage medical specialties." />} />
            <Route path="symptoms" element={<DashboardPlaceholder title="Symptoms" description="Manage the symptom checker question bank." />} />
            <Route path="questions" element={<DashboardPlaceholder title="Questions" description="Follow-up questions per symptom." />} />
            <Route path="conditions" element={<DashboardPlaceholder title="Conditions" description="Manage conditions." />} />
            <Route path="rules" element={<DashboardPlaceholder title="Triage rules" description="Manage the rule engine." />} />
            <Route path="reviews" element={<DashboardPlaceholder title="Reviews" description="Moderate patient reviews." />} />

            {/* Shared */}
            <Route path="profile" element={<DashboardPlaceholder title="Profile" description="Your account details." />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}