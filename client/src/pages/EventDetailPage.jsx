import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar, Clock, Users, Plus, Sliders, Presentation, Sparkles,
  Play, CheckCircle2, AlertTriangle, Edit3, Trash2, Mic, Volume2
} from 'lucide-react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import SessionModal from '../components/SessionModal';
import DelayModal from '../components/DelayModal';

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { joinEventRoom, socket } = useSocket();

  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [delayTargetSession, setDelayTargetSession] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getEvent(eventId);
      setEvent(data);
      setSessions(data.sessions || []);
      setSpeakers(data.speakers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    joinEventRoom(eventId);
  }, [eventId]);

  // Socket.IO Real-time listeners
  useEffect(() => {
    if (!socket) return;

    const handleScheduleRippled = (payload) => {
      if (payload.eventId === eventId) {
        setSessions(payload.sessions);
      }
    };

    const handleSessionStatusChanged = (payload) => {
      if (payload.eventId === eventId) {
        setSessions((prev) =>
          prev.map((s) => (s.id === payload.session.id ? payload.session : s))
        );
      }
    };

    const handleSessionCreated = (newSess) => {
      setSessions((prev) => [...prev, newSess].sort((a, b) => a.order - b.order));
    };

    const handleSessionUpdated = (updated) => {
      setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    };

    socket.on('schedule_rippled', handleScheduleRippled);
    socket.on('session_status_changed', handleSessionStatusChanged);
    socket.on('session_created', handleSessionCreated);
    socket.on('session_updated', handleSessionUpdated);

    return () => {
      socket.off('schedule_rippled', handleScheduleRippled);
      socket.off('session_status_changed', handleSessionStatusChanged);
      socket.off('session_created', handleSessionCreated);
      socket.off('session_updated', handleSessionUpdated);
    };
  }, [socket, eventId]);

  const handleStatusChange = async (sessionId, newStatus) => {
    try {
      await api.updateSessionStatus(sessionId, newStatus);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSession = async (sessionId, title) => {
    if (confirm(`Remove session "${title}" from the agenda?`)) {
      try {
        await api.deleteSession(sessionId);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading && !event) {
    return <div className="py-20 text-center text-slate-400">Loading agenda...</div>;
  }

  if (!event) {
    return <div className="py-20 text-center text-rose-400">Event not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Event Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Agenda Hub
              </span>
              <span className="text-xs text-slate-400">
                Anchor: <strong className="text-slate-200">{event.anchorName}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {event.title}
            </h1>
            {event.theme && (
              <p className="text-sm text-indigo-300/90 italic mt-1">{event.theme}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {event.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Starts at {event.startTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> {speakers.length} Speakers
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/events/${eventId}/control`}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-600/20"
            >
              <Sliders className="w-4 h-4" />
              Live Control Room
            </Link>

            <Link
              to={`/events/${eventId}/prompter`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/20"
            >
              <Presentation className="w-4 h-4" />
              Anchor Teleprompter
            </Link>

            <Link
              to={`/events/${eventId}/scripts`}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold rounded-xl text-xs sm:text-sm transition border border-slate-700"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Scripts
            </Link>
          </div>
        </div>
      </div>

      {/* Agenda Sessions Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Program Timeline</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic timings synchronize automatically when sessions run long or are delayed.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSession(null);
            setSessionModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Add Activity
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl p-8">
          <Clock className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-slate-400 text-sm">No sessions scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess, idx) => {
            const isLive = sess.status === 'live';
            const isCompleted = sess.status === 'completed';

            return (
              <div
                key={sess.id}
                className={`rounded-2xl border transition p-5 ${
                  isLive
                    ? 'bg-indigo-950/30 border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                    : isCompleted
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Timing & Order & Title */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Time Pill */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 min-w-[105px] shrink-0 text-center font-mono">
                      <span className="text-xs text-indigo-300 font-bold">
                        {sess.startTime} - {sess.endTime}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {sess.durationMinutes} mins
                      </span>
                      {sess.delayMinutes > 0 && (
                        <span className="text-[10px] text-amber-400 font-semibold mt-0.5">
                          +{sess.delayMinutes}m delay
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-500">#{sess.order}</span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                            isLive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                              : isCompleted
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}
                        >
                          {isLive ? '● ON STAGE' : isCompleted ? 'COMPLETED' : 'UPCOMING'}
                        </span>

                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {sess.type}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mt-1.5 leading-snug">
                        {sess.title}
                      </h3>

                      {/* Speaker Badge */}
                      {sess.speaker && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                          <img
                            src={sess.speaker.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Speaker'}
                            alt={sess.speaker.name}
                            className="w-5 h-5 rounded-full object-cover border border-slate-700"
                          />
                          <span className="font-semibold text-white">{sess.speaker.name}</span>
                          <span className="text-slate-400">
                            — {sess.speaker.designation} at {sess.speaker.organization}
                          </span>
                          {sess.speaker.pronunciation && (
                            <span className="text-[11px] text-amber-400 font-mono italic">
                              ({sess.speaker.pronunciation})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Anchor script preview if present */}
                      {sess.script && (
                        <p className="text-xs text-slate-400 italic mt-2 line-clamp-2 bg-slate-950/40 p-2 rounded border border-slate-800/80">
                          “{sess.script}”
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Ripple Delay button */}
                    <button
                      onClick={() => {
                        setDelayTargetSession(sess);
                        setDelayModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
                      title="Add delay to this session and shift all subsequent sessions automatically"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>+ Delay</span>
                    </button>

                    {/* Status Toggle Button */}
                    {!isLive && !isCompleted && (
                      <button
                        onClick={() => handleStatusChange(sess.id, 'live')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Go Live</span>
                      </button>
                    )}

                    {isLive && (
                      <button
                        onClick={() => handleStatusChange(sess.id, 'completed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-emerald-400 rounded-lg text-xs font-bold transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Finish</span>
                      </button>
                    )}

                    {/* Edit Session */}
                    <button
                      onClick={() => {
                        setEditingSession(sess);
                        setSessionModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                      title="Edit Session"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteSession(sess.id, sess.title)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Session Add/Edit Modal */}
      <SessionModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        eventId={eventId}
        session={editingSession}
        speakers={speakers}
        onSaved={loadData}
      />

      {/* Dynamic Schedule Delay Modal */}
      <DelayModal
        isOpen={delayModalOpen}
        onClose={() => setDelayModalOpen(false)}
        session={delayTargetSession}
        onDelayed={(updatedSessions) => {
          if (Array.isArray(updatedSessions)) {
            setSessions(updatedSessions);
          } else {
            loadData();
          }
        }}
      />
    </div>
  );
}
