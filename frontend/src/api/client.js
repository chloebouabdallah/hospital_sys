const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // some endpoints may have no JSON body
  }

  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // ---------- Auth ----------
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/users/me'),

  // ---------- Public reads (Home page stats) ----------
  getSpecialties: () => request('/specialties'),
  getHospitals: () => request('/hospitals'),
  getDoctors: () => request('/doctors'),

  // ---------- Admin: overview ----------
  getAdminOverview: () => request('/admin/overview'),

  // ---------- Appointments ----------
  getAppointments: (params = '') => request(`/appointments${params}`),
  createAppointment: (payload) => request('/appointments', { method: 'POST', body: payload }),
  confirmAppointment: (id) => request(`/appointments/${id}/confirm`, { method: 'PATCH' }),
  completeAppointment: (id) => request(`/appointments/${id}/complete`, { method: 'PATCH' }),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH' }),

  // ---------- Available slots (for booking modal) ----------
  getAvailableSlots: (doctorId, date, hospitalId) =>
    request(`/doctors/${doctorId}/available-slots?date=${date}&hospitalId=${hospitalId}`),

  // ---------- Lookups (for New appointment modal) ----------
  getPatients: () => request('/users?role=patient'),

  getDoctorById: (id) => request(`/doctors/${id}`),
createDoctor: (payload) => request('/doctors', { method: 'POST', body: payload }),
updateDoctor: (id, payload) => request(`/doctors/${id}`, { method: 'PATCH', body: payload }),
deleteDoctor: (id) => request(`/doctors/${id}`, { method: 'DELETE' }),

 // ---------- Hospitals (admin CRUD; reads are public) ----------
getHospitalById: (id) => request(`/hospitals/${id}`),
createHospital: (payload) => request('/hospitals', { method: 'POST', body: payload }),
updateHospital: (id, payload) => request(`/hospitals/${id}`, { method: 'PUT', body: payload }),
deleteHospital: (id) => request(`/hospitals/${id}`, { method: 'DELETE' }),
};