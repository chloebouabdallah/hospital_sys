import { useAuth } from '../context/AuthContext';
import AdminOverview from './admin/AdminOverview';
import PatientOverview from './patient/PatientOverview';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === 'doctor') return <DoctorHome user={user} />;
  if (user.role === 'admin') return <AdminOverview />;
  return <PatientOverview />;
}

function PatientHome({ user }) {
  return (
    <div>
      <header className="pg-head">
        <h1>Hi, {user.name.split(' ')[0]}.</h1>
        <p className="pg-sub">Here's what you can do today.</p>
      </header>

      <div className="pg-cards">
        <a href="/dashboard/symptom-checker" className="pg-card">
          <div className="pg-card-icon">🩺</div>
          <h3>Check your symptoms</h3>
          <p>Answer a few questions and get a recommendation for what kind of care you need.</p>
        </a>
        <a href="/dashboard/find-care" className="pg-card">
          <div className="pg-card-icon">📍</div>
          <h3>Find care nearby</h3>
          <p>See hospitals near you and which specialists work there.</p>
        </a>
        <a href="/dashboard/appointments" className="pg-card">
          <div className="pg-card-icon">📅</div>
          <h3>My appointments</h3>
          <p>See your upcoming and past visits.</p>
        </a>
      </div>
    </div>
  );
}

function DoctorHome({ user }) {
  return (
    <div>
      <header className="pg-head">
        <h1>Welcome, {user.name}.</h1>
        <p className="pg-sub">Review your pending requests and manage your schedule.</p>
      </header>

      <div className="pg-cards">
        <a href="/dashboard/requests" className="pg-card">
          <div className="pg-card-icon">📥</div>
          <h3>Pending requests</h3>
          <p>Confirm or cancel patient bookings waiting for your review.</p>
        </a>
        <a href="/dashboard/schedule" className="pg-card">
          <div className="pg-card-icon">🕐</div>
          <h3>My schedule</h3>
          <p>Manage the hours you're available at each hospital.</p>
        </a>
        <a href="/dashboard/patients" className="pg-card">
          <div className="pg-card-icon">🧑‍🤝‍🧑</div>
          <h3>My patients</h3>
          <p>See the patients you've seen.</p>
        </a>
      </div>
    </div>
  );
}