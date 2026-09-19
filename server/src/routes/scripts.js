import express from 'express';
import { generateScript } from '../services/aiService.js';
import db from '../db.js';

const router = express.Router();

// Generate script using AI or contextual generator
router.post('/generate', async (req, res) => {
  try {
    const { type, ...params } = req.body;
    if (!type) {
      return res.status(400).json({ success: false, error: 'Script type is required (welcome, speaker_intro, transition, closing, announcement)' });
    }

    const result = await generateScript(type, params);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save generated script directly to a session
router.post('/save-to-session', (req, res) => {
  try {
    const { sessionId, script, anchorNotes } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    const updated = db.updateSession(sessionId, {
      script: script || '',
      anchorNotes: anchorNotes || ''
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const io = req.app.get('io');
    if (io && updated.eventId) {
      io.to(`event:${updated.eventId}`).emit('script_updated', {
        sessionId,
        script: updated.script,
        anchorNotes: updated.anchorNotes
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
