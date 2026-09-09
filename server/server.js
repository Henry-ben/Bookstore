import express from 'express';
import './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/paystack.js';
import authRouter from './routes/auth.js';
import bookRouter from './routes/books.js';
import orderRouter from './routes/order.js';
import settingRouter from './routes/settingRouter.js';
import announceRouter from './routes/announce.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/paystack', router);
app.use('/api/auth', authRouter);
app.use('/api/books', bookRouter);
app.use('/api/orders', orderRouter);
app.use("/api/settings", settingRouter);
app.use("/api/announcements", announceRouter);

app.get('/', (req, res) => {
  res.send('Bookstore API is running');
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});