import React, { useState, useEffect } from 'react';
import { User, Briefcase, Building, Mic, BookOpen, Volume2, X, Check, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function SpeakerModal({ isOpen, onClose, eventId, speaker, onSaved }) {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    organization: '',
    topic: '',
    bio: '',
    pronunciation: '',
    talkingPoints: [''],
    avatar: '',
    social: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (speaker) {
      setFormData({
        name: speaker.name || '',
        designation: speaker.designation || '',
        organization: speaker.organization || '',
        topic: speaker.topic || '',
        bio: speaker.bio || '',
        pronunciation: speaker.pronunciation || '',
        talkingPoints: speaker.talkingPoints && speaker.talkingPoints.length > 0 ? speaker.talkingPoints : [''],
        avatar: speaker.avatar || '',
        social: speaker.social || ''
      });
    } else {
      setFormData({
        name: '',
        designation: '',
        organization: '',
        topic: '',
        bio: '',
        pronunciation: '',
        talkingPoints: [''],
        avatar: '',
        social: ''
      });
    }
  }, [speaker, isOpen]);

  if (!isOpen) return null;

  const handleTalkingPointChange = (idx, value) => {
    const updated = [...formData.talkingPoints];
    updated[idx] = value;
    setFormData({ ...formData, talkingPoints: updated });
  };

  const addTalkingPoint = () => {
    setFormData({ ...formData, talkingPoints: [...formData.talkingPoints, ''] });
  };

  const removeTalkingPoint = (idx) => {
    const updated = formData.talkingPoints.filter((_, i) => i !== idx);
    setFormData({ ...formData, talkingPoints: updated.length ? updated : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Speaker name is required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        eventId,
        talkingPoints: formData.talkingPoints.filter(p => p.trim() !== '')
      };

      let saved;
      if (speaker?.id) {
        saved = await api.updateSpeaker(speaker.id, payload);
      } else {
        saved = await api.createSpeaker(payload);
      }
      if (onSaved) onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save speaker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <User className="w-6 h-6" />
            <h3 className="font-bold text-lg text-white">
              {speaker ? 'Edit Speaker Profile' : 'Add New Speaker / Guest'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Dr. Elena Rostova"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-amber-300 mb-1 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                Pronunciation Guide (Crucial for Anchor!)
              </label>
              <input
                type="text"
                placeholder="e.g., eh-LEH-nah ross-TOH-vah"
                value={formData.pronunciation}
                onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-amber-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Designation / Title
              </label>
              <input
                type="text"
                placeholder="e.g., Chief Scientist & VP of AI"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Organization / Company
              </label>
              <input
                type="text"
                placeholder="e.g., NeuroSyn Dynamics"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 flex items-center gap-1">
              <Mic className="w-3.5 h-3.5" /> Speech Topic / Keynote Title
            </label>
            <input
              type="text"
              placeholder="e.g., Beyond Transformers: Neuromorphic Reasoning"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Bio & Background (Used by AI script generator)
            </label>
            <textarea
              rows={3}
              placeholder="Key accomplishments, previous leadership roles, publications, honors..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase text-slate-300">
                Anchor Cheat-Sheet / Key Talking Points
              </label>
              <button
                type="button"
                onClick={addTalkingPoint}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" /> Add Point
              </button>
            </div>
            <div className="space-y-2">
              {formData.talkingPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleTalkingPointChange(idx, e.target.value)}
                    placeholder="e.g., Unveiling 50x lower energy inference architecture"
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  {formData.talkingPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTalkingPoint(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Avatar Photo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Social Handle / Link
              </label>
              <input
                type="text"
                placeholder="@speaker_handle"
                value={formData.social}
                onChange={(e) => setFormData({ ...formData, social: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
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
              {loading ? 'Saving...' : speaker ? 'Update Profile' : 'Add Speaker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
