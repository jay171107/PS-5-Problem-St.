import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all events
router.get('/', (req, res) => {
  try {
    const events = db.getEvents();
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single event by id (with populated sessions and speakers)
router.get('/:id', (req, res) => {
  try {
    const event = db.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    const sessions = db.getSessions(event.id);
    const speakers = db.getSpeakers(event.id);
    const announcements = db.getAnnouncements(event.id);

    // Attach speaker object to sessions
    const enrichedSessions = sessions.map(sess => {
      const speaker = sess.speakerId ? db.getSpeakerById(sess.speakerId) : null;
      return { ...sess, speaker };
    });

    res.json({
      success: true,
      data: {
        ...event,
        sessions: enrichedSessions,
        speakers,
        announcements
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE new event
router.post('/', (req, res) => {
  try {
    const { title, theme, date, startTime, venue, anchorName, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    const newEvent = db.createEvent({
      title,
      theme: theme || '',
      date: date || new Date().toISOString().split('T')[0],
      startTime: startTime || '09:00',
      venue: venue || 'Main Stage',
      anchorName: anchorName || 'Emcee',
      description: description || ''
    });
    res.status(201).json({ success: true, data: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE event
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateEvent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Broadcast update via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.to(`event:${req.params.id}`).emit('event_updated', updated);
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE event
router.delete('/:id', (req, res) => {
  try {
    const ok = db.deleteEvent(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
