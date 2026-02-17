import express from 'express';
import { createReservation, listReservations } from '../controllers/reservationController.js';

const router = express.Router();

router.get('/', listReservations);
router.post('/', createReservation);

export default router;
