import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';

import eventsRouter from './routes/events.js';
import speakersRouter from './routes/speakers.js';
import sessionsRouter from './routes/sessions.js';
import scriptsRouter from './routes/scripts.js';
import announcementsRouter from './routes/announcements.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO Setup with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Store io instance in app for route access
app.set('io', io);

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/speakers', speakersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/scripts', scriptsRouter);
app.use('/api/announcements', announcementsRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'EventFlow AI Backend',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build in production (single-service deployment)
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Socket.IO Real-time Logic
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

  // Join event-specific room
  socket.on('join_event', (eventId) => {
    if (!eventId) return;
    const room = `event:${eventId}`;
    socket.join(room);
    console.log(`📡 Socket ${socket.id} joined room ${room}`);
    socket.emit('joined_room', { room, socketId: socket.id });
  });

  // Leave event room
  socket.on('leave_event', (eventId) => {
    if (!eventId) return;
    const room = `event:${eventId}`;
    socket.leave(room);
    console.log(`🚪 Socket ${socket.id} left room ${room}`);
  });

  // Teleprompter scroll sync (if organizer wants to control prompter remotely!)
  socket.on('prompter_scroll', (data) => {
    if (!data?.eventId) return;
    socket.to(`event:${data.eventId}`).emit('prompter_scroll_sync', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start Server
async function start() {
  await initDatabase();
  server.listen(PORT, () => {
    console.log(`
🚀 EventFlow AI Server is running!
📡 Port: ${PORT}
🌐 API Endpoint: http://localhost:${PORT}/api/health
⚡ Real-time Socket.IO: Ready
    `);
  });
}

start();
