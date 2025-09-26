import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
// import Razorpay from "razorpay";
import { errorHandler } from './utils/errorHandler.js';

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "*",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use(errorHandler);

export default app;


// initialize razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // console.log(process.env.RAZORPAY_KEY_ID);
// // console.log(process.env.RAZORPAY_KEY_SECRET);

// // create payment order
// app.post("/api/payment/process", async (req, res) => {
//   try {
//     const { amount, currency = "INR" } = req.body;
//     console.log("amt",amount);

//     const options = {
//       amount: amount, // in paise
//       currency,
//       receipt: receipt_${Date.now()},
//     };

//     const order = await razorpay.orders.create(options);
//     console.log("order",order);

//     res.json(order);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// payment success callback (optional)
// app.post("/api/payment/callback", (req, res) => {
//   console.log("Payment response from Razorpay:", req.body);
//   res.json({ status: "success", order_id: req.body.razorpay_order_id });
// });