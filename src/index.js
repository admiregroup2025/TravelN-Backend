// // index.js

// // index.mjs or index.js when using type: module
// import 'dotenv/config'; // loads automatically
// import express from 'express';
// import cors from 'cors';
// import  connectToDatabase  from './db/db.js';
// import authRoutes from './routes/authRoutes.js';
// import itineraryRoutes from './routes/itineraryRoutes.js';
// import Razorpay from "razorpay";


// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware

// app.use(express.json({ limit: '1mb' }));
// app.use(cors({ origin: '*'}));

// // Routes
// app.get("/", (req, res) => {
//   res.send("🚀 Backend is running!");
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/itineraries', itineraryRoutes);

// // Start server after DB
// connectToDatabase()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`✅ Server is running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error('Failed to start server due to DB error', err.message);
//     process.exit(1);
//   });




// // initialize razorpay instance
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
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     console.log("order",order);

//     res.json(order);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // payment success callback (optional)
// app.post("/api/payment/callback", (req, res) => {
//   console.log("Payment response from Razorpay:", req.body);
//   // here you can verify signature and update order status in DB
//   res.json({ status: "success", order_id: req.body.razorpay_order_id });
// });


import app from "./server.js";
import connectToDatabase from "./db/db.js"

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

startServer();