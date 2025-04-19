import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import router from './routes';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', router);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 