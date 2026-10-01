import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-secondary">
            Log out
          </button>
        </div>

        <div className="dashboard-card">
          <p>
            This is the empty shell — everything past this point (symptom checker, doctor search,
            booking, role-specific views) gets built in Weeks 3–6. Right now this page just proves
            auth is wired end to end: the token in localStorage got you past{' '}
            <code>ProtectedRoute</code>, and the data below came from a real call to{' '}
            <code>GET /users/me</code>.
          </p>

          {user && (
            <dl className="user-info">
              <dt>Name</dt>
              <dd>{user.name}</dd>
              <dt>Email</dt>
              <dd>{user.email}</dd>
              <dt>Role</dt>
              <dd>
                <span className="role-badge">{user.role}</span>
              </dd>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}