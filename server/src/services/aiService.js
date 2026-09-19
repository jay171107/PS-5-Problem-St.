/**
 * AI Script & Announcement Generation Service
 * Supports Google Gemini API, OpenAI API, and intelligent contextual fallback engine.
 */

// Contextual Fallback Generators (High quality, zero API key required)
function generateContextualFallback(type, params) {
  const tone = params.tone || 'Professional & Engaging';
  const eventName = params.eventName || 'this premier conference';
  const speakerName = params.speakerName || 'our distinguished speaker';
  const designation = params.designation || 'Leader & Pioneer';
  const organization = params.organization || 'Industry Leaders';
  const topic = params.topic || 'the frontiers of innovation';
  const bio = params.bio || '';
  const pronunciation = params.pronunciation ? `(pronounced: ${params.pronunciation})` : '';
  const prevSessionTitle = params.prevSessionTitle || 'our previous session';
  const nextSessionTitle = params.nextSessionTitle || 'our upcoming session';

  switch (type) {
    case 'welcome':
      return {
        script: `Good morning, distinguished guests, industry luminaries, and fellow innovators! Welcome to ${eventName}.\n\n` +
          `Today, we stand at the crossroads of breakthrough ideas and transformative execution. Over the course of this agenda, you will witness inspiring keynotes, deep-dive discussions, and unmatched networking opportunities designed to spark change.\n\n` +
          `My name is ${params.anchorName || 'your host'}, and I am honored to guide you through today's journey. Turn your badges forward, put your devices on vibrate, and join me in igniting the stage with energy and anticipation. Let the sessions begin!`,
        notes: `Deliver with high energy and an inviting smile. Pause for applause after welcoming delegates. Remind attendees about event hashtag and Wi-Fi credentials.`
      };

    case 'speaker_intro':
      return {
        script: `Ladies and gentlemen, it is now my distinct privilege to introduce our next keynote speaker.\n\n` +
          `Serving as ${designation} at ${organization}, ${speakerName} ${pronunciation} has consistently pushed boundaries in ${topic}.\n\n` +
          `${bio ? `With a distinguished background where they have ${bio}, ` : ''}` +
          `their insights today will challenge our preconceptions and chart the roadmap for tomorrow.\n\n` +
          `Please join me with a warm, thunderous round of applause as we welcome to the stage — ${speakerName}!`,
        notes: `Maintain eye contact with the audience, then gesture warmly to stage right as ${speakerName} enters. Hold applause until the speaker reaches the podium.`
      };

    case 'transition':
      return {
        script: `Thank you so much to our previous presenter for that thought-provoking exploration into ${prevSessionTitle}. Let's give them one more warm round of applause!\n\n` +
          `As we carry those insights forward, we pivot now toward our next high-impact segment: "${nextSessionTitle}".\n\n` +
          `This session builds directly upon what we just heard, taking theory into actionable practice. Let us transition right into ${nextSessionTitle}!`,
        notes: `Allow 15-20 seconds for stage reset / microphone handover. Keep audience engaged with a recap takeaway.`
      };

    case 'closing':
      return {
        script: `Distinguished guests, what an exhilarating, insight-rich day this has been at ${eventName}!\n\n` +
          `From boundary-pushing keynotes to spirited hallway conversations, each moment has underscored the power of community and collaborative vision.\n\n` +
          `On behalf of the organizing committee, our generous partners, and production team, we extend our deepest gratitude to our speakers for their wisdom, and to each of you for your curiosity and vibrant participation.\n\n` +
          `Please ensure you collect all personal belongings, stay connected through our community portal, and have a safe journey back. Thank you, and good evening!`,
        notes: `Invite organizers and key committee leads to the stage for a closing curtain call and commemorative group photo.`
      };

    case 'announcement':
      const reason = params.reason || params.message || 'schedule update';
      return {
        script: `Ladies and gentlemen, may I briefly have your attention for an important announcement.\n\n` +
          `${formatAnnouncementMessage(reason)}\n\n` +
          `We appreciate your gracious cooperation and patience as our production team ensures everything runs seamlessly. Thank you!`,
        notes: `Speak clearly with an audible, calm, and reassuring tone. Repeat key details (e.g. time or hall location) twice.`
      };

    default:
      return {
        script: `Distinguished attendees, welcome back as we continue with our scheduled agenda for ${eventName}.`,
        notes: `Standard emcee bridge.`
      };
  }
}

function formatAnnouncementMessage(reason) {
  const r = reason.toLowerCase();
  if (r.includes('10') || r.includes('ten')) {
    return `Please note that our upcoming session will commence in approximately 10 minutes. Feel free to grab refreshments and return to your seats shortly.`;
  }
  if (r.includes('delay') || r.includes('schedule') || r.includes('change')) {
    return `There has been a slight adjustment to today's schedule. Our agenda timings have been updated in real-time on the main monitors.`;
  }
  if (r.includes('seat') || r.includes('seated')) {
    return `We kindly request all delegates and guests to make their way to their seats so we can proceed smoothly with our program.`;
  }
  if (r.includes('lunch') || r.includes('food') || r.includes('refreshment')) {
    return `Lunch and refreshments are now being served in the dining hall. Please enjoy and we will reconvene following the meal.`;
  }
  return reason;
}

// Call Google Gemini API
async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned by Gemini');
  return text;
}

// Call OpenAI API
async function callOpenAI(apiKey, prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an elite live event emcee and scriptwriter.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

export async function generateScript(type, params) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const promptConstructors = {
    welcome: `Write a captivating opening emcee script for an event called "${params.eventName || 'Grand Conference'}" with the theme "${params.theme || 'Innovation'}".
Anchor Name: ${params.anchorName || 'Emcee'}
Tone: ${params.tone || 'Energetic, professional, welcoming'}
Audience: ${params.audience || 'Industry executives, innovators, and delegates'}
Include:
1. Warm welcome hook
2. Theme context & what to expect
3. Housekeeping tip (badges, phones on silent)
4. Energetic kickoff transition
Format with exact spoken words and add a short section titled "ANCHOR NOTES: [bullet points]".`,

    speaker_intro: `Write an emcee introduction script for the following speaker:
Name: ${params.speakerName} ${params.pronunciation ? `(Pronounced: ${params.pronunciation})` : ''}
Designation: ${params.designation}
Organization: ${params.organization}
Speech Topic: ${params.topic}
Bio/Achievements: ${params.bio || 'Not specified'}
Tone: ${params.tone || 'Prestigious, engaging, crisp (60-90 seconds speak time)'}
Include:
1. Hook connecting audience to the topic
2. Speaker's title, organization, and key breakthrough/achievement
3. Pronunciation-friendly, rousing final call to the stage
Format with exact spoken words and add "ANCHOR NOTES: [stage cue instructions]".`,

    transition: `Write a smooth 30-45 second emcee transition script between two agenda sessions:
Concluded Session: "${params.prevSessionTitle}"
Next Session: "${params.nextSessionTitle}"
Speaker for Next Session: "${params.nextSpeakerName || 'our next speaker'}"
Tone: ${params.tone || 'Seamless, upbeat, engaging'}
Include:
1. Quick one-line acknowledgement & applause for concluded session
2. Bridge connecting the theme to the next session
3. Exciting invitation to welcome the next presenter
Format with exact spoken words and "ANCHOR NOTES: [stage cues]".`,

    closing: `Write a heartfelt and memorable closing emcee script for "${params.eventName || 'Annual Summit'}".
Tone: ${params.tone || 'Inspiring, grateful, celebratory'}
Anchor Name: ${params.anchorName || 'Emcee'}
Include:
1. Recap of the day's energy and highlights
2. Heartfelt vote of thanks to speakers, organizing committee, audiovisual crew, and attendees
3. Call to action / staying connected
4. Final sign-off
Format with exact spoken words and "ANCHOR NOTES: [photo / wrap cues]".`,

    announcement: `Write a crisp, clear, authoritative emcee live stage announcement for an unexpected situation:
Reason / Message: "${params.message || params.reason}"
Priority: ${params.priority || 'Urgent'}
Tone: Polite, calm, reassuring, and clear.
Include:
1. Attention-grabber ("Ladies and gentlemen, a brief announcement...")
2. The exact instruction or schedule update
3. Appreciation for patience
Keep it within 3-4 sentences so the anchor can read it immediately on stage.`
  };

  const prompt = promptConstructors[type] || `Write an emcee script for: ${JSON.stringify(params)}`;

  // Try Gemini first if key is present
  if (geminiKey && geminiKey.trim() !== '') {
    try {
      console.log('🤖 Calling Gemini API for script generation...');
      const responseText = await callGemini(geminiKey, prompt);
      const parsed = parseScriptAndNotes(responseText);
      return { ...parsed, provider: 'gemini' };
    } catch (err) {
      console.warn('⚠️ Gemini call failed, falling back to smart contextual template:', err.message);
    }
  }

  // Try OpenAI if present
  if (openaiKey && openaiKey.trim() !== '') {
    try {
      console.log('🤖 Calling OpenAI API for script generation...');
      const responseText = await callOpenAI(openaiKey, prompt);
      const parsed = parseScriptAndNotes(responseText);
      return { ...parsed, provider: 'openai' };
    } catch (err) {
      console.warn('⚠️ OpenAI call failed, falling back to smart contextual template:', err.message);
    }
  }

  // Fallback to high-quality contextual generator
  const result = generateContextualFallback(type, params);
  return { ...result, provider: 'contextual_fallback' };
}

function parseScriptAndNotes(rawText) {
  if (!rawText) return { script: '', notes: '' };

  const notesMarker = /(?:ANCHOR NOTES|PRODUCTION NOTES|STAGE NOTES):?\s*/i;
  const match = rawText.match(notesMarker);

  if (match) {
    const splitIndex = match.index;
    const scriptPart = rawText.slice(0, splitIndex).trim();
    const notesPart = rawText.slice(splitIndex + match[0].length).trim();
    return { script: scriptPart, notes: notesPart };
  }

  return { script: rawText.trim(), notes: 'Deliver with confident stage presence.' };
}
