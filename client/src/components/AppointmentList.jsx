export default function AppointmentList({ appointments, loading, loaded, disabled, pending, onCancel, onRefresh }) {
  return (
    <section className="panel list-panel" aria-labelledby="list-title" aria-busy={loading}>
      <div className="list-heading">
        <div><p className="eyebrow">YOUR SALON SCHEDULE</p><h2 id="list-title">Appointments</h2></div>
        <button className="secondary" onClick={onRefresh} disabled={disabled}>Refresh</button>
      </div>
      <p className="muted">{loaded ? `${appointments.filter(a => a.status === 'booked').length} booked · ${appointments.length} total` : 'Your appointments will appear here.'}</p>
      {loading && <p role="status" className="list-message">Loading appointments…</p>}
      {!loading && !loaded && <p className="list-message">The schedule is unavailable. Use Refresh to try again.</p>}
      {!loading && loaded && appointments.length === 0 && <div className="empty-state"><span aria-hidden="true">✦</span><h3>A little space in the schedule</h3><p>No appointments yet. Book your first visit using the form.</p></div>}
      {appointments.length > 0 && <ul className="appointments">
        {appointments.map(appointment => <li className="appointment" key={appointment.id}>
          <div className="appointment-top"><h3>{appointment.customerName}</h3><span className={`badge ${appointment.status}`}>{appointment.status}</span></div>
          <p className="service-name">{appointment.service}</p>
          <div className="appointment-bottom"><p><time dateTime={`${appointment.date}T${appointment.time}`}>{appointment.date} <span aria-hidden="true">·</span> {appointment.time}</time></p>
            {appointment.status === 'booked' && <button className="cancel" disabled={disabled} aria-label={`Cancel appointment for ${appointment.customerName} on ${appointment.date} at ${appointment.time}`} onClick={() => onCancel(appointment.id)}>{pending === appointment.id ? 'Cancelling…' : 'Cancel'}</button>}
          </div>
        </li>)}
      </ul>}
    </section>
  );
}
