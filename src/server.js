import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
import agentRoutes from './routes/agentRoutes.js'; // updated
import enquiryRoutes from './routes/enquiryRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import corsOptions from './config/corsoption.js';
const app = express();

app.use(cors(corsOptions))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/agents', agentRoutes); 
app.use('/api/enquiries', enquiryRoutes);

// Global error handler
app.use(errorHandler);

export default app;
