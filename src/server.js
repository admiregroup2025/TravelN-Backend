import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
import agentRoutes from './routes/agentRoutes.js'; // updated
import enquiryRoutes from './routes/enquiryRoutes.js';
import adminLoginCredentialRoutes from './routes/adminLoginCredentialRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import corsOptions from './config/corsoption.js';
import bannerRoutes from "./routes/bannerRoutes.js";
const app = express();

app.use(cors());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend is running!");
});


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/agents', agentRoutes); 
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/adminslogincredentials', adminLoginCredentialRoutes);
app.use("/api/banners", bannerRoutes);

// Global error handler
app.use(errorHandler);

export default app;
