import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import './DashboardLayout.css';

const NAV = {
  patient: [
    { to: '/dashboard', label: 'Overview', icon: '🏠', end: true },
    { to: '/dashboard/symptom-checker', label: 'Symptom checker', icon: '🩺' },
    { to: '/dashboard/find-care', label: 'Find care', icon: '📍' },
    { to: '/dashboard/appointments', label: 'My appointments', icon: '📅' },
    { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ],
  doctor: [
    { to: '/dashboard', label: 'Overview', icon: '🏠', end: true },
    { to: '/dashboard/requests', label: 'Requests', icon: '📥' },
    { to: '/dashboard/schedule', label: 'My schedule', icon: '🕐' },
    { to: '/dashboard/patients', label: 'Patients', icon: '🧑‍🤝‍🧑' },
    { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ],
  admin: [
    { to: '/dashboard', label: 'Overview', icon: '🏠', end: true },
    { to: '/dashboard/users', label: 'Users', icon: '👥' },
    { to: '/dashboard/doctors', label: 'Doctors', icon: '🩺' },
    { to: '/dashboard/hospitals', label: 'Hospitals', icon: '🏥' },
    { to: '/dashboard/symptoms', label: 'Symptoms', icon: '🤒' },
    { to: '/dashboard/conditions', label: 'Conditions', icon: '📖' },
    { to: '/dashboard/rules', label: 'Triage rules', icon: '⚙️' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const role = user?.role ?? 'patient';
  const items = NAV[role] ?? NAV.patient;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="dl-shell">
      <aside className="dl-side">
        <Link to="/dashboard" className="dl-brand">
          <Logo size={38} />
          <span>GuideCare</span>
        </Link>

        <nav className="dl-nav">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) => `dl-link${isActive ? ' is-active' : ''}`}
            >
              <span className="dl-link-icon" aria-hidden="true">{it.icon}</span>
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dl-side-foot">
          <p className="dl-role">Signed in as</p>
          <p className="dl-name">{user?.name}</p>
          <span className={`dl-badge dl-badge-${role}`}>{role}</span>
        </div>
      </aside>

      <div className="dl-main">
        <header className="dl-top">
          <div />
          <div className="dl-top-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <button className="btn btn-sm" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        <main className="dl-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}