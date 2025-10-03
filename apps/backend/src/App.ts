import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import connectDB from './db';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Correct frontend build path (apps/frontend/dist)
const clientDistPath = path.resolve(__dirname, '../../frontend/dist');
console.log('Serving static from:', clientDistPath);

app.use(express.static(clientDistPath));

// Express 5 catch-all: send index.html for non-API routes
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

async function startServer() {
  try {
    await connectDB();
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    app.listen(port, () =>
        console.log(`Server running on http://localhost:${port}`)
    );
  } catch (err) {
    console.error('Failed to start server', err);
  }
}

startServer();
