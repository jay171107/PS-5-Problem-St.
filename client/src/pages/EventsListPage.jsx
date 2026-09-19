import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Clock, MapPin, Radio, Users, ChevronRight, Presentation, Sliders, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    theme: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    venue: '',
    anchorName: 'Emcee'
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newEvent.title) return;
    try {
      await api.createEvent(newEvent);
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        theme: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        venue: '',
        anchorName: 'Emcee'
      });
      loadEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, title, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.deleteEvent(id);
        loadEvents();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Radio className="w-4 h-4" /> Live Agenda & Emcee Copilot
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Events & Summits</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time schedule management, synchronized emcee teleprompter, and AI script generation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/25 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl p-8 mt-6">
          <Calendar className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-white">No Events Yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Get started by creating your first event with agenda sessions and speakers.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition"></div>

              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                      ev.status === 'live'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {ev.status === 'live' ? '● LIVE STAGE' : 'UPCOMING'}
                  </span>

                  <button
                    onClick={(e) => handleDelete(ev.id, ev.title, e)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800/50 transition opacity-0 group-hover:opacity-100"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link to={`/events/${ev.id}`} className="block mt-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition leading-snug">
                    {ev.title}
                  </h3>
                  {ev.theme && (
                    <p className="text-xs text-indigo-300/80 italic mt-1 line-clamp-2">
                      "{ev.theme}"
                    </p>
                  )}
                </Link>

                <div className="mt-4 space-y-1.5 text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ev.date} at {ev.startTime}</span>
                  </div>
                  {ev.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  )}
                  {ev.anchorName && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Anchor: <strong className="text-slate-300">{ev.anchorName}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  to={`/events/${ev.id}/control`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  Control Room
                </Link>

                <Link
                  to={`/events/${ev.id}/prompter`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold rounded-lg text-xs transition shadow-md shadow-amber-500/10"
                >
                  <Presentation className="w-3.5 h-3.5" />
                  Stage View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-white mb-4">Create New Event</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Annual Tech Symposium 2026"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Theme / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g., Exploring the Future of Intelligent Systems"
                  value={newEvent.theme}
                  onChange={(e) => setNewEvent({ ...newEvent, theme: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Venue / Hall</label>
                  <input
                    type="text"
                    placeholder="Grand Auditorium"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Anchor / Emcee</label>
                  <input
                    type="text"
                    placeholder="Host Name"
                    value={newEvent.anchorName}
                    onChange={(e) => setNewEvent({ ...newEvent, anchorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm transition"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
