import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import connectDB from './db';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

async function startServer() {
  try {
    await connectDB();
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  } catch (err) {
    console.error('Failed to start server', err);
  }
}

startServer();
