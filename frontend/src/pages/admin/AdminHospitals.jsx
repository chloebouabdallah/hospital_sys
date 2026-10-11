import { useEffect, useState } from 'react';
import { api } from '../../api/client';

// ---------- Inline styles ----------
const CSS = `
.ah-page { display: flex; flex-direction: column; gap: 22px; }

.ah-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}
.ah-header h1 {
  font-family: var(--font-head);
  font-size: 28px;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}
.ah-sub { color: var(--mut); font-size: 14px; margin: 0; }

.ah-table-wrap {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
}
.ah-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.ah-table th {
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mut);
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--line);
}
.ah-table td {
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  vertical-align: middle;
}
.ah-table tr:last-child td { border-bottom: none; }

.ah-name { font-weight: 600; margin: 0; }
.ah-address { font-size: 12px; color: var(--mut); margin: 2px 0 0; }
.ah-coords {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--mut);
}
.ah-count {
  display: inline-block;
  min-width: 22px;
  text-align: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--soft);
  color: var(--v);
  font-weight: 700;
  font-size: 12px;
}
.ah-count-zero { background: #f1f5f9; color: #94a3b8; }

.ah-col-actions { text-align: right; white-space: nowrap; }
.ah-col-actions .btn { margin-left: 6px; }
.btn-danger { color: #dc2626; border-color: #fecaca; background: #fff; }
.btn-danger:hover { background: #fef2f2; }

.ah-state {
  padding: 40px;
  text-align: center;
  color: var(--mut);
  font-size: 15px;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: #0e1a3380;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
  backdrop-filter: blur(3px);
}
.modal {
  background: var(--card);
  border-radius: 18px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 60px #00000030;
  overflow: hidden;
}
.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--line);
}
.modal-head h2 { font-family: var(--font-head); font-size: 18px; margin: 0; }
.modal-close {
  background: none; border: none;
  font-size: 24px; line-height: 1;
  color: var(--mut); cursor: pointer; padding: 0 4px;
}
.modal-body {
  padding: 22px 24px 24px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 14px;
}
.modal-actions {
  display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;
}
.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 11px 14px;
  font-size: 15px;
  color: var(--ink);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 10px;
  outline: none;
  font-family: inherit;
}
.form-group textarea { resize: vertical; min-height: 60px; }
.form-group input:disabled { opacity: 0.7; cursor: not-allowed; }
.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--p);
  box-shadow: 0 0 0 3px #008cfd22;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.form-hint {
  font-size: 12px;
  color: var(--mut);
  margin: 4px 0 0;
}
`;

// ---------- Page ----------
export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await api.getHospitals();
      setHospitals(res.hospitals || []);
    } catch (err) {
      setError(err.data?.error || 'Could not load hospitals.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(h) {
    if (!confirm(`Delete ${h.name}? This will fail if any appointment is booked there.`)) return;
    setBusyId(h.id);
    try {
      await api.deleteHospital(h.id);
      await load();
    } catch (err) {
      alert(err.data?.error || 'Could not delete hospital.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="ah-page">
      <style>{CSS}</style>

      <header className="ah-header">
        <div>
          <h1>Hospitals</h1>
          <p className="ah-sub">{hospitals.length} record{hospitals.length === 1 ? '' : 's'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          + Add hospital
        </button>
      </header>

      {loading && <div className="ah-state">Loading…</div>}
      {error && <div className="ah-state">{error}</div>}
      {!loading && !error && hospitals.length === 0 && (
        <div className="ah-state">No hospitals yet.</div>
      )}

      {!loading && !error && hospitals.length > 0 && (
        <div className="ah-table-wrap">
          <table className="ah-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Coordinates</th>
                <th>Doctors</th>
                <th className="ah-col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h.id}>
                  <td>
                    <p className="ah-name">{h.name}</p>
                    {h.address && <p className="ah-address">{h.address}</p>}
                  </td>
                  <td>{h.city}</td>
                  <td className="ah-coords">
                    {h.latitude?.toFixed(3)}, {h.longitude?.toFixed(3)}
                  </td>
                  <td>
                    <span className={`ah-count${h.doctorCount ? '' : ' ah-count-zero'}`}>
                      {h.doctorCount ?? 0}
                    </span>
                  </td>
                  <td className="ah-col-actions">
                    <button className="btn btn-sm" onClick={() => setEditing(h)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={busyId === h.id}
                      onClick={() => handleDelete(h)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <NewHospitalModal
          onClose={() => setShowNew(false)}
          onCreated={async () => { setShowNew(false); await load(); }}
        />
      )}

      {editing && (
        <EditHospitalModal
          hospital={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load(); }}
        />
      )}
    </div>
  );
}

// ---------- New hospital modal ----------
function NewHospitalModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    latitude: '',
    longitude: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.city || form.latitude === '' || form.longitude === '') {
      setError('Name, city, latitude and longitude are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        city: form.city.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      await api.createHospital(payload);
      onCreated();
    } catch (err) {
      setError(err.data?.error || 'Could not create hospital.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>New hospital</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)}
              placeholder="American University of Beirut Medical Center" required />
          </div>
          <div className="form-group">
            <label>City</label>
            <input value={form.city} onChange={(e) => update('city', e.target.value)}
              placeholder="Beirut" required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={(e) => update('address', e.target.value)}
              placeholder="Hamra, Beirut" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)}
              placeholder="+961 1 350 000" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input type="number" step="any" value={form.latitude}
                onChange={(e) => update('latitude', e.target.value)} placeholder="33.9000" required />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input type="number" step="any" value={form.longitude}
                onChange={(e) => update('longitude', e.target.value)} placeholder="35.4820" required />
            </div>
          </div>
          <p className="form-hint">
            Copy coordinates from Google Maps — right-click the building and pick "What's here".
          </p>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Edit hospital modal ----------
function EditHospitalModal({ hospital, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: hospital.name ?? '',
    city: hospital.city ?? '',
    address: hospital.address ?? '',
    phone: hospital.phone ?? '',
    latitude: hospital.latitude ?? '',
    longitude: hospital.longitude ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        city: form.city.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
      };
      await api.updateHospital(hospital.id, payload);
      onSaved();
    } catch (err) {
      setError(err.data?.error || 'Could not update hospital.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>Edit hospital</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>City</label>
            <input value={form.city} onChange={(e) => update('city', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={(e) => update('address', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input type="number" step="any" value={form.latitude}
                onChange={(e) => update('latitude', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input type="number" step="any" value={form.longitude}
                onChange={(e) => update('longitude', e.target.value)} required />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}