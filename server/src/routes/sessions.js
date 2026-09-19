import express from 'express';
import db from '../db.js';

const router = express.Router();

// Helper to enrich session with speaker data
function enrichSession(session) {
  if (!session) return null;
  const speaker = session.speakerId ? db.getSpeakerById(session.speakerId) : null;
  return { ...session, speaker };
}

// GET sessions for an event
router.get('/', (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId) {
      return res.status(400).json({ success: false, error: 'eventId is required' });
    }
    const sessions = db.getSessions(eventId).map(enrichSession);
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single session
router.get('/:id', (req, res) => {
  try {
    const session = db.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, data: enrichSession(session) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE session
router.post('/', (req, res) => {
  try {
    const { eventId, title, type, speakerId, startTime, endTime, durationMinutes, script, anchorNotes } = req.body;
    if (!eventId || !title) {
      return res.status(400).json({ success: false, error: 'eventId and title are required' });
    }

    const newSession = db.createSession({
      eventId,
      title,
      type: type || 'keynote',
      speakerId: speakerId || null,
      startTime: startTime || '10:00',
      endTime: endTime || '10:30',
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 30,
      script: script || '',
      anchorNotes: anchorNotes || ''
    });

    const enriched = enrichSession(newSession);
    const io = req.app.get('io');
    if (io) {
      io.to(`event:${eventId}`).emit('session_created', enriched);
    }

    res.status(201).json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE session
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateSession(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const enriched = enrichSession(updated);
    const io = req.app.get('io');
    if (io) {
      io.to(`event:${updated.eventId}`).emit('session_updated', enriched);
    }

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE session status (Live, Completed, Upcoming)
router.post('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const session = db.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const updates = { status };
    if (status === 'live') {
      updates.actualStartTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Update event currentSessionId
      db.updateEvent(session.eventId, { currentSessionId: session.id, status: 'live' });
    } else if (status === 'completed') {
      updates.actualEndTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const updated = db.updateSession(req.params.id, updates);
    const enriched = enrichSession(updated);

    const io = req.app.get('io');
    if (io) {
      io.to(`event:${session.eventId}`).emit('session_status_changed', {
        session: enriched,
        eventId: session.eventId,
        currentSessionId: status === 'live' ? session.id : null
      });
    }

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DYNAMIC SCHEDULE: Add delay and ripple all upcoming sessions!
router.post('/:id/delay', (req, res) => {
  try {
    const { addedMinutes, reason } = req.body;
    const minutes = parseInt(addedMinutes, 10);
    if (!minutes || isNaN(minutes)) {
      return res.status(400).json({ success: false, error: 'Valid addedMinutes is required' });
    }

    const session = db.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Ripple the delay in the database
    const allSessions = db.rippleDelay(session.eventId, session.id, minutes);
    const enrichedSessions = allSessions.map(enrichSession);

    // Also auto-generate an announcement about this schedule change
    const announcement = db.createAnnouncement({
      eventId: session.eventId,
      title: `Schedule Adjusted (+${minutes}m)`,
      message: reason || `The schedule has been adjusted by ${minutes} minutes starting from "${session.title}". Upcoming sessions have shifted accordingly.`,
      priority: 'urgent',
      spokenScript: `Ladies and gentlemen, a brief schedule update: our current segment will extend by ${minutes} minutes. All upcoming timings have been smoothly updated.`
    });

    // Broadcast through Socket.IO to instantly refresh teleprompter & control room
    const io = req.app.get('io');
    if (io) {
      io.to(`event:${session.eventId}`).emit('schedule_rippled', {
        eventId: session.eventId,
        fromSessionId: session.id,
        addedMinutes: minutes,
        reason,
        sessions: enrichedSessions,
        announcement
      });
    }

    res.json({
      success: true,
      data: enrichedSessions,
      announcement,
      message: `Successfully shifted schedule by ${minutes} minutes`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE session
router.delete('/:id', (req, res) => {
  try {
    const session = db.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const eventId = session.eventId;
    db.deleteSession(req.params.id);

    const remaining = db.getSessions(eventId).map(enrichSession);
    const io = req.app.get('io');
    if (io) {
      io.to(`event:${eventId}`).emit('session_deleted', { id: req.params.id, sessions: remaining });
    }

    res.json({ success: true, message: 'Session deleted successfully', data: remaining });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
