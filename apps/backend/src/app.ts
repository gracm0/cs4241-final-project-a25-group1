import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import bucketRoutes from './routes/Item';
import uploadRoutes from './routes/Upload';
import connectDB from './db';

const app = express();

// Fix CORS: allow frontend origin and handle preflight requests
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);
app.use('/api/bucket-items', bucketRoutes);
app.use('/api/upload', uploadRoutes );

// Serve frontend build (apps/frontend/dist)
const clientDistPath = path.resolve(__dirname, '../../frontend/dist');
console.log('Serving static from:', clientDistPath);

app.use(express.static(clientDistPath));

// Catch-all: send index.html for non-API routes
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

async function startServer() {
  try {
    await connectDB();
    const port = process.env.PORT ? Number(process.env.PORT) : 5050; // Use 5050 for dev
    app.listen(port, () =>
      console.log(`Server running on http://localhost:${port}`)
    );
  } catch (err) {
    console.error('Failed to start server', err);
  }
}

startServer();