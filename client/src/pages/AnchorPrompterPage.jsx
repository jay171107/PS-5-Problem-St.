import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock, Volume2, User, Play, Pause, ChevronRight, AlertTriangle,
  Maximize, Minimize, ArrowLeft, ArrowRight, Type, Sparkles, Megaphone,
  Radio, Check
} from 'lucide-react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function AnchorPrompterPage() {
  const { eventId } = useParams();
  const { joinEventRoom, socket, isConnected } = useSocket();

  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [nextSession, setNextSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Timer State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);

  // Teleprompter Controls
  const [fontSize, setFontSize] = useState(28); // px
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Emergency Flash Banner
  const [stageAlert, setStageAlert] = useState(null);

  const scrollContainerRef = useRef(null);
  const prompterRef = useRef(null);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await api.getEvent(eventId);
      setEvent(data);
      const sessList = data.sessions || [];
      setSessions(sessList);

      const live = sessList.find((s) => s.status === 'live') || sessList[0] || null;
      setCurrentSession(live);

      if (live) {
        const liveIdx = sessList.findIndex((s) => s.id === live.id);
        const next = liveIdx !== -1 && liveIdx + 1 < sessList.length ? sessList[liveIdx + 1] : null;
        setNextSession(next);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
    joinEventRoom(eventId);
  }, [eventId]);

  // Wall clock update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer logic based on session duration & start
  useEffect(() => {
    if (!currentSession) return;

    // Calculate remaining seconds based on endTime if available
    const calculateTimeLeft = () => {
      const now = new Date();
      if (currentSession.endTime && currentSession.endTime.includes(':')) {
        const [endH, endM] = currentSession.endTime.split(':').map(Number);
        const target = new Date();
        target.setHours(endH, endM, 0, 0);

        const diffSecs = Math.floor((target.getTime() - now.getTime()) / 1000);
        if (diffSecs < 0) {
          setIsOvertime(true);
          setSecondsRemaining(Math.abs(diffSecs));
        } else {
          setIsOvertime(false);
          setSecondsRemaining(diffSecs);
        }
      } else {
        setSecondsRemaining((currentSession.durationMinutes || 20) * 60);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [currentSession]);

  // Auto-scroll loop
  useEffect(() => {
    let animFrame;
    const scrollStep = () => {
      if (isScrolling && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += scrollSpeed * 0.5;
      }
      animFrame = requestAnimationFrame(scrollStep);
    };

    if (isScrolling) {
      animFrame = requestAnimationFrame(scrollStep);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isScrolling, scrollSpeed]);

  // Socket.IO Listeners for Dynamic Schedule & Announcements
  useEffect(() => {
    if (!socket) return;

    const handleRippled = (payload) => {
      if (payload.eventId === eventId) {
        setSessions(payload.sessions);
        if (currentSession) {
          const updatedCur = payload.sessions.find((s) => s.id === currentSession.id);
          if (updatedCur) setCurrentSession(updatedCur);
        }
        if (payload.announcement) {
          setStageAlert(payload.announcement);
        }
      }
    };

    const handleStatusChanged = (payload) => {
      if (payload.eventId === eventId) {
        setSessions((prev) => {
          const updated = prev.map((s) => (s.id === payload.session.id ? payload.session : s));
          const live = updated.find((s) => s.status === 'live');
          if (live) {
            setCurrentSession(live);
            const liveIdx = updated.findIndex((s) => s.id === live.id);
            setNextSession(liveIdx + 1 < updated.length ? updated[liveIdx + 1] : null);
          }
          return updated;
        });
      }
    };

    const handleAnnouncement = (ann) => {
      if (ann.eventId === eventId) {
        setStageAlert(ann);
      }
    };

    socket.on('schedule_rippled', handleRippled);
    socket.on('session_status_changed', handleStatusChanged);
    socket.on('announcement_broadcast', handleAnnouncement);

    return () => {
      socket.off('schedule_rippled', handleRippled);
      socket.off('session_status_changed', handleStatusChanged);
      socket.off('announcement_broadcast', handleAnnouncement);
    };
  }, [socket, eventId, currentSession]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const selectSession = (sess) => {
    setCurrentSession(sess);
    const idx = sessions.findIndex((s) => s.id === sess.id);
    setNextSession(idx + 1 < sessions.length ? sessions[idx + 1] : null);
    setIsScrolling(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-slate-400 font-mono">
        Initializing Anchor Stage Console...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden" ref={prompterRef}>
      
      {/* URGENT FULLSCREEN ANNOUNCEMENT FLASH OVERLAY */}
      {stageAlert && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-pulse-border border-4 border-rose-500">
          <div className="max-w-3xl w-full bg-rose-950/95 border-2 border-rose-500 rounded-3xl p-8 shadow-2xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-500 text-slate-950 font-black text-sm uppercase tracking-widest mb-4">
              <Megaphone className="w-5 h-5 animate-bounce" />
              LIVE STAGE ALERT FROM ORGANIZER
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              {stageAlert.title}
            </h2>

            <p className="mt-4 text-xl text-rose-100 font-medium">
              {stageAlert.message}
            </p>

            {stageAlert.spokenScript && (
              <div className="mt-6 p-6 rounded-2xl bg-black/60 border border-rose-400/40 text-left">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2">
                  READ ALOUD ON MICROPHONE:
                </span>
                <p className="text-2xl sm:text-3xl font-serif text-amber-200 font-bold leading-relaxed">
                  “{stageAlert.spokenScript}”
                </p>
              </div>
            )}

            <button
              onClick={() => setStageAlert(null)}
              className="mt-8 px-8 py-3 bg-white hover:bg-slate-200 text-slate-950 font-black text-base rounded-2xl transition shadow-xl"
            >
              ACKNOWLEDGE & RETURN TO PROMPTER
            </button>
          </div>
        </div>
      )}

      {/* TOP HUD BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to={`/events/${eventId}`}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Stage Mode</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
              {event?.title}
            </span>
          </div>
        </div>

        {/* Live Wall Clock */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">STAGE TIME</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN STAGE CONSOLE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* LEFT / CENTER: TELEPROMPTER VIEW (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col border-r border-slate-800 bg-black/60 relative">
          
          {/* Prompter Controls Toolbar */}
          <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
            {/* Play/Pause Scroll */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScrolling(!isScrolling)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-xs transition ${
                  isScrolling
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isScrolling ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isScrolling ? 'PAUSE SCROLL' : 'AUTO-SCROLL'}</span>
              </button>

              {/* Speed buttons */}
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 text-xs font-mono">
                {[1, 2, 3, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setScrollSpeed(spd)}
                    className={`px-2 py-1 rounded ${
                      scrollSpeed === spd ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Adjusters */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Font:</span>
              <button
                onClick={() => setFontSize((f) => Math.max(18, f - 3))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-xs"
              >
                A-
              </button>
              <span className="text-xs font-mono text-slate-300 w-8 text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize((f) => Math.min(48, f + 3))}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-xs"
              >
                A+
              </button>
            </div>
          </div>

          {/* Scrolling Prompter Body */}
          <div
            ref={scrollContainerRef}
            className="flex-1 p-8 sm:p-12 overflow-y-auto teleprompter-text space-y-8 scroll-smooth"
            style={{ fontSize: `${fontSize}px` }}
          >
            {currentSession ? (
              <>
                {/* Session Header Cue */}
                <div className="border-b-2 border-indigo-500/40 pb-4">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300">
                    ACTIVITY #{currentSession.order} • {currentSession.type.toUpperCase()}
                  </span>
                  <h1 className="text-white font-black mt-2 leading-tight">
                    {currentSession.title}
                  </h1>
                </div>

                {/* Stage Notes Box (High Visibility) */}
                {currentSession.anchorNotes && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border-l-4 border-amber-400 text-amber-200 text-sm font-sans font-medium">
                    <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Anchor Cue / Stage Note:
                    </span>
                    {currentSession.anchorNotes}
                  </div>
                )}

                {/* Main Prompter Script */}
                <div className="text-slate-100 font-serif leading-relaxed whitespace-pre-line tracking-wide">
                  {currentSession.script || (
                    <span className="text-slate-500 italic">
                      No teleprompter script authored for this segment yet. Anchor may improvise or use speaker talking points on the right.
                    </span>
                  )}
                </div>

                <div className="py-20 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
                  --- End of Segment ---
                </div>
              </>
            ) : (
              <div className="text-center py-24 text-slate-500 font-mono">
                No active session selected.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: TIMERS & SPEAKER CHEAT-SHEET (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col bg-slate-900 overflow-y-auto p-6 space-y-6">
          
          {/* BIG COUNTDOWN TIMER */}
          <div
            className={`p-6 rounded-2xl border-2 text-center shadow-2xl transition ${
              isOvertime
                ? 'bg-rose-950/50 border-rose-500 animate-pulse'
                : secondsRemaining < 180
                ? 'bg-amber-950/40 border-amber-500'
                : 'bg-slate-800/80 border-slate-700'
            }`}
          >
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
              {isOvertime ? '⚠️ OVERTIME / OVERRUN' : 'REMAINING IN THIS ACTIVITY'}
            </span>

            <div
              className={`text-5xl sm:text-6xl font-black font-mono tracking-tight ${
                isOvertime ? 'text-rose-400' : secondsRemaining < 180 ? 'text-amber-300' : 'text-white'
              }`}
            >
              {isOvertime && '+'}
              {formatTimer(secondsRemaining)}
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 text-xs font-mono text-slate-400 border-t border-slate-700/60 pt-2">
              <span>Start: {currentSession?.startTime || '--:--'}</span>
              <span>•</span>
              <span>Target End: {currentSession?.endTime || '--:--'}</span>
            </div>
          </div>

          {/* SPEAKER CHEAT SHEET */}
          {currentSession?.speaker ? (
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>SPEAKER CHEAT SHEET</span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={currentSession.speaker.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Speaker'}
                  alt={currentSession.speaker.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-600 shrink-0"
                />
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">
                    {currentSession.speaker.name}
                  </h3>
                  {currentSession.speaker.pronunciation && (
                    <span className="text-xs font-mono font-bold text-amber-300 block mt-0.5">
                      Pronounce: "{currentSession.speaker.pronunciation}"
                    </span>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentSession.speaker.designation}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold">
                    {currentSession.speaker.organization}
                  </p>
                </div>
              </div>

              {currentSession.speaker.topic && (
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                  <span className="text-slate-400 block font-semibold">Topic:</span>
                  <span className="text-indigo-300 font-bold">{currentSession.speaker.topic}</span>
                </div>
              )}

              {currentSession.speaker.talkingPoints && currentSession.speaker.talkingPoints.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Talking Points:</span>
                  <ul className="space-y-1 text-slate-200 list-disc list-inside">
                    {currentSession.speaker.talkingPoints.map((pt, i) => (
                      <li key={i} className="leading-snug">{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
              Host / Transition Segment (No guest assigned)
            </div>
          )}

          {/* UP NEXT PREVIEW */}
          <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              <span>UP NEXT</span>
              {nextSession && <span>{nextSession.startTime}</span>}
            </div>

            {nextSession ? (
              <div>
                <h4 className="font-bold text-white text-sm">{nextSession.title}</h4>
                {nextSession.speaker && (
                  <p className="text-xs text-slate-400 mt-1">
                    Speaker: <strong className="text-slate-200">{nextSession.speaker.name}</strong>
                  </p>
                )}
                <button
                  onClick={() => selectSession(nextSession)}
                  className="mt-3 w-full py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <span>Preview Script</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">End of agenda</p>
            )}
          </div>

          {/* QUICK SESSION SWITCHER */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
              All Sessions:
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSession(s)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition border flex items-center justify-between ${
                    currentSession?.id === s.id
                      ? 'bg-indigo-600 text-white font-bold border-indigo-400'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">#{s.order}. {s.title}</span>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">{s.startTime}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
