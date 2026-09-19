import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

// Initialize Seed Data
function getSeedData() {
  const eventId = 'event-techinnovate-2026';
  const speaker1Id = 'spk-elena-rostova';
  const speaker2Id = 'spk-marcus-chen';
  const speaker3Id = 'spk-priya-sharma';

  return {
    events: [
      {
        id: eventId,
        title: 'TechInnovate Global Summit 2026',
        theme: 'Autonomous Intelligence, Quantum Horizons & The Future of Work',
        date: '2026-09-20',
        startTime: '09:00',
        venue: 'Grand Horizon Auditorium & Global Stream',
        anchorName: 'Sarah Jenkins',
        description: 'The premier international gathering uniting 2,000+ AI innovators, founders, and deep-tech pioneers.',
        status: 'live',
        currentSessionId: 'sess-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    speakers: [
      {
        id: speaker1Id,
        eventId: eventId,
        name: 'Dr. Elena Rostova',
        designation: 'Chief Scientist & VP of AI Research',
        organization: 'NeuroSyn Dynamics',
        topic: 'Beyond Transformers: The Dawn of Neuromorphic Reasoning',
        bio: 'Leading pioneer in energy-efficient cognitive architectures. Former DeepMind fellow with 40+ cited publications in autonomous neural modeling.',
        pronunciation: 'eh-LEH-nah ross-TOH-vah',
        talkingPoints: [
          'Unveiling 50x lower energy inference architecture',
          'Keynote demonstrates real-time sensory perception on edge chips',
          'Advocate for open collaborative research benchmarks'
        ],
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces',
        social: '@elena_neuro',
        createdAt: new Date().toISOString()
      },
      {
        id: speaker2Id,
        eventId: eventId,
        name: 'Marcus Vance Chen',
        designation: 'Founder & CEO',
        organization: 'Aetheris Quantum Computing',
        topic: 'Quantum Supremacy in Commercial Logistics & Encryption',
        bio: 'Serial deep-tech entrepreneur who took Aetheris from MIT spin-out to a $3B quantum hardware powerhouse in under 5 years.',
        pronunciation: 'MAR-kus VANS CHEN',
        talkingPoints: [
          'Announcing their 1,000-qubit fault-tolerant quantum prototype',
          'How quantum transforms supply chain routing in minutes instead of months',
          'Forbes 30 Under 30 Hall of Fame honoree'
        ],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces',
        social: '@marcuschen_q',
        createdAt: new Date().toISOString()
      },
      {
        id: speaker3Id,
        eventId: eventId,
        name: 'Priya Sharma',
        designation: 'Director of Responsible Technology',
        organization: 'Global AI Alliance',
        topic: 'Governing the Silicon Mind: Safety, Ethics & Global Treaties',
        bio: 'International legal technologist advising the UN, EU, and Fortune 100 leaders on ethical guardrails and algorithmic accountability.',
        pronunciation: 'PREE-yah SHAR-mah',
        talkingPoints: [
          'Drafted landmark cross-border AI safety standards',
          'Bridging the gap between frontier labs and civic protection',
          'Key author of the 2026 Algorithmic Transparency Accord'
        ],
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=faces',
        social: '@priya_ethics',
        createdAt: new Date().toISOString()
      }
    ],
    sessions: [
      {
        id: 'sess-01',
        eventId: eventId,
        title: 'Opening Ceremony & Grand Welcome',
        order: 1,
        type: 'welcome',
        speakerId: null,
        startTime: '09:00',
        endTime: '09:20',
        durationMinutes: 20,
        status: 'live',
        script: "Good morning, visionaries, innovators, and distinguished guests from across the globe! Welcome to the TechInnovate Global Summit 2026. Today, under one magnificent roof, we bring together the brightest minds shaping tomorrow's technology. Get ready for a transformative journey across artificial intelligence, quantum breakthroughs, and the human future. Please settle in as we ignite today's program!",
        anchorNotes: 'Energetic greeting. Acknowledge livestream viewers from 45+ countries. Remind attendees about event hashtag #TechInnovate2026.',
        delayMinutes: 0
      },
      {
        id: 'sess-02',
        eventId: eventId,
        title: 'Keynote: Beyond Transformers & Neuromorphic Reasoning',
        order: 2,
        type: 'keynote',
        speakerId: speaker1Id,
        startTime: '09:20',
        endTime: '10:00',
        durationMinutes: 40,
        status: 'upcoming',
        script: "Ladies and gentlemen, our opening keynote speaker is an undisputed pioneer in artificial intelligence. As Chief Scientist and VP of AI Research at NeuroSyn Dynamics, she has redefined how neural architectures learn and adapt. Please give a roaring TechInnovate welcome to Dr. Elena Rostova!",
        anchorNotes: 'Pronounce eh-LEH-nah ross-TOH-vah. Stand by the left podium after introduction.',
        delayMinutes: 0
      },
      {
        id: 'sess-03',
        eventId: eventId,
        title: 'Transition & Fireside: Commercial Quantum Frontiers',
        order: 3,
        type: 'keynote',
        speakerId: speaker2Id,
        startTime: '10:00',
        endTime: '10:45',
        durationMinutes: 45,
        status: 'upcoming',
        script: "Thank you Dr. Rostova for that mind-bending demonstration of neuromorphic reasoning. Now, we venture from neural synapses to quantum states. Our next guest is the visionary founder and CEO of Aetheris Quantum Computing, bridging theoretical physics with multi-billion-dollar enterprise logistics. Join me in welcoming Marcus Vance Chen!",
        anchorNotes: 'Highlight 1,000-qubit prototype milestone.',
        delayMinutes: 0
      },
      {
        id: 'sess-04',
        eventId: eventId,
        title: 'Networking Coffee & Innovation Expo Break',
        order: 4,
        type: 'break',
        speakerId: null,
        startTime: '10:45',
        endTime: '11:15',
        durationMinutes: 30,
        status: 'upcoming',
        script: "What an exhilarating morning of discoveries! It is now time for our Networking & Innovation Showcase break. Refreshments are served in the Grand Atrium, and don't forget to interact with our 30+ startup booths. We reconvene promptly at 11:15 AM!",
        anchorNotes: 'Guide guests towards West Hall for barista stations and VR demos.',
        delayMinutes: 0
      },
      {
        id: 'sess-05',
        eventId: eventId,
        title: 'Panel: Governing the Silicon Mind - Ethics & Safety',
        order: 5,
        type: 'panel',
        speakerId: speaker3Id,
        startTime: '11:15',
        endTime: '12:00',
        durationMinutes: 45,
        status: 'upcoming',
        script: "Welcome back everyone! As technology accelerates, our ethical compass must keep pace. Leading our high-stakes panel on algorithmic governance and international accords is Priya Sharma, Director of Responsible Technology at the Global AI Alliance. Welcome Priya and our distinguished panelists!",
        anchorNotes: 'Direct audience to submit live Q&A questions through the event web app.',
        delayMinutes: 0
      },
      {
        id: 'sess-06',
        eventId: eventId,
        title: 'Closing Ceremony & Vote of Thanks',
        order: 6,
        type: 'closing',
        speakerId: null,
        startTime: '12:00',
        endTime: '12:20',
        durationMinutes: 20,
        status: 'upcoming',
        script: "As our morning sessions draw to an inspiring finish, we extend our heartfelt gratitude to every speaker, delegate, sponsor, and behind-the-scenes hero who made today extraordinary. Carry these insights, build boldly, and we will see you at tomorrow's hackathon showcase! Thank you and safe travels!",
        anchorNotes: 'Call stage crew and organizing committee for group photo.',
        delayMinutes: 0
      }
    ],
    announcements: [
      {
        id: 'ann-01',
        eventId: eventId,
        title: 'Welcome to TechInnovate 2026',
        message: 'Livestream is now active. High-speed Wi-Fi network: TechInnovate_Guest (Pass: Innovate2026)',
        priority: 'normal',
        spokenScript: 'A quick reminder to delegates: free high-speed Wi-Fi is available across all halls on TechInnovate_Guest.',
        timestamp: new Date().toISOString(),
        acknowledged: true
      }
    ]
  };
}

// In-File JSON Store Manager
class JsonStore {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getSeedData();
        this.save();
      }
    } catch (err) {
      console.warn('⚠️ Error loading JSON store, generating fresh seed data:', err.message);
      this.data = getSeedData();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ Failed to save JSON store:', err.message);
    }
  }

  // Events
  getEvents() {
    return this.data.events || [];
  }

  getEventById(id) {
    return (this.data.events || []).find(e => e.id === id) || null;
  }

  createEvent(eventData) {
    const newEvent = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'upcoming',
      currentSessionId: null,
      ...eventData
    };
    this.data.events.push(newEvent);
    this.save();
    return newEvent;
  }

  updateEvent(id, updates) {
    const idx = this.data.events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.events[idx] = {
      ...this.data.events[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.events[idx];
  }

  deleteEvent(id) {
    this.data.events = this.data.events.filter(e => e.id !== id);
    this.data.sessions = this.data.sessions.filter(s => s.eventId !== id);
    this.data.speakers = this.data.speakers.filter(sp => sp.eventId !== id);
    this.data.announcements = this.data.announcements.filter(a => a.eventId !== id);
    this.save();
    return true;
  }

  // Speakers
  getSpeakers(eventId) {
    if (!eventId) return this.data.speakers || [];
    return (this.data.speakers || []).filter(s => s.eventId === eventId);
  }

  getSpeakerById(id) {
    return (this.data.speakers || []).find(s => s.id === id) || null;
  }

  createSpeaker(speakerData) {
    const newSpeaker = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      talkingPoints: [],
      ...speakerData
    };
    this.data.speakers.push(newSpeaker);
    this.save();
    return newSpeaker;
  }

  updateSpeaker(id, updates) {
    const idx = this.data.speakers.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.speakers[idx] = { ...this.data.speakers[idx], ...updates };
    this.save();
    return this.data.speakers[idx];
  }

  deleteSpeaker(id) {
    this.data.speakers = this.data.speakers.filter(s => s.id !== id);
    // Remove speaker reference from any sessions
    this.data.sessions.forEach(sess => {
      if (sess.speakerId === id) sess.speakerId = null;
    });
    this.save();
    return true;
  }

  // Sessions
  getSessions(eventId) {
    let list = this.data.sessions || [];
    if (eventId) list = list.filter(s => s.eventId === eventId);
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getSessionById(id) {
    return (this.data.sessions || []).find(s => s.id === id) || null;
  }

  createSession(sessionData) {
    const sessions = this.getSessions(sessionData.eventId);
    const order = sessionData.order || (sessions.length > 0 ? Math.max(...sessions.map(s => s.order || 0)) + 1 : 1);
    const newSession = {
      id: uuidv4(),
      order,
      status: 'upcoming',
      delayMinutes: 0,
      script: '',
      anchorNotes: '',
      ...sessionData
    };
    this.data.sessions.push(newSession);
    this.save();
    return newSession;
  }

  updateSession(id, updates) {
    const idx = this.data.sessions.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.sessions[idx] = { ...this.data.sessions[idx], ...updates };
    this.save();
    return this.data.sessions[idx];
  }

  deleteSession(id) {
    const session = this.getSessionById(id);
    if (!session) return false;
    this.data.sessions = this.data.sessions.filter(s => s.id !== id);
    // Re-index order
    const remaining = this.getSessions(session.eventId);
    remaining.forEach((s, idx) => {
      s.order = idx + 1;
    });
    this.save();
    return true;
  }

  // Helper: Recalculate schedule timings with a delay ripple
  rippleDelay(eventId, fromSessionId, addedMinutes) {
    const sessions = this.getSessions(eventId);
    const targetIdx = sessions.findIndex(s => s.id === fromSessionId);
    if (targetIdx === -1) return sessions;

    const delay = parseInt(addedMinutes, 10) || 0;
    if (delay === 0) return sessions;

    // Helper to add minutes to "HH:MM"
    const addMinutesToTime = (timeStr, mins) => {
      if (!timeStr || !timeStr.includes(':')) return timeStr;
      const [h, m] = timeStr.split(':').map(Number);
      const totalMins = (h * 60 + m + mins + 1440) % 1440;
      const newH = Math.floor(totalMins / 60).toString().padStart(2, '0');
      const newM = (totalMins % 60).toString().padStart(2, '0');
      return `${newH}:${newM}`;
    };

    // Target session gets extended or delayed
    const target = sessions[targetIdx];
    target.durationMinutes = (target.durationMinutes || 30) + delay;
    target.endTime = addMinutesToTime(target.endTime, delay);
    target.delayMinutes = (target.delayMinutes || 0) + delay;

    // All subsequent sessions get shifted forward
    let runningStartTime = target.endTime;
    for (let i = targetIdx + 1; i < sessions.length; i++) {
      const sess = sessions[i];
      sess.startTime = runningStartTime;
      sess.endTime = addMinutesToTime(sess.startTime, sess.durationMinutes || 30);
      sess.delayMinutes = (sess.delayMinutes || 0) + delay;
      runningStartTime = sess.endTime;
    }

    this.save();
    return sessions;
  }

  // Announcements
  getAnnouncements(eventId) {
    let list = this.data.announcements || [];
    if (eventId) list = list.filter(a => a.eventId === eventId);
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  createAnnouncement(data) {
    const newAnn = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      acknowledged: false,
      priority: data.priority || 'normal',
      ...data
    };
    if (!this.data.announcements) this.data.announcements = [];
    this.data.announcements.unshift(newAnn);
    this.save();
    return newAnn;
  }

  acknowledgeAnnouncement(id) {
    const ann = (this.data.announcements || []).find(a => a.id === id);
    if (ann) {
      ann.acknowledged = true;
      this.save();
    }
    return ann;
  }
}

const db = new JsonStore();

// Optional MongoDB initialization
export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log('🔄 Connecting to MongoDB:', mongoUri);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
      console.log('✅ MongoDB connected successfully.');
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed, utilizing zero-setup JSON store:', err.message);
      isMongoConnected = false;
    }
  } else {
    console.log('⚡ Zero-setup persistent JSON database initialized (server/data/store.json).');
  }
  return db;
}

export default db;
