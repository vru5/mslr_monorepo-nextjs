import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import referendumRoutes from './routes/referendum.js';
import voteRoutes from './routes/vote.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL // This will be your Vercel URL
].filter(Boolean) as string[];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Blocked: Origin ${origin} not in allowed list`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/mslr/auth', authRoutes)
app.use('/mslr/admin', referendumRoutes);
app.use('/mslr/vote', voteRoutes);

//MongoDB connection
if(!MONGO_URI) {
    console.log("Mongo_uri not defined");
    process.exit(1);
}

mongoose.connect(MONGO_URI).then(() => console.log("Connected to MOngoDB")).catch((err) => console.log("MongoDB connection error: ", err));

// Basic Route for Testing
app.get('/', (req: Request, res: Response) => {
  res.send('MSLR Backend is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});