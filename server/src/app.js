import express from 'express';
import appointmentRoutes from './routes/appointmentRoutes.js';
import { error } from './controllers/appointmentController.js';

const app = express();
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/appointments', appointmentRoutes);
app.use((req, res) => error(res, 404, 'NOT_FOUND', 'Route not found.'));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return error(res, 400, 'INVALID_JSON', 'Request body must contain valid JSON.');
  if (err.status >= 400 && err.status < 500) return error(res, err.status, 'REQUEST_ERROR', 'Request body could not be processed.');
  console.error(err);
  return error(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
});
export default app;
