import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles, Bot, Copy, Check, Save, ArrowRight, User, Calendar,
  Volume2, RefreshCw, Layers, Megaphone, CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

const SCRIPT_TYPES = [
  { id: 'welcome', label: 'Welcome / Opening', desc: 'Captivate the room and introduce theme & housekeeping' },
  { id: 'speaker_intro', label: 'Speaker Introduction', desc: 'Rousing 60-90s intro honoring credentials & topic' },
  { id: 'transition', label: 'Activity Transition', desc: 'Bridge between concluded and upcoming sessions' },
  { id: 'closing', label: 'Closing & Vote of Thanks', desc: 'Inspiring sign-off, sponsor gratitude & send-off' },
  { id: 'announcement', label: 'Stage Announcement', desc: 'Clear, polite emergency or schedule adjustment' },
];

const TONES = [
  'Energetic & Prestigious',
  'Professional & Executive',
  'Warm & Conversational',
  'Inspirational & Visionary'
];

export default function AIScriptStudioPage() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const initialSpeakerId = searchParams.get('speakerId') || '';

  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Script Generator Form State
  const [activeType, setActiveType] = useState(initialSpeakerId ? 'speaker_intro' : 'welcome');
  const [tone, setTone] = useState(TONES[0]);

  // Form Fields
  const [selectedSpeakerId, setSelectedSpeakerId] = useState(initialSpeakerId);
  const [speakerDetails, setSpeakerDetails] = useState({
    name: '',
    designation: '',
    organization: '',
    topic: '',
    bio: '',
    pronunciation: ''
  });

  const [prevSessionId, setPrevSessionId] = useState('');
  const [nextSessionId, setNextSessionId] = useState('');
  const [announcementPrompt, setAnnouncementPrompt] = useState('');

  // Result & Saving State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [anchorNotes, setAnchorNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [targetSessionId, setTargetSessionId] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [providerUsed, setProviderUsed] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const ev = await api.getEvent(eventId);
        setEvent(ev);
        setSessions(ev.sessions || []);
        setSpeakers(ev.speakers || []);

        if (initialSpeakerId && ev.speakers) {
          const spk = ev.speakers.find((s) => s.id === initialSpeakerId);
          if (spk) applySpeaker(spk);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [eventId, initialSpeakerId]);

  const applySpeaker = (spk) => {
    setSelectedSpeakerId(spk.id);
    setSpeakerDetails({
      name: spk.name || '',
      designation: spk.designation || '',
      organization: spk.organization || '',
      topic: spk.topic || '',
      bio: spk.bio || '',
      pronunciation: spk.pronunciation || ''
    });
  };

  const handleSpeakerSelect = (e) => {
    const spkId = e.target.value;
    setSelectedSpeakerId(spkId);
    const found = speakers.find((s) => s.id === spkId);
    if (found) {
      applySpeaker(found);
    } else {
      setSpeakerDetails({
        name: '',
        designation: '',
        organization: '',
        topic: '',
        bio: '',
        pronunciation: ''
      });
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setIsSaved(false);

    try {
      let payload = {
        type: activeType,
        tone,
        eventName: event?.title || 'This Grand Summit',
        theme: event?.theme || 'Innovation and Progress',
        anchorName: event?.anchorName || 'Emcee'
      };

      if (activeType === 'speaker_intro') {
        payload = {
          ...payload,
          speakerName: speakerDetails.name,
          designation: speakerDetails.designation,
          organization: speakerDetails.organization,
          topic: speakerDetails.topic,
          bio: speakerDetails.bio,
          pronunciation: speakerDetails.pronunciation
        };
      } else if (activeType === 'transition') {
        const prev = sessions.find((s) => s.id === prevSessionId);
        const next = sessions.find((s) => s.id === nextSessionId);
        payload = {
          ...payload,
          prevSessionTitle: prev?.title || 'the concluded keynote',
          nextSessionTitle: next?.title || 'the upcoming segment',
          nextSpeakerName: next?.speaker?.name || 'our next speaker'
        };
      } else if (activeType === 'announcement') {
        payload = {
          ...payload,
          message: announcementPrompt || "There has been a slight change in today's schedule."
        };
      }

      const res = await api.generateScript(payload);
      setGeneratedScript(res.script);
      setAnchorNotes(res.notes || 'Deliver with confident stage presence.');
      setProviderUsed(res.provider || 'ai');
    } catch (err) {
      alert('Generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${generatedScript}\n\n[ANCHOR NOTES: ${anchorNotes}]`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToSession = async () => {
    if (!targetSessionId || !generatedScript) return;
    try {
      await api.saveScriptToSession(targetSessionId, generatedScript, anchorNotes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" /> AI Stage Script Studio
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Emcee Script Generator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate high-impact welcome speeches, speaker intros, smooth transitions, and emergency announcements.
          </p>
        </div>

        <Link
          to={`/events/${eventId}/prompter`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm self-start md:self-auto shadow-lg shadow-amber-500/20 transition"
        >
          <span>Open Teleprompter Preview</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Script Type Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {SCRIPT_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveType(t.id);
              setGeneratedScript('');
            }}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
              activeType === t.id
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10 ring-1 ring-indigo-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span className="font-bold text-xs sm:text-sm text-white">{t.label}</span>
            <span className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              Script Context & Inputs
            </h3>
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase">
              {activeType.replace('_', ' ')}
            </span>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Desired Tone & Delivery
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {TONES.map((tn) => (
                <option key={tn} value={tn}>{tn}</option>
              ))}
            </select>
          </div>

          {/* Type Specific Fields */}
          {activeType === 'welcome' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={event?.title || ''}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Event Theme / Focus
                </label>
                <input
                  type="text"
                  value={event?.theme || ''}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-300 font-medium"
                />
              </div>
            </div>
          )}

          {activeType === 'speaker_intro' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Select Existing Speaker (Auto-Fills)
                </label>
                <select
                  value={selectedSpeakerId}
                  onChange={handleSpeakerSelect}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="">-- Custom / Manual Entry --</option>
                  {speakers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.designation || s.organization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Speaker Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dr. Elena Rostova"
                  value={speakerDetails.name}
                  onChange={(e) => setSpeakerDetails({ ...speakerDetails, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="VP of Research"
                    value={speakerDetails.designation}
                    onChange={(e) => setSpeakerDetails({ ...speakerDetails, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    placeholder="NeuroSyn"
                    value={speakerDetails.organization}
                    onChange={(e) => setSpeakerDetails({ ...speakerDetails, organization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Speech Topic
                </label>
                <input
                  type="text"
                  placeholder="Keynote Topic"
                  value={speakerDetails.topic}
                  onChange={(e) => setSpeakerDetails({ ...speakerDetails, topic: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-amber-300 mb-1">
                  Phonetic Pronunciation
                </label>
                <input
                  type="text"
                  placeholder="eh-LEH-nah ross-TOH-vah"
                  value={speakerDetails.pronunciation}
                  onChange={(e) => setSpeakerDetails({ ...speakerDetails, pronunciation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-amber-200"
                />
              </div>
            </div>
          )}

          {activeType === 'transition' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Concluded Session
                </label>
                <select
                  value={prevSessionId}
                  onChange={(e) => setPrevSessionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="">-- Choose previous session --</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.order}. {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Next Upcoming Session
                </label>
                <select
                  value={nextSessionId}
                  onChange={(e) => setNextSessionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="">-- Choose next session --</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.order}. {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeType === 'announcement' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Announcement Reason / Message Prompt
              </label>
              <textarea
                rows={3}
                placeholder="e.g. The next session will begin in 10 minutes, or Slight schedule change due to audio test."
                value={announcementPrompt}
                onChange={(e) => setAnnouncementPrompt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-xl text-sm transition shadow-lg shadow-indigo-600/30"
          >
            <Sparkles className={`w-4 h-4 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Authoring Script...' : 'Generate Stage Script'}</span>
          </button>
        </div>

        {/* Right Preview: Generated Emcee Script (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">
                  Script Output Preview
                </span>
                {providerUsed && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Engine: {providerUsed}
                  </span>
                )}
              </div>

              {generatedScript && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              )}
            </div>

            {generatedScript ? (
              <div className="mt-4 space-y-4">
                {/* Spoken Teleprompter Content */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                    Spoken Anchor Script:
                  </span>
                  <p className="text-base sm:text-lg font-serif text-slate-100 leading-relaxed whitespace-pre-line">
                    {generatedScript}
                  </p>
                </div>

                {/* Anchor Cues & Notes */}
                {anchorNotes && (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
                    <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Stage Cues & Delivery Notes:
                    </span>
                    <p>{anchorNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-500">
                <Sparkles className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                <p className="font-semibold text-sm">No Script Generated Yet</p>
                <p className="text-xs text-slate-600 mt-1">
                  Fill in the details on the left and click "Generate Stage Script".
                </p>
              </div>
            )}
          </div>

          {/* Action: Save Script Directly to a Session */}
          {generatedScript && (
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Push Script Live to Teleprompter:
                </label>
                <select
                  value={targetSessionId}
                  onChange={(e) => setTargetSessionId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="">-- Choose Session to Assign Script --</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.order}. {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveToSession}
                disabled={!targetSessionId}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition shrink-0 self-end sm:self-auto"
              >
                {isSaved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'Assigned to Session!' : 'Save to Prompter'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
