import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET announcements for event
router.get('/', (req, res) => {
  try {
    const { eventId } = req.query;
    const list = db.getAnnouncements(eventId);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// BROADCAST new announcement
router.post('/broadcast', (req, res) => {
  try {
    const { eventId, title, message, priority, spokenScript } = req.body;
    if (!eventId || !message) {
      return res.status(400).json({ success: false, error: 'eventId and message are required' });
    }

    const newAnn = db.createAnnouncement({
      eventId,
      title: title || 'Stage Announcement',
      message,
      priority: priority || 'urgent',
      spokenScript: spokenScript || message
    });

    const io = req.app.get('io');
    if (io) {
      console.log(`📢 Broadcasting announcement to room event:${eventId}:`, newAnn.title);
      io.to(`event:${eventId}`).emit('announcement_broadcast', newAnn);
    }

    res.status(201).json({ success: true, data: newAnn });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ACKNOWLEDGE announcement
router.post('/:id/ack', (req, res) => {
  try {
    const ann = db.acknowledgeAnnouncement(req.params.id);
    if (!ann) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    const io = req.app.get('io');
    if (io && ann.eventId) {
      io.to(`event:${ann.eventId}`).emit('announcement_acknowledged', { id: ann.id });
    }

    res.json({ success: true, data: ann });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
