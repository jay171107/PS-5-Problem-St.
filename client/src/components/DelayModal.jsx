import React, { useState } from 'react';
import { Clock, AlertTriangle, X, Check } from 'lucide-react';
import { api } from '../services/api';

export default function DelayModal({ isOpen, onClose, session, onDelayed }) {
  const [delayMinutes, setDelayMinutes] = useState(5);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !session) return null;

  const quickDelays = [2, 5, 10, 15, 20, 30];

  const handleApplyDelay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.delaySession(
        session.id,
        delayMinutes,
        reason || `Activity "${session.title}" extended by ${delayMinutes} minutes.`
      );
      if (onDelayed) onDelayed(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to apply delay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Clock className="w-6 h-6" />
            <h3 className="font-bold text-lg text-white">Dynamic Schedule Ripple</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApplyDelay} className="mt-4 space-y-4">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-sm">
            <span className="text-slate-400">Target Session:</span>
            <p className="font-semibold text-white truncate">{session.title}</p>
            <p className="text-xs text-indigo-400 mt-1">
              Current slot: {session.startTime} - {session.endTime} ({session.durationMinutes} mins)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
              Extend Session By (Minutes)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickDelays.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDelayMinutes(mins)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold border transition ${
                    delayMinutes === mins
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  +{mins} min
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">Or custom:</span>
              <input
                type="number"
                min="1"
                max="180"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-slate-400">minutes</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Reason / Public Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Deep audience Q&A discussion, brief audio check"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              All upcoming sessions will automatically shift forward by <strong>+{delayMinutes} minutes</strong>. Connected teleprompters and control monitors will update instantly.
            </span>
          </div>

          {error && <div className="text-xs text-rose-400">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-2">
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
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-sm transition shadow-lg shadow-amber-500/20"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Rippling...' : `Apply +${delayMinutes}m Ripple`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
