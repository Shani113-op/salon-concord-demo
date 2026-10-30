import { randomUUID } from 'node:crypto';
import { appointments } from '../data/appointments.js';

const services = new Set(['Haircut', 'Beard Trim', 'Facial']);
export function error(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export function listAppointments(req, res) {
  res.json({ appointments });
}

export function createAppointment(req, res) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return error(res, 400, 'VALIDATION_ERROR', 'Request body must be a JSON object.');
  }
  const { customerName, service, date, time } = body;
  if (typeof customerName !== 'string' || !customerName.trim()) {
    return error(res, 400, 'VALIDATION_ERROR', 'customerName must be a nonempty string.');
  }
  if (!services.has(service)) {
    return error(res, 400, 'VALIDATION_ERROR', 'service must be Haircut, Beard Trim, or Facial.');
  }
  if (!validDate(date)) {
    return error(res, 400, 'VALIDATION_ERROR', 'date must be a valid calendar date in YYYY-MM-DD format.');
  }
  if (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return error(res, 400, 'VALIDATION_ERROR', 'time must be in HH:mm format (00:00–23:59).');
  }
  if (appointments.some(a => a.status === 'booked' && a.date === date && a.time === time)) {
    return error(res, 409, 'SLOT_UNAVAILABLE', 'This date and time are already booked.');
  }
  const appointment = { id: randomUUID(), customerName: customerName.trim(), service, date, time, status: 'booked' };
  appointments.push(appointment);
  return res.status(201).json({ appointment });
}

export function cancelAppointment(req, res) {
  const appointment = appointments.find(a => a.id === req.params.id);
  if (!appointment) return error(res, 404, 'NOT_FOUND', 'Appointment not found.');
  appointment.status = 'cancelled';
  return res.json({ appointment });
}
