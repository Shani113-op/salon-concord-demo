import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
after(() => new Promise(resolve => server.close(resolve)));
const base = `http://127.0.0.1:${server.address().port}`;
async function request(path, method = 'GET', body) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}
const valid = { customerName: '  Alex  ', service: 'Haircut', date: '2028-02-29', time: '10:30' };

test('health, booking lifecycle, conflicts, validation and JSON errors over HTTP', async t => {
  await t.test('health and empty list', async () => {
    assert.deepEqual(await request('/api/health'), { status: 200, body: { status: 'ok' } });
    assert.deepEqual(await request('/api/appointments'), { status: 200, body: { appointments: [] } });
  });
  let id;
  await t.test('create trims name, generates ID and lists exact appointment shape', async () => {
    const result = await request('/api/appointments', 'POST', valid);
    assert.equal(result.status, 201);
    id = result.body.appointment.id;
    assert.match(id, /^[0-9a-f-]{36}$/);
    assert.deepEqual(result.body.appointment, { ...valid, customerName: 'Alex', id, status: 'booked' });
    assert.deepEqual((await request('/api/appointments')).body, { appointments: [result.body.appointment] });
  });
  await t.test('single stylist rejects duplicate slot across services', async () => {
    const result = await request('/api/appointments', 'POST', { ...valid, service: 'Facial' });
    assert.equal(result.status, 409);
    assert.equal(result.body.error.code, 'SLOT_UNAVAILABLE');
  });
  await t.test('invalid fields, missing inputs, date boundaries and malformed JSON', async () => {
    for (const body of [null, [], {}, ...['customerName','service','date','time'].map(key => { const b = { ...valid }; delete b[key]; return b; }), ...[
      { customerName: '  ' }, { customerName: 123 }, { service: 'Massage' },
      { date: '2027-02-29' }, { date: '1900-02-29' }, { date: '2028-04-31' },
      { date: '0000-01-01' }, { date: '2028-13-01' }, { date: '2028-01-00' }, { date: '2028-2-01' },
      { time: '24:00' }, { time: '12:60' }, { time: '9:00' }
    ].map(change => ({ ...valid, ...change }))]) {
      const result = await request('/api/appointments', 'POST', body);
      assert.equal(result.status, 400, JSON.stringify(body));
      assert.equal(typeof result.body.error.message, 'string');
    }
    const response = await fetch(base + '/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' } });
  });
  await t.test('cancellation is idempotent and releases the slot', async () => {
    const cancelled = await request(`/api/appointments/${id}/cancel`, 'PATCH');
    assert.equal(cancelled.status, 200);
    assert.equal(cancelled.body.appointment.status, 'cancelled');
    assert.deepEqual(await request(`/api/appointments/${id}/cancel`, 'PATCH'), cancelled);
    const rebooked = await request('/api/appointments', 'POST', { ...valid, service: 'Beard Trim' });
    assert.equal(rebooked.status, 201);
    assert.notEqual(rebooked.body.appointment.id, id);
    assert.equal((await request('/api/appointments')).body.appointments.length, 2);
  });
  await t.test('unknown appointment and route use JSON 404', async () => {
    assert.deepEqual(await request('/api/appointments/unknown/cancel', 'PATCH'), { status: 404, body: { error: { code: 'NOT_FOUND', message: 'Appointment not found.' } } });
    assert.equal((await request('/unknown')).status, 404);
  });
});
