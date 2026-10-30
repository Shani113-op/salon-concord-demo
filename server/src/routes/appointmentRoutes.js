import { Router } from 'express';
import { listAppointments, createAppointment, cancelAppointment } from '../controllers/appointmentController.js';

const router = Router();
router.get('/', listAppointments);
router.post('/', createAppointment);
router.patch('/:id/cancel', cancelAppointment);
export default router;
