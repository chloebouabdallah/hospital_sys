import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === 'doctor') return <DoctorHome user={user} />;
  if (user.role === 'admin') return <AdminHome user={user} />;
  return <PatientHome user={user} />;
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

function AdminHome({ user }) {
  return (
    <div>
      <header className="pg-head">
        <h1>Admin console.</h1>
        <p className="pg-sub">Manage users, doctors, hospitals and the triage engine.</p>
      </header>

      <div className="pg-cards">
        <a href="/dashboard/users" className="pg-card">
          <div className="pg-card-icon">👥</div>
          <h3>Users</h3>
          <p>Browse, edit, or remove patient, doctor, and admin accounts.</p>
        </a>
        <a href="/dashboard/doctors" className="pg-card">
          <div className="pg-card-icon">🩺</div>
          <h3>Doctors</h3>
          <p>Provision doctors and link them to hospitals.</p>
        </a>
        <a href="/dashboard/hospitals" className="pg-card">
          <div className="pg-card-icon">🏥</div>
          <h3>Hospitals</h3>
          <p>Manage hospital records and locations.</p>
        </a>
        <a href="/dashboard/symptoms" className="pg-card">
          <div className="pg-card-icon">🤒</div>
          <h3>Symptoms</h3>
          <p>Manage the symptom checker question bank.</p>
        </a>
        <a href="/dashboard/conditions" className="pg-card">
          <div className="pg-card-icon">📖</div>
          <h3>Conditions</h3>
          <p>Manage conditions and their linked information.</p>
        </a>
        <a href="/dashboard/rules" className="pg-card">
          <div className="pg-card-icon">⚙️</div>
          <h3>Triage rules</h3>
          <p>Manage the rules that drive the symptom checker's recommendations.</p>
        </a>
      </div>
    </div>
  );
}