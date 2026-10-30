import { useState } from 'react';

const initial = { customerName: '', service: 'Haircut', date: '', time: '' };
export default function AppointmentForm({ onBook, disabled, booking }) {
  const [form, setForm] = useState(initial);
  function change(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }
  async function submit(event) {
    event.preventDefault();
    if (await onBook(form)) setForm({ ...initial });
  }
  return (
    <section className="panel booking-panel" aria-labelledby="booking-title">
      <p className="eyebrow">MAKE TIME FOR YOU</p>
      <h2 id="booking-title">Book an appointment</h2>
      <p className="muted">A fresh look starts with a little time set aside.</p>
      <form onSubmit={submit}>
        <fieldset disabled={disabled}>
          <label htmlFor="customerName">Customer name</label>
          <input id="customerName" name="customerName" autoComplete="name" placeholder="Your full name" required value={form.customerName} onChange={change} />
          <label htmlFor="service">Service</label>
          <select id="service" name="service" value={form.service} onChange={change}>
            <option>Haircut</option><option>Beard Trim</option><option>Facial</option>
          </select>
          <div className="form-row">
            <div><label htmlFor="date">Date</label><input id="date" name="date" type="date" required max="9999-12-31" value={form.date} onChange={change} /></div>
            <div><label htmlFor="time">Time</label><input id="time" name="time" type="time" required value={form.time} onChange={change} /></div>
          </div>
          <p className="field-note">All fields required. Times are local to the salon.</p>
          <button className="primary" type="submit">{booking ? 'Booking…' : 'Book appointment'}</button>
        </fieldset>
      </form>
    </section>
  );
}
