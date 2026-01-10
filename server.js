import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './backend/routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Kai Chatbot API is running (Local DB Mode)...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
