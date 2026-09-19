import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Radio, Users, Sparkles, Sliders, Presentation, Calendar, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Navbar({ currentEvent }) {
  const location = useLocation();
  const { eventId } = useParams();
  const id = eventId || currentEvent?.id;
  const { isConnected } = useSocket();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Event Context */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-indigo-400 font-bold text-lg hover:text-indigo-300 transition">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <span className="tracking-tight text-white font-extrabold text-xl">
                Event<span className="text-indigo-400">Flow</span>
                <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
              </span>
            </Link>

            {currentEvent && (
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {currentEvent.title}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links for Active Event */}
          {id ? (
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to={`/events/${id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  isActive(`/events/${id}`)
                    ? 'bg-slate-800 text-indigo-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Agenda
              </Link>

              <Link
                to={`/events/${id}/speakers`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  isActive(`/events/${id}/speakers`)
                    ? 'bg-slate-800 text-indigo-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-4 h-4" />
                Speakers
              </Link>

              <Link
                to={`/events/${id}/scripts`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  isActive(`/events/${id}/scripts`)
                    ? 'bg-slate-800 text-indigo-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Script Studio
              </Link>

              <Link
                to={`/events/${id}/control`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  isActive(`/events/${id}/control`)
                    ? 'bg-slate-800 text-indigo-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Sliders className="w-4 h-4 text-emerald-400" />
                Control Center
              </Link>
            </nav>
          ) : (
            <div className="text-xs text-slate-400">Select an event to view controls</div>
          )}

          {/* Right Action: Stage Prompter Mode & Socket Status */}
          <div className="flex items-center gap-3">
            {/* Live Socket Status indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                isConnected
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                  : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
              }`}
              title={isConnected ? 'Live Realtime Sync Connected' : 'Sync Disconnected'}
            >
              {isConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
              <span className="hidden sm:inline">{isConnected ? 'LIVE SYNC' : 'OFFLINE'}</span>
            </div>

            {id && (
              <Link
                to={`/events/${id}/prompter`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg shadow-lg shadow-amber-500/20 text-xs sm:text-sm tracking-wide transition transform hover:-translate-y-0.5"
              >
                <Presentation className="w-4 h-4 text-slate-950" />
                <span>Anchor Stage View</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
