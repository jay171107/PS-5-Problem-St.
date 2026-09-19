import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sliders, Play, CheckCircle2, Clock, AlertTriangle, Megaphone,
  Sparkles, Presentation, ArrowRight, RefreshCw, Volume2, User
} from 'lucide-react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import AnnouncementModal from '../components/AnnouncementModal';
import DelayModal from '../components/DelayModal';

export default function OrganizerControlPage() {
  const { eventId } = useParams();
  const { joinEventRoom, socket, isConnected } = useSocket();

  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [delayTargetSession, setDelayTargetSession] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getEvent(eventId);
      setEvent(data);
      setSessions(data.sessions || []);
      setAnnouncements(data.announcements || []);
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

  // Socket.IO sync
  useEffect(() => {
    if (!socket) return;

    const handleScheduleRippled = (payload) => {
      if (payload.eventId === eventId) {
        setSessions(payload.sessions);
        if (payload.announcement) {
          setAnnouncements((prev) => [payload.announcement, ...prev]);
        }
      }
    };

    const handleSessionStatus = (payload) => {
      if (payload.eventId === eventId) {
        setSessions((prev) =>
          prev.map((s) => (s.id === payload.session.id ? payload.session : s))
        );
      }
    };

    const handleAnnouncement = (ann) => {
      if (ann.eventId === eventId) {
        setAnnouncements((prev) => [ann, ...prev]);
      }
    };

    socket.on('schedule_rippled', handleScheduleRippled);
    socket.on('session_status_changed', handleSessionStatus);
    socket.on('announcement_broadcast', handleAnnouncement);

    return () => {
      socket.off('schedule_rippled', handleScheduleRippled);
      socket.off('session_status_changed', handleSessionStatus);
      socket.off('announcement_broadcast', handleAnnouncement);
    };
  }, [socket, eventId]);

  // Find currently live session, and next upcoming session
  const currentLiveSession = sessions.find((s) => s.status === 'live') || null;
  const upcomingSessions = sessions.filter((s) => s.status === 'upcoming');
  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  const handleStartSession = async (session) => {
    try {
      // If there's an existing live session, complete it first
      if (currentLiveSession) {
        await api.updateSessionStatus(currentLiveSession.id, 'completed');
      }
      await api.updateSessionStatus(session.id, 'live');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteCurrent = async () => {
    if (!currentLiveSession) return;
    try {
      await api.updateSessionStatus(currentLiveSession.id, 'completed');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickRipple = async (mins) => {
    const target = currentLiveSession || nextSession || sessions[0];
    if (!target) return;
    try {
      await api.delaySession(target.id, mins, `Organizer added +${mins}m quick adjustment.`);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && !event) {
    return <div className="py-20 text-center text-slate-400">Loading control center...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Control Room Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Live Stage Control Cockpit</h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                MASTER CONSOLE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Event: <strong className="text-slate-200">{event?.title}</strong> • Anchor: <strong className="text-indigo-400">{event?.anchorName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAnnouncementModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-rose-600/30"
          >
            <Megaphone className="w-4 h-4 animate-bounce-short" />
            <span>Emergency Announcement</span>
          </button>

          <Link
            to={`/events/${eventId}/prompter`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/20"
          >
            <Presentation className="w-4 h-4" />
            <span>Open Anchor Stage View</span>
          </Link>
        </div>
      </div>

      {/* Real-time Status Grid: Current Session vs Next Up */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Live Session Box */}
        <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                CURRENTLY ON STAGE
              </span>
            </div>
            {currentLiveSession && (
              <span className="text-xs font-mono text-indigo-400">
                Scheduled: {currentLiveSession.startTime} - {currentLiveSession.endTime}
              </span>
            )}
          </div>

          {currentLiveSession ? (
            <div className="mt-4 space-y-4">
              <div>
                <span className="text-xs font-mono text-slate-500">
                  Session #{currentLiveSession.order} • {currentLiveSession.type.toUpperCase()}
                </span>
                <h2 className="text-2xl font-black text-white mt-1 leading-snug">
                  {currentLiveSession.title}
                </h2>
              </div>

              {currentLiveSession.speaker && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                  <img
                    src={currentLiveSession.speaker.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Speaker'}
                    alt={currentLiveSession.speaker.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{currentLiveSession.speaker.name}</h4>
                      {currentLiveSession.speaker.pronunciation && (
                        <span className="text-[11px] text-amber-400 font-mono italic">
                          ({currentLiveSession.speaker.pronunciation})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {currentLiveSession.speaker.designation} at {currentLiveSession.speaker.organization}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Dynamic Schedule Ripple Controls */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Quick Schedule Ripple (Push Forward)
                  </span>
                  <button
                    onClick={() => {
                      setDelayTargetSession(currentLiveSession);
                      setDelayModalOpen(true);
                    }}
                    className="text-[11px] text-amber-400 hover:underline font-semibold"
                  >
                    Custom +
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 5, 10, 15].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleQuickRipple(mins)}
                      className="py-1.5 px-2 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono font-bold transition"
                    >
                      +{mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage Action Controls */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCompleteCurrent}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-sm transition border border-emerald-500/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Session Completed
                </button>

                {nextSession && (
                  <button
                    onClick={() => handleStartSession(nextSession)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Advance to Next Session
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-white text-base">No Session Currently Live</p>
              <p className="text-xs text-slate-500 mt-1">
                Select an upcoming session below to go live on stage.
              </p>
              {nextSession && (
                <button
                  onClick={() => handleStartSession(nextSession)}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition"
                >
                  Start: {nextSession.title}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Next Up Preview Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <ArrowRight className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  UP NEXT IN QUEUE
                </span>
              </div>
              {nextSession && (
                <span className="text-xs font-mono text-slate-400">
                  Starts {nextSession.startTime} ({nextSession.durationMinutes}m)
                </span>
              )}
            </div>

            {nextSession ? (
              <div className="mt-4 space-y-4">
                <div>
                  <span className="text-xs font-mono text-slate-500">
                    Session #{nextSession.order} • {nextSession.type.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1 leading-snug">
                    {nextSession.title}
                  </h3>
                </div>

                {nextSession.speaker ? (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
                    <img
                      src={nextSession.speaker.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Speaker'}
                      alt={nextSession.speaker.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{nextSession.speaker.name}</h4>
                        {nextSession.speaker.pronunciation && (
                          <span className="text-[11px] text-amber-400 font-mono italic">
                            ({nextSession.speaker.pronunciation})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {nextSession.speaker.designation} at {nextSession.speaker.organization}
                      </p>
                      <p className="text-xs text-indigo-300 mt-1 font-medium">
                        Topic: {nextSession.speaker.topic}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 text-xs text-slate-400">
                    Host/Emcee activity or break session.
                  </div>
                )}

                {/* Speaker Talking points for anchor */}
                {nextSession.speaker?.talkingPoints && nextSession.speaker.talkingPoints.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                    <span className="text-[11px] font-bold uppercase text-slate-400 mb-1 block">
                      Anchor Talking Points:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {nextSession.speaker.talkingPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-semibold">End of scheduled agenda</p>
              </div>
            )}
          </div>

          {nextSession && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => handleStartSession(nextSession)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/20"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch "{nextSession.title}" Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Timeline & Full Agenda Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Complete Schedule Timeline
          </h3>
          <span className="text-xs text-slate-400">
            {sessions.length} total sessions
          </span>
        </div>

        <div className="space-y-2">
          {sessions.map((sess) => {
            const isLive = sess.status === 'live';
            const isDone = sess.status === 'completed';

            return (
              <div
                key={sess.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-sm transition ${
                  isLive
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : isDone
                    ? 'bg-slate-800/30 border-slate-800 text-slate-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-400 w-24">
                    {sess.startTime} - {sess.endTime}
                  </span>
                  <span className="font-semibold text-white">
                    #{sess.order}. {sess.title}
                  </span>
                  {sess.speaker && (
                    <span className="hidden sm:inline text-xs text-slate-400">
                      ({sess.speaker.name})
                    </span>
                  )}
                  {sess.delayMinutes > 0 && (
                    <span className="text-xs text-amber-400 font-mono font-semibold">
                      +{sess.delayMinutes}m
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                      isLive
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                        : isDone
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}
                  >
                    {sess.status}
                  </span>

                  {!isLive && !isDone && (
                    <button
                      onClick={() => handleStartSession(sess)}
                      className="text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broadcast Modal */}
      <AnnouncementModal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        eventId={eventId}
        onBroadcasted={(ann) => setAnnouncements((prev) => [ann, ...prev])}
      />

      {/* Delay Modal */}
      <DelayModal
        isOpen={delayModalOpen}
        onClose={() => setDelayModalOpen(false)}
        session={delayTargetSession}
        onDelayed={loadData}
      />
    </div>
  );
}
