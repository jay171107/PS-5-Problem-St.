# EventFlow AI 🎙️⚡
### Emcee Copilot & Dynamic Real-Time Agenda Management Platform

EventFlow AI is a full-stack solution built for live stage emcees/anchors and event organizers. It bridges the gap between chaotic backstage schedule shifts and on-stage emcee delivery through instant Socket.IO synchronization, AI script generation, dynamic schedule ripple recalculation, and a dedicated high-contrast teleprompter.

---

## 🌟 Key Features Implemented

### 1. 📅 Event & Agenda Management
- **Create & Manage Events**: Set event name, theme, date, starting time, venue, and anchor credentials.
- **Manage Activities & Sessions**: Add keynotes, panels, breaks, workshops, live performances, and closing ceremonies with precise time allotments.
- **Dynamic Schedule Updates**: Adjust any session's timing or status in real-time.

### 2. 🎤 Speaker & Guest Management
- **Speaker Directory**: Track name, designation, organization, topic, full bio, and social handles.
- **Phonetic Pronunciation Guide**: Displays clear phonetic cues (e.g., `eh-LEH-nah ross-TOH-vah`) on the anchor's screen before they introduce guests.
- **Anchor Cheat-Sheet**: Bullet-pointed accomplishments and talking points visible right alongside the teleprompter.

### 3. 🤖 AI Script Studio
- **Opening / Welcome Script**: Energetic, captivating intros based on event theme and tone.
- **Speaker Introductions**: Custom 60–90 second speeches incorporating the guest's bio, achievements, and topic hook.
- **Dynamic Transitions**: Seamless bridges acknowledging the concluded session and teasing the next.
- **Closing & Vote of Thanks**: Heartfelt gratitude to organizers, sponsors, and attendees with wrap cues.
- **Direct Save to Teleprompter**: 1-click push of any generated script directly into the live teleprompter session cue.
- **Multi-Engine Support**: Supports **Google Gemini API** (`GEMINI_API_KEY`), **OpenAI API** (`OPENAI_API_KEY`), and an intelligent **built-in contextual generator** that works 100% offline out-of-the-box!

### 4. ⏱️ Dynamic Schedule Ripple
- When a speaker runs over time or an activity is delayed, click **+2m, +5m, +10m, +15m** or a custom duration:
  - The current activity is extended.
  - **All upcoming sessions automatically shift forward** in chronological sequence.
  - An automatic schedule adjustment alert is broadcast to all connected anchor devices via Socket.IO in under 50ms!

### 5. 📺 Live Emcee Teleprompter (Anchor Stage View)
- **High-Contrast Stage Dark Mode**: Designed for stage lighting, tablets, iPads, and podium screens.
- **Live Countdown Clock**: Shows elapsed and remaining time with overtime warnings.
- **Teleprompter Controls**: Adjustable font size (`A-` / `A+`), auto-scroll (`1x`, `2x`, `3x`, `4x`), and stage cues.
- **Speaker Quick-Card**: Talking points, topic, and pronunciation guide right next to the prompter text.
- **Up Next Advance Preview**: Advance warning of what is coming up next in queue.

### 6. 📢 Unexpected Emergency Announcements
- 1-Click stage presets:
  - *“The next session will begin in 10 minutes.”*
  - *“There has been a slight change in today's schedule.”*
  - *“We request everyone to remain seated.”*
  - *“Lunch and refreshments are now served in the dining atrium.”*
  - *“Brief 5-minute technical interlude.”*
- **AI Announcement Polisher**: Enter a quick note (e.g. *“Lost keys found at entrance”*) and AI generates a polished 3-sentence stage-ready anchor announcement.
- **Full-Screen Flash Banner**: Triggers an animated alert overlay with an audio chime directly on the anchor's stage screen with exact words to speak into the microphone.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, React Router 6, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose, UUID, Dotenv |
| **Database** | Dual Mode: MongoDB (via Mongoose) with automatic zero-setup persistent JSON fallback (`server/data/store.json`) |
| **AI Engine** | Google Gemini API / OpenAI API / Built-in Contextual Offline Engine |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) and npm.

### 1. Start the Backend Server
```bash
cd server
npm install
npm start
```
> The server will start on `http://localhost:5000`. It automatically seeds a realistic conference (**TechInnovate Global Summit 2026**) with 6 sessions and 3 featured keynote speakers!

### 2. Start the Frontend Client
In a second terminal:
```bash
cd client
npm install
npm run dev
```
> The client will start on `http://localhost:5173`.

---

## 🧪 Interactive Testing & Demo Walkthrough

1. Open `http://localhost:5173` in your browser.
2. Click on the pre-loaded **TechInnovate Global Summit 2026** event.
3. Open two browser windows side-by-side:
   - **Window 1 (Organizer Cockpit)**: Navigate to `Control Center` (`/events/event-techinnovate-2026/control`).
   - **Window 2 (Anchor Teleprompter)**: Click `Anchor Stage View` (`/events/event-techinnovate-2026/prompter`).
4. **Test Dynamic Schedule Ripple**:
   - In Window 1, click `+5m` or `+10m` under Quick Schedule Ripple.
   - Watch Window 2 (the Anchor Teleprompter) instantly update the target end time and shift upcoming session timings without refreshing!
5. **Test Emergency Announcement**:
   - In Window 1, click **Emergency Announcement** and select *"The next session will begin in 10 minutes."*
   - Click **Broadcast Live Now**.
   - Notice Window 2 immediately flashes with a full-screen high-contrast alert, plays an audio chime, and presents the exact spoken cue for the anchor!
6. **Test AI Script Studio**:
   - Navigate to `AI Script Studio` (`/events/event-techinnovate-2026/scripts`).
   - Select **Speaker Introduction**, choose **Dr. Elena Rostova**, and click **Generate Stage Script**.
   - Click **Save to Prompter** to assign the script live to Session #2!

---

## ⚙️ Environment Variables (Optional)

In `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Optional: MongoDB URI (if omitted, seamlessly uses server/data/store.json)
MONGODB_URI=

# Optional: Google Gemini API Key for enhanced AI script generations
GEMINI_API_KEY=

# Optional: OpenAI API Key
OPENAI_API_KEY=
```
