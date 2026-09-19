import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all speakers (optionally filtered by ?eventId=...)
router.get('/', (req, res) => {
  try {
    const { eventId } = req.query;
    const speakers = db.getSpeakers(eventId);
    res.json({ success: true, data: speakers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single speaker
router.get('/:id', (req, res) => {
  try {
    const speaker = db.getSpeakerById(req.params.id);
    if (!speaker) {
      return res.status(404).json({ success: false, error: 'Speaker not found' });
    }
    res.json({ success: true, data: speaker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE speaker
router.post('/', (req, res) => {
  try {
    const { eventId, name, designation, organization, topic, bio, pronunciation, talkingPoints, avatar, social } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Speaker name is required' });
    }
    const newSpeaker = db.createSpeaker({
      eventId: eventId || null,
      name,
      designation: designation || '',
      organization: organization || '',
      topic: topic || '',
      bio: bio || '',
      pronunciation: pronunciation || '',
      talkingPoints: Array.isArray(talkingPoints) ? talkingPoints : (talkingPoints ? [talkingPoints] : []),
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      social: social || ''
    });

    const io = req.app.get('io');
    if (io && eventId) {
      io.to(`event:${eventId}`).emit('speaker_added', newSpeaker);
    }

    res.status(201).json({ success: true, data: newSpeaker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE speaker
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateSpeaker(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Speaker not found' });
    }

    const io = req.app.get('io');
    if (io && updated.eventId) {
      io.to(`event:${updated.eventId}`).emit('speaker_updated', updated);
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE speaker
router.delete('/:id', (req, res) => {
  try {
    const speaker = db.getSpeakerById(req.params.id);
    const ok = db.deleteSpeaker(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Speaker not found' });
    }

    const io = req.app.get('io');
    if (io && speaker?.eventId) {
      io.to(`event:${speaker.eventId}`).emit('speaker_deleted', { id: req.params.id });
    }

    res.json({ success: true, message: 'Speaker deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
