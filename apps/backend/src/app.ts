
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import connectDB from './db';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes); // all API routes prefixed with /api

async function startServer() {
  try {
    await connectDB();
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
  } catch (err) {
    console.error('Failed to start server', err);
  }
}

startServer();
