// app.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import connectDB from './db';

const app = express();

// 🔒 ALWAYS-ON CORS (handles every request + all preflights)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'http://localhost:5173') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      (req.headers['access-control-request-headers'] as string) || 'Content-Type, Authorization'
    );
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204); // <- preflight terminates here
  next();
});

// (optional) request logger + health check, helps debug 404s
app.use((req, _res, next) => { console.log(`${req.method} ${req.path}`); next(); });
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your API
app.use('/api', routes);

async function startServer() {
  try {
    await connectDB();
    app.listen(5050, () => console.log('Server running on http://localhost:5050'));
  } catch (err) {
    console.error('Failed to start server', err);
  }
}
startServer();
