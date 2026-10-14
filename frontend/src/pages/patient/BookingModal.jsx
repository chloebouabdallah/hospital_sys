import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const CSS = `
.bm-backdrop {
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
.bm-modal {
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
.bm-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--line);
}
.bm-head h2 {
  font-family: var(--font-head);
  font-size: 18px;
  margin: 0;
}
.bm-close {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: var(--mut);
  cursor: pointer;
  padding: 0 4px;
}
.bm-body {
  padding: 22px 24px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.bm-doctor {
  padding: 12px 14px;
  background: var(--soft);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.bm-doctor-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--grad);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-weight: 700;
  flex-shrink: 0;
}
.bm-doctor-info p { margin: 0; }
.bm-doctor-name { font-weight: 600; font-size: 14px; color: var(--ink); }
.bm-doctor-spec { font-size: 12px; color: var(--mut); margin-top: 2px !important; }

.bm-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 6px;
  display: block;
}
.bm-select,
.bm-input {
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
.bm-select:focus, .bm-input:focus {
  border-color: var(--p);
  box-shadow: 0 0 0 3px #008cfd22;
}
.bm-hint { font-size: 13px; color: var(--mut); margin: 4px 0 0; }

.bm-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
  margin-top: 8px;
}
.bm-slot {
  padding: 10px 8px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  font-family: inherit;
}
.bm-slot:hover { border-color: var(--v); }
.bm-slot.is-selected {
  background: var(--grad);
  color: #fff;
  border-color: transparent;
}

.bm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.bm-error { color: #dc2626; font-size: 14px; margin: 0; }
`;

export default function BookingModal({ doctor, onClose, onBooked }) {
  const [date, setDate] = useState('');
  const [hospitalId, setHospitalId] = useState(
    doctor.hospitals?.[0]?.hospital?.id ?? ''
  );
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load available slots when date + hospital change
  useEffect(() => {
    setSlots([]);
    setSelectedSlot('');
    if (!date || !hospitalId) return;
    setLoadingSlots(true);
    api
      .getAvailableSlots(doctor.id, date, hospitalId)
      .then((r) => setSlots(r.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [doctor.id, date, hospitalId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!selectedSlot) {
      setError('Please pick a time slot.');
      return;
    }
    setSubmitting(true);
    try {
      await api.createAppointment({
        doctorId: doctor.id,
        hospitalId: Number(hospitalId),
        dateTime: selectedSlot,
      });
      onBooked();
    } catch (err) {
      setError(err.data?.error || 'Could not book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const hospitals = doctor.hospitals || [];

  return (
    <div className="bm-backdrop" onClick={onClose}>
      <style>{CSS}</style>
      <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
        <header className="bm-head">
          <h2>Book an appointment</h2>
          <button className="bm-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <form onSubmit={handleSubmit} className="bm-body">
          <div className="bm-doctor">
            <div className="bm-doctor-avatar">
              {(doctor.user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="bm-doctor-info">
              <p className="bm-doctor-name">{doctor.user?.name}</p>
              <p className="bm-doctor-spec">{doctor.specialty?.name}</p>
            </div>
          </div>

          <div>
            <label className="bm-label">Hospital</label>
            <select
              className="bm-select"
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              required
            >
              <option value="">Select a hospital…</option>
              {hospitals.map((h) => (
                <option key={h.hospital?.id} value={h.hospital?.id}>
                  {h.hospital?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="bm-label">Date</label>
            <input
              type="date"
              className="bm-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="bm-label">45-minute slots</label>
            {loadingSlots && <p className="bm-hint">Loading slots…</p>}
            {!loadingSlots && slots.length === 0 && date && (
              <p className="bm-hint">No free slots that day. Try another date.</p>
            )}
            {!loadingSlots && !date && (
              <p className="bm-hint">Pick a date to see free slots.</p>
            )}
            {!loadingSlots && slots.length > 0 && (
              <div className="bm-slots">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`bm-slot${selectedSlot === s ? ' is-selected' : ''}`}
                    onClick={() => setSelectedSlot(s)}
                  >
                    {new Date(s).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="bm-error">{error}</p>}

          <div className="bm-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Booking…' : 'Book appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}