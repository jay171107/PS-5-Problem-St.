import React from 'react';
import { Megaphone, X, Volume2, Clock } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function AnnouncementBanner() {
  const { activeAlert, dismissAlert } = useSocket();

  if (!activeAlert) return null;

  const isHighPriority = activeAlert.priority === 'urgent' || activeAlert.priority === 'alert';

  return (
    <div className="fixed top-20 inset-x-4 md:inset-x-auto md:right-8 md:w-[480px] z-50 animate-bounce-short">
      <div
        className={`rounded-xl border shadow-2xl p-4 backdrop-blur-lg ${
          isHighPriority
            ? 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-rose-900/50 animate-pulse-border'
            : 'bg-amber-950/90 border-amber-500 text-amber-100 shadow-amber-900/50'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                isHighPriority ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              <Megaphone className="w-5 h-5 animate-spin-once" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40">
                {activeAlert.priority || 'Urgent'} Stage Alert
              </span>
              <h4 className="font-bold text-base text-white mt-0.5">{activeAlert.title}</h4>
            </div>
          </div>

          <button
            onClick={dismissAlert}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition"
            title="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message body */}
        <p className="mt-2 text-sm text-slate-200">{activeAlert.message}</p>

        {/* Spoken Script for Anchor */}
        {activeAlert.spokenScript && (
          <div className="mt-3 p-2.5 rounded-lg bg-black/50 border border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Spoken Cue for Anchor:</span>
            </div>
            <p className="text-sm font-medium italic text-amber-100">
              "{activeAlert.spokenScript}"
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(activeAlert.timestamp || Date.now()).toLocaleTimeString()}
          </span>
          <button
            onClick={dismissAlert}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded font-medium transition text-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
