import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnnouncementBanner from './components/AnnouncementBanner';
import EventsListPage from './pages/EventsListPage';
import EventDetailPage from './pages/EventDetailPage';
import OrganizerControlPage from './pages/OrganizerControlPage';
import AnchorPrompterPage from './pages/AnchorPrompterPage';
import SpeakerDirectoryPage from './pages/SpeakerDirectoryPage';
import AIScriptStudioPage from './pages/AIScriptStudioPage';
import { api } from './services/api';

export default function App() {
  const location = useLocation();
  const [currentEvent, setCurrentEvent] = useState(null);

  // Extract eventId from URL if present (e.g. /events/:eventId/...)
  const eventIdMatch = location.pathname.match(/\/events\/([^/]+)/);
  const activeEventId = eventIdMatch ? eventIdMatch[1] : null;

  useEffect(() => {
    if (activeEventId) {
      api.getEvent(activeEventId)
        .then((data) => setCurrentEvent(data))
        .catch(() => setCurrentEvent(null));
    } else {
      setCurrentEvent(null);
    }
  }, [activeEventId]);

  // Is this the dedicated stage teleprompter? If so, hide the standard navbar for pure stage focus
  const isPrompterView = location.pathname.includes('/prompter');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {!isPrompterView && <Navbar currentEvent={currentEvent} />}
      <AnnouncementBanner />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<EventsListPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/events/:eventId/control" element={<OrganizerControlPage />} />
          <Route path="/events/:eventId/prompter" element={<AnchorPrompterPage />} />
          <Route path="/events/:eventId/speakers" element={<SpeakerDirectoryPage />} />
          <Route path="/events/:eventId/scripts" element={<AIScriptStudioPage />} />
        </Routes>
      </main>
    </div>
  );
}
