import express from 'express';
import {initiatePayment, verifyPayment} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/initiate', initiatePayment);
router.get('/verify/:reference', verifyPayment);

export default router;