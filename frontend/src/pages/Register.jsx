import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.data?.error || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <h1>Create a patient account</h1>
        <p className="subtitle">
          Self-registration is for patients only — doctor/admin accounts are created by admin.
        </p>

        {success ? (
          <p className="success">Account created! Redirecting to login...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="min 8 chars, 1 letter + 1 number"
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Register'}
            </button>
          </form>
        )}

        <p className="form-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}