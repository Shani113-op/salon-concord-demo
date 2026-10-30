import { useEffect, useRef, useState } from 'react';
import AppointmentForm from './components/AppointmentForm.jsx';
import AppointmentList from './components/AppointmentList.jsx';
import { listAppointments, createAppointment, cancelAppointment } from './services/api.js';

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    listAppointments().then(data => { if (active) { setAppointments(data); setLoaded(true); } })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function refresh() {
    if (busy.current) return;
    busy.current = true;
    setLoading(true); setError(''); setSuccess('');
    try { setAppointments(await listAppointments()); setLoaded(true); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); busy.current = false; }
  }

  async function mutate(action, key, message) {
    if (busy.current) return false;
    busy.current = true;
    setPending(key); setError(''); setSuccess('');
    try {
      await action();
      setSuccess(message);
      setLoading(true);
      try { setAppointments(await listAppointments()); setLoaded(true); }
      catch (err) { setError(`Your change was saved, but the schedule could not refresh. ${err.message}`); }
      return true;
    } catch (err) { setError(err.message); return false; }
    finally { setPending(null); setLoading(false); busy.current = false; }
  }
  const disabled = loading || pending !== null;
  return (
    <div className="shell">
      <header className="brand-bar"><a href="./" className="brand"><span className="brand-mark" aria-hidden="true">S.</span> Studio Salon</a><span className="demo-label">APPOINTMENT DEMO</span></header>
      <main>
        <div className="hero"><p className="eyebrow">A MOMENT TO RESET</p><h1>Good hair.<br /><em>A little more you.</em></h1><p>Plan your next visit and keep your salon schedule in one calm place.</p></div>
        <aside className="demo-notice"><strong>One stylist, one slot at a time.</strong> This is a single-stylist demo. Appointments are stored in memory and reset when the backend restarts.</aside>
        <div className="feedback" aria-atomic="true">
          {success && <p className="success" role="status">{success}</p>}
          {error && <p className="error" role="alert">{error}</p>}
        </div>
        <div className="dashboard">
          <AppointmentForm disabled={disabled} booking={pending === 'booking'} onBook={form => mutate(() => createAppointment(form), 'booking', 'Appointment booked. We look forward to seeing you.')} />
          <AppointmentList appointments={appointments} loading={loading} loaded={loaded} disabled={disabled} pending={pending} onRefresh={refresh} onCancel={id => mutate(() => cancelAppointment(id), id, 'Appointment cancelled. The time slot is available again.')} />
        </div>
      </main>
      <footer>Studio Salon <span aria-hidden="true">·</span> A little care, beautifully scheduled.</footer>
    </div>
  );
}
