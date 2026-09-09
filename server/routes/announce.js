import express from 'express';
import { getAllAnnouncements } from '../controllers/announceController.js';

const announceRouter = express.Router();

announceRouter.get('/', getAllAnnouncements);

export default announceRouter;