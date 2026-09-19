import React, { useState } from 'react';
import { Megaphone, Sparkles, Send, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const PRESETS = [
  {
    title: 'Upcoming Session Notice',
    message: 'The next session will begin in 10 minutes.',
    spokenScript: 'Ladies and gentlemen, a brief reminder that our next session will begin promptly in 10 minutes. Please make your way toward the auditorium.'
  },
  {
    title: 'Schedule Change Notification',
    message: "There has been a slight change in today's schedule.",
    spokenScript: "Honored guests, please note there has been a slight change in today's schedule. Updated timings are now live on your screens."
  },
  {
    title: 'Seat Request',
    message: 'We request everyone to remain seated.',
    spokenScript: 'We kindly request everyone to remain seated as our distinguished speakers prepare to take the stage.'
  },
  {
    title: 'Lunch & Refreshments',
    message: 'Lunch is now served in the dining atrium.',
    spokenScript: 'Lunch and artisanal refreshments are now served in the Grand Atrium. Please enjoy your meal and network with fellow delegates.'
  },
  {
    title: 'Technical Pause',
    message: 'Brief 5-minute technical interlude.',
    spokenScript: 'We are pausing briefly for a 5-minute technical reset. Please remain in place and we will resume in just moments.'
  }
];

export default function AnnouncementModal({ isOpen, onClose, eventId, onBroadcasted }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [spokenScript, setSpokenScript] = useState('');
  const [priority, setPriority] = useState('urgent');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (p) => {
    setTitle(p.title);
    setMessage(p.message);
    setSpokenScript(p.spokenScript);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGeneratingAi(true);
    setError('');
    try {
      const res = await api.generateScript({
        type: 'announcement',
        message: aiPrompt,
        priority
      });
      setMessage(aiPrompt);
      setTitle('Stage Announcement');
      setSpokenScript(res.script);
    } catch (err) {
      setError('AI generation failed: ' + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!message) {
      setError('Please provide a message or choose a preset.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const ann = await api.broadcastAnnouncement({
        eventId,
        title: title || 'Stage Announcement',
        message,
        priority,
        spokenScript: spokenScript || message
      });
      if (onBroadcasted) onBroadcasted(ann);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to broadcast announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-rose-400">
            <Megaphone className="w-6 h-6" />
            <h3 className="font-bold text-lg text-white">Broadcast Stage Announcement</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
            Instant 1-Click Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
              >
                <span>“{p.message}”</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Quick Generator */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Fast Announcement Polisher</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Lost badge found near registration booth, please collect"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGeneratingAi || !aiPrompt}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition shrink-0 flex items-center gap-1"
            >
              {isGeneratingAi ? 'Polishing...' : 'Polish with AI'}
            </button>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Important Schedule Notice"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="urgent">Urgent (Flash Banner + Sound Chime)</option>
                <option value="normal">Normal (Standard Notification)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Banner Message (Visible to Anchor & Displays)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. The next session will begin in 10 minutes."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Anchor Spoken Cue (Exact words anchor speaks into microphone)
            </label>
            <textarea
              rows={3}
              value={spokenScript}
              onChange={(e) => setSpokenScript(e.target.value)}
              placeholder="“Ladies and gentlemen, may I have your attention please...”"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-serif focus:outline-none focus:border-rose-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

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
              className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition shadow-lg shadow-rose-600/30"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Broadcasting...' : 'Broadcast Live Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
