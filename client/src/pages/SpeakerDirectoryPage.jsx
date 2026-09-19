import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Plus, Volume2, Briefcase, Building, Sparkles, Edit3, Trash2, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import SpeakerModal from '../components/SpeakerModal';

export default function SpeakerDirectoryPage() {
  const { eventId } = useParams();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);

  const loadSpeakers = async () => {
    try {
      setLoading(true);
      const data = await api.getSpeakers(eventId);
      setSpeakers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpeakers();
  }, [eventId]);

  const handleDelete = async (id, name) => {
    if (confirm(`Remove speaker "${name}"?`)) {
      try {
        await api.deleteSpeaker(id);
        loadSpeakers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Users className="w-4 h-4" /> Guest & Speaker Management
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Speaker Directory & Bios</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ensure the anchor has key talking points, achievements, and phonetic pronunciations before introducing guests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/events/${eventId}/scripts`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-semibold transition border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Script Studio</span>
          </Link>

          <button
            onClick={() => {
              setEditingSpeaker(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Speaker</span>
          </button>
        </div>
      </div>

      {/* Speakers Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading speakers...</div>
      ) : speakers.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl p-8">
          <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">No Speakers Listed Yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Add keynote presenters, panelists, and guests to generate accurate emcee introductions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((spk) => (
            <div
              key={spk.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={spk.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(spk.name)}`}
                      alt={spk.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{spk.name}</h3>
                      {spk.pronunciation && (
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-mono mt-0.5 font-semibold">
                          <Volume2 className="w-3 h-3" />
                          <span>{spk.pronunciation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingSpeaker(spk);
                        setModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                      title="Edit Speaker"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(spk.id, spk.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                      title="Delete Speaker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{spk.designation || 'Special Guest'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{spk.organization || 'Independent'}</span>
                  </div>
                </div>

                {spk.topic && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                      Speech / Presentation Topic:
                    </span>
                    <p className="text-xs font-semibold text-white mt-0.5 line-clamp-2">
                      {spk.topic}
                    </p>
                  </div>
                )}

                {spk.talkingPoints && spk.talkingPoints.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Anchor Talking Points:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {spk.talkingPoints.slice(0, 3).map((pt, i) => (
                        <li key={i} className="line-clamp-1">{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action: Generate AI Intro Script */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link
                  to={`/events/${eventId}/scripts?speakerId=${spk.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-bold rounded-xl text-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate AI Intro Script</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Speaker Modal */}
      <SpeakerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventId={eventId}
        speaker={editingSpeaker}
        onSaved={loadSpeakers}
      />
    </div>
  );
}
