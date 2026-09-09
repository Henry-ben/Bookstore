import axios from 'axios';

export async function initiatePayment(req, res) {
  const { email, amount } = req.body;


  try {
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount: amount * 100, // Paystack expects amount in kobo
      callback_url: 'http://localhost:5173/home/your-order' 
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
}

export async function verifyPayment(req, res) {
  try{
    const { reference } = req.params;

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
        }
    });

   res.json(response.data);
} catch (error) {
  console.error('Error verifying payment:', error);
  res.status(500).json({ error: 'Failed to verify payment' });
 }
}