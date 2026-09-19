const API_SERVER = import.meta.env.VITE_API_URL || '';
const BASE_URL = API_SERVER ? `${API_SERVER}/api` : '/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Events
  getEvents: () => request('/events'),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  // Speakers
  getSpeakers: (eventId) => request(`/speakers${eventId ? `?eventId=${eventId}` : ''}`),
  getSpeaker: (id) => request(`/speakers/${id}`),
  createSpeaker: (data) => request('/speakers', { method: 'POST', body: JSON.stringify(data) }),
  updateSpeaker: (id, data) => request(`/speakers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSpeaker: (id) => request(`/speakers/${id}`, { method: 'DELETE' }),

  // Sessions
  getSessions: (eventId) => request(`/sessions?eventId=${eventId}`),
  createSession: (data) => request('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  updateSession: (id, data) => request(`/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSession: (id) => request(`/sessions/${id}`, { method: 'DELETE' }),
  updateSessionStatus: (id, status) => request(`/sessions/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  delaySession: (id, addedMinutes, reason) => request(`/sessions/${id}/delay`, {
    method: 'POST',
    body: JSON.stringify({ addedMinutes, reason })
  }),

  // AI Scripts
  generateScript: (payload) => request('/scripts/generate', { method: 'POST', body: JSON.stringify(payload) }),
  saveScriptToSession: (sessionId, script, anchorNotes) => request('/scripts/save-to-session', {
    method: 'POST',
    body: JSON.stringify({ sessionId, script, anchorNotes })
  }),

  // Announcements
  getAnnouncements: (eventId) => request(`/announcements?eventId=${eventId}`),
  broadcastAnnouncement: (data) => request('/announcements/broadcast', { method: 'POST', body: JSON.stringify(data) }),
  acknowledgeAnnouncement: (id) => request(`/announcements/${id}/ack`, { method: 'POST' })
};
