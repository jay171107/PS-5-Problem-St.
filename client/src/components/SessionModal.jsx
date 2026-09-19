import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, X, Check, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function SessionModal({ isOpen, onClose, eventId, session, speakers = [], onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'keynote',
    speakerId: '',
    startTime: '10:00',
    endTime: '10:30',
    durationMinutes: 30,
    script: '',
    anchorNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || '',
        type: session.type || 'keynote',
        speakerId: session.speakerId || '',
        startTime: session.startTime || '10:00',
        endTime: session.endTime || '10:30',
        durationMinutes: session.durationMinutes || 30,
        script: session.script || '',
        anchorNotes: session.anchorNotes || ''
      });
    } else {
      setFormData({
        title: '',
        type: 'keynote',
        speakerId: '',
        startTime: '10:00',
        endTime: '10:30',
        durationMinutes: 30,
        script: '',
        anchorNotes: ''
      });
    }
  }, [session, isOpen]);

  if (!isOpen) return null;

  const handleTimeChange = (start, duration) => {
    if (!start || !start.includes(':')) return;
    const [h, m] = start.split(':').map(Number);
    const total = (h * 60 + m + (parseInt(duration, 10) || 30)) % 1440;
    const newH = Math.floor(total / 60).toString().padStart(2, '0');
    const newM = (total % 60).toString().padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      startTime: start,
      durationMinutes: duration,
      endTime: `${newH}:${newM}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      let saved;
      if (session?.id) {
        saved = await api.updateSession(session.id, formData);
      } else {
        saved = await api.createSession({ ...formData, eventId });
      }
      if (onSaved) onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <Calendar className="w-6 h-6" />
            <h3 className="font-bold text-lg text-white">
              {session ? 'Edit Session / Activity' : 'Add New Session / Activity'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Session Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Keynote: The Future of Autonomous Neural Agents"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Activity Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="welcome">Welcome / Opening Remarks</option>
                <option value="keynote">Keynote Address</option>
                <option value="panel">Panel Discussion</option>
                <option value="workshop">Interactive Workshop</option>
                <option value="break">Networking / Refreshment Break</option>
                <option value="performance">Live Performance / Demo</option>
                <option value="closing">Closing / Vote of Thanks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Assigned Speaker / Guest
              </label>
              <select
                value={formData.speakerId}
                onChange={(e) => setFormData({ ...formData, speakerId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- No Speaker / Host Segment --</option>
                {speakers.map((spk) => (
                  <option key={spk.id} value={spk.id}>
                    {spk.name} ({spk.designation || spk.organization || 'Guest'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange(e.target.value, formData.durationMinutes)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                min="5"
                max="360"
                value={formData.durationMinutes}
                onChange={(e) => handleTimeChange(formData.startTime, parseInt(e.target.value) || 15)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                readOnly
                className="w-full px-2.5 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-400 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Emcee Script (Will appear on Stage Teleprompter)
            </label>
            <textarea
              rows={4}
              placeholder="Spoken script for anchor to deliver..."
              value={formData.script}
              onChange={(e) => setFormData({ ...formData, script: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-serif focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Anchor Stage Notes & Cues
            </label>
            <input
              type="text"
              placeholder="e.g. Wave guest to stage right; emphasize sponsor acknowledgment"
              value={formData.anchorNotes}
              onChange={(e) => setFormData({ ...formData, anchorNotes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && <div className="text-xs text-rose-400">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
