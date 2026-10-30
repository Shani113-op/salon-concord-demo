async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new Error('Unable to reach the salon API. Check that the backend is running and try again.');
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The salon API returned an unreadable response. Check that the backend is running.');
  }
  if (!response.ok) throw new Error(data.error?.message || 'The request could not be completed.');
  return data;
}

export async function listAppointments() {
  const data = await request('/appointments');
  if (!Array.isArray(data.appointments)) throw new Error('The salon API returned an unexpected appointment list.');
  return data.appointments;
}
export async function createAppointment(appointment) {
  const data = await request('/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment),
  });
  return data.appointment;
}
export async function cancelAppointment(id) {
  const data = await request(`/appointments/${encodeURIComponent(id)}/cancel`, { method: 'PATCH' });
  return data.appointment;
}
