import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import { pcmToMp3, pcmToWav } from './server/audioHelper.ts';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  app.post('/api/generate-voice', async (req, res) => {
    try {
      const { text, character } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Please provide script text.' });
      }

      let charId:
        | 'news_anchor'
        | 'attitude_boy'
        | 'reviewer'
        | 'caster'
        | 'bounty'
        | 'mystery_teller'
        | 'nature_poet'
        | 'horror_thriller'
        | 'geopolitics_analyst'
        | 'village_food'
        | 'islamic_storyteller'
        | 'hype_streamer'
        | 'pro_analyst'
        | 'comic_roaster'
        | 'election_campaigner' = 'news_anchor';

      const validCharacters = [
        'news_anchor',
        'attitude_boy',
        'reviewer',
        'caster',
        'bounty',
        'mystery_teller',
        'nature_poet',
        'horror_thriller',
        'geopolitics_analyst',
        'village_food',
        'islamic_storyteller',
        'hype_streamer',
        'pro_analyst',
        'comic_roaster',
        'election_campaigner',
      ];

      if (validCharacters.includes(character)) {
        charId = character as typeof charId;
      }

      let promptInstruction = '';
      let voiceName = 'Fenrir';

      // 1. TV News Anchor (টিভি সংবাদ পাঠক - সময় টিভি, ৭১ টিভি, চ্যানেল ২৪ স্টাইল)
      if (charId === 'news_anchor') {
        voiceName = 'Fenrir';
        promptInstruction =
          `You are a top-tier, 35-year-old Bangladeshi professional male TV news presenter (টিভি সংবাদ উপস্থাপক ও নিউজরুম অ্যাঙ্কর) in leading Bangladeshi news television channels like Somoy TV, Ekattor TV, and Channel 24. Your voice is authoritative, crystal-clear, articulate, formal, and perfectly paced. You speak with neutral, standard Bangladeshi Bengali (প্রমিত বাংলা), delivering news headlines, breaking news, and official studio bulletins with professional gravity, steady breathing, sharp diction, and engaging broadcast modulation.\n\n` +
          `Read the following TV news bulletin script with complete professional news anchor authenticity:\n${text.trim()}`;
      } else if (charId === 'attitude_boy') {
        // 2. Attitude Boy (টিকটক ও রিলস ডায়লগ - খাঁটি ১৪ বছর বয়সী বাংলাদেশি কিশোরের কণ্ঠ, হালকা ভাঙা কচি গলার সুর, স্যাড ও অ্যাটিটিউড ডায়লগ)
        voiceName = 'Puck';
        promptInstruction =
          `You are an authentic, 14-year-old young Bangladeshi school-going teenage boy delivering viral emotional, heartbroken, yet fiercely confident attitude dialogues for TikTok, Facebook Reels, and YouTube Shorts (খাঁটি ১৪ বছর বয়সী বাংলাদেশি উঠতি কিশোর ছেলের কণ্ঠ).\n` +
          `- VOICE PITCH & AGE: Exactly 14 years old (কিশোর বয়স). The voice must sound noticeably youthful, lighter in pitch, fresh, and slightly soft-spoken like a real 14-year-old schoolboy—DO NOT sound like an adult man, DO NOT sound heavy or deep, NO heavy adult baritone.\n` +
          `- TONE & MOOD: Emotional, hurt, slightly broken young voice yet full of raw teen swag and attitude (কচি গলার হালকা আবেগ, বুকভাঙা কষ্ট কিন্তু আত্মবিশ্বাসী দৃঢ় ডায়লগ ডেলিভারি).\n` +
          `- PACING & CADENCE: Natural conversational rhythm with slight emotional pauses before punchlines (যেমন: "শোনো ভাই..." বা "এখন তুমি কাঁদো, আর আমি হাসি") so it resonates perfectly over viral background music.\n` +
          `- ACCENT & PRONUNCIATION: Authentic, relatable Bangladeshi teenage schoolboy colloquial Bengali (খাঁটি বাংলাদেশি ১৪ বছর বয়সী কিশোরদের স্বাভাবিক ও নিখুঁত বাচনভঙ্গি).\n\n` +
          `Deliver the following script in a genuine 14-year-old youthful teen boy's voice with emotional punch and attitude:\n${text.trim()}`;
      } else if (charId === 'reviewer') {
        voiceName = 'Puck';
        promptInstruction =
          `You are an energetic, trendy 22-year-old Bangladeshi young male voiceover artist doing short videos, TikTok, and Reels reviews for Free Fire & PUBG esports tournaments, gaming platforms, and esports apps. Speak in authentic Bangladeshi Bengali (বাংলা) accent. Keep the pace catchy, conversational, crisp, and engaging for social media video voiceover.\n\n` +
          `Read the following script naturally:\n${text.trim()}`;
      } else if (charId === 'caster') {
        voiceName = 'Fenrir';
        promptInstruction =
          `You are an official 25-year-old Bangladeshi male esports live tournament shoutcaster for Free Fire and PUBG tournament broadcasts. Speak loudly and with extreme hype and excitement, with fast-paced situational casting energy exactly like official live esports tournament broadcasts in Bangladesh!\n\n` +
          `Read the following live casting script with full tournament shoutcaster adrenaline:\n${text.trim()}`;
      } else if (charId === 'mystery_teller') {
        voiceName = 'Orus';
        promptInstruction =
          `You are the iconic male narrator of the famous Bangladeshi mystery and documentary channel "Mayajaal" (মায়াজাল). Your voice is deep, calm, mysterious, atmospheric, and full of gripping suspense. You speak with measured, deliberate pacing, pausing naturally before shocking revelations or mind-bending facts. You speak in standard, elegant Bangladeshi Bengali (বাংলা) with an intriguing storytelling cadence that instantly hooks listeners into unexplained mysteries, dark secrets, and ancient phenomena.\n\n` +
          `Narrate the following documentary script with classic Mayajaal mystery, suspense, and curiosity:\n${text.trim()}`;
      } else if (charId === 'nature_poet') {
        // Chitra Media (চিত্র মিডিয়া) real narrator: Slow, unhurried, gentle, zero hype, quiet pauses, contemplative rural Bengal observation
        voiceName = 'Charon';
        promptInstruction =
          `[CRITICAL PACE AND TONE DIRECTIVE]: You are the real, iconic middle-aged Bangladeshi male voice artist of the rural nature documentary channel "Chitra Media" (চিত্র মিডিয়া). \n` +
          `- PACE: VERY SLOW, relaxed, unhurried, and peaceful. Take deliberate, serene pauses between phrases (ধীরস্থির, থেমে থেমে, শান্ত ও মায়াবী উচ্চারণ).\n` +
          `- ENERGY & HYPE: ABSOLUTELY ZERO HYPE, NO LOUDNESS, NO EXCITEMENT, NO FAST TEMPO. Your voice must be deep, grounded, soft-spoken, tender, and contemplative—like an experienced rural man sitting peacefully beside a quiet river, watching birds, raindrops, ancient banyan trees, and village life.\n` +
          `- EMOTION: Heartfelt serenity, pure simplicity, deep affection for nature, gentle poetic cadence (গ্রামের মেঠোপথের মতো শান্ত ও হৃদয়স্পর্শী সুর).\n` +
          `- ACCENT & DICTION: Standard Bangladeshi Bengali (বাংলা) with warm, gentle, calm, and soothing pronunciation.\n\n` +
          `Narrate the following script slowly, softly, and peacefully with authentic Chitra Media calm storytelling cadence:\n${text.trim()}`;
      } else if (charId === 'horror_thriller') {
        voiceName = 'Charon';
        promptInstruction =
          `You are a master horror storyteller and dramatic narrator inspired by legendary radio thrillers like "Sunday Suspense" and Mir Afsar Ali. Your voice is a deep, ominous male voice, dark, intense, spine-chilling, and deeply theatrical. You whisper when building dreadful silence, shift pitch to evoke fear, and deliver ominous revelations with haunting gravity in clear, powerful Bengali (বাংলা). Every word should send shivers down the listener's spine.\n\n` +
          `Narrate the following horror thriller script with chilling theatrical suspense:\n${text.trim()}`;
      } else if (charId === 'geopolitics_analyst') {
        voiceName = 'Fenrir';
        promptInstruction =
          `You are an authoritative adult male international geopolitics, military defense, and strategic war affairs analyst in Bangladesh. Your tone is commanding, articulate, grave, highly intellectual, and decisive. You break down weapon systems, border conflicts, super-power diplomacy, and global intelligence with geopolitical gravity and crisp, articulate pronunciation in professional Bangladeshi Bengali (বাংলা).\n\n` +
          `Deliver the following strategic geopolitics and defense analysis with commanding authority and sharp precision:\n${text.trim()}`;
      } else if (charId === 'village_food') {
        voiceName = 'Puck';
        promptInstruction =
          `You are a friendly, warmhearted, and cheerful rural Bangladeshi male food and village lifestyle vlogger. Your voice is full of authentic hospitality, smiles, warmth, and down-to-earth folk charm. You speak with cheerful excitement about fresh catch from the river, clay-oven cooking, village monsoons, and green fields, welcoming the audience like close family in sweet, friendly Bangladeshi Bengali (বাংলা).\n\n` +
          `Share the following village food and lifestyle story with heartfelt hospitality, warmth, and joy:\n${text.trim()}`;
      } else if (charId === 'islamic_storyteller') {
        voiceName = 'Orus';
        promptInstruction =
          `You are a deeply revered, gentle, and reflective Bangladeshi male Islamic and spiritual storyteller. Your voice is exceptionally calm, noble, compassionate, and resonant with sincere spiritual emotion. You recount the noble lives of the Sahaba, historic Islamic events, moral teachings, and spiritual reflection in pure, heartfelt, and dignified Bangladeshi Bengali (বাংলা), creating a peaceful and spiritually uplifting experience.\n\n` +
          `Narrate the following Islamic and spiritual story with serenity, devotion, and profound grace:\n${text.trim()}`;
      } else if (charId === 'hype_streamer') {
        voiceName = 'Orus';
        promptInstruction =
          `You are Rafi, a wildly energetic and hilarious 21-year-old Bangladeshi male gaming live streamer playing Free Fire, PUBG Mobile, and GTA V. Your delivery is full of gamer hype, clutch adrenaline, sudden humorous exclamations, punchy tempo, and natural gamer emotion in Bangladeshi Bengali (বাংলা). Sound like an authentic top-tier live streamer reacting in real-time with supreme hype and excitement!\n\n` +
          `Deliver the following script with peak gamer hype, passion, and streamer flair:\n${text.trim()}`;
      } else if (charId === 'pro_analyst') {
        voiceName = 'Puck';
        promptInstruction =
          `You are Tanvir, a polished male tech specialist, gadget reviewer, and esports analyst in Bangladesh. Your tone is clear, articulate, trustworthy, polished, and confident. You explain tech features, gaming FPS benchmarks, and gameplay strategies in clean, articulate Bangladeshi Bengali (বাংলা) with professional pacing and crystal-clear diction.\n\n` +
          `Deliver the following tech analysis and tutorial script with clarity, confidence, and authority:\n${text.trim()}`;
      } else if (charId === 'comic_roaster') {
        voiceName = 'Zephyr';
        promptInstruction =
          `You are Shuvo, a sharp-witted, comedic Bangladeshi male meme reviewer, roaster, and content satirist. Your voice carries witty comedic timing, subtle sarcasm, playful mockery, and lively colloquial Bangladeshi expressions. You make humorous observations and punchlines hit with natural comedic charm and hilarious energy.\n\n` +
          `Deliver the following comedy and roasting script with funny timing, playful sarcasm, and charm:\n${text.trim()}`;
      } else if (charId === 'election_campaigner') {
        voiceName = 'Fenrir';
        promptInstruction =
          `You are an authentic, loud, and passionate Bangladeshi rural election loudspeaker campaign announcer (গ্রামের নির্বাচনী মাইকিং প্রচারক). You are announcing from a rickshaw or van with horn loudspeakers. Your delivery has the signature theatrical rhythm, repeating key slogans with dramatic pauses, praising the candidate with immense pride ("গরিবের বন্ধু, নয়নমণি"), asking for votes ("মূল্যবান ভোট দিয়ে জয়যুক্ত করুন"), and chanting rhyming election slogans with high energy in authentic rural Bangladeshi Bengali (বাংলা)!\n\n` +
          `Deliver the following election campaign announcement with full rural miking passion, loud projection, and theatrical cadence:\n${text.trim()}`;
      } else {
        voiceName = 'Charon';
        promptInstruction =
          `You are a deep-voiced, punchy, crisp, and commanding male voice artist inspired by ElevenLabs' iconic bounty punchy crisp style. You possess a thick, resonant low baritone voice with masterful dynamic emotional control, crisp articulate pronunciation, and powerful delivery in authentic Bengali (বাংলা). Every word and phrase should be delivered with rich depth, punch, clarity, and impactful emotional nuance.\n\n` +
          `Deliver the following script with deep voice, punchy crisp cadence, and controlled emotion:\n${text.trim()}`;
      }

      const ai = getAi();

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: promptInstruction }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const candidate = response.candidates?.[0];
      const audioPart = candidate?.content?.parts?.[0];
      const inlineData = audioPart?.inlineData;

      if (!inlineData || !inlineData.data) {
        throw new Error('ভয়েস অডিও তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }

      const rawBuffer = Buffer.from(inlineData.data, 'base64');
      const mimeType = inlineData.mimeType || 'audio/pcm;rate=24000';

      let sampleRate = 24000;
      const rateMatch = mimeType.match(/rate=(\d+)/i);
      if (rateMatch && rateMatch[1]) {
        sampleRate = parseInt(rateMatch[1], 10);
      }

      let audioBase64 = '';
      let returnMimeType = 'audio/mpeg';
      let format: 'mp3' | 'wav' = 'mp3';

      const isRawPcm =
        mimeType.includes('pcm') ||
        mimeType.includes('l16') ||
        mimeType.includes('raw') ||
        mimeType.startsWith('audio/l');

      if (isRawPcm) {
        const result = await pcmToMp3(rawBuffer, sampleRate, 1, 128);
        audioBase64 = result.buffer.toString('base64');
        returnMimeType = result.mimeType;
        format = result.format;
      } else if (mimeType.includes('wav')) {
        try {
          const result = await pcmToMp3(rawBuffer.subarray(44), sampleRate, 1, 128);
          audioBase64 = result.buffer.toString('base64');
          returnMimeType = result.mimeType;
          format = result.format;
        } catch {
          audioBase64 = rawBuffer.toString('base64');
          returnMimeType = 'audio/wav';
          format = 'wav';
        }
      } else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) {
        audioBase64 = rawBuffer.toString('base64');
        returnMimeType = 'audio/mpeg';
        format = 'mp3';
      } else {
        const result = await pcmToMp3(rawBuffer, sampleRate, 1, 128);
        audioBase64 = result.buffer.toString('base64');
        returnMimeType = result.mimeType;
        format = result.format;
      }

      return res.json({
        audioBase64,
        mimeType: returnMimeType,
        format,
        character: charId,
      });
    } catch (err: any) {
      console.error('TTS Generation error:', err);
      let userFriendlyMsg = 'Failed to generate voice. Please try again.';
      const rawMsg = err?.message || '';
      if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('Quota exceeded')) {
        userFriendlyMsg = 'API Quota limit reached. Please wait a few moments and try again.';
      } else if (rawMsg.includes('missing') || rawMsg.includes('API_KEY')) {
        userFriendlyMsg = 'Gemini API key is missing in environment variables.';
      }
      return res.status(500).json({ error: userFriendlyMsg });
    }
  });

  // Helper function to sanitize API keys from env or user input
  const cleanApiKey = (rawKey?: string): string => {
    if (!rawKey) return '';
    return rawKey.replace(/^["']|["']$/g, '').trim();
  };

  // Cartesia AI Sonic V3 Model TTS Endpoint
  app.post('/api/cartesia-generate', async (req, res) => {
    try {
      const { text, character, apiKey, voiceId, emotion, speed } = req.body;
      const cartesiaApiKey = cleanApiKey(apiKey || process.env.CARTESIA_API_KEY);

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Please provide script text.' });
      }

      if (!cartesiaApiKey) {
        return res.status(401).json({
          error: 'Cartesia API Key required. Please set CARTESIA_API_KEY in environment or input your key.',
          isApiKeyMissing: true,
        });
      }

      console.log(`[Cartesia TTS] Sending request with Key prefix: ${cartesiaApiKey.substring(0, 10)}...`);

      // Parse speed if specified
      let parsedSpeed: number | undefined = undefined;
      if (speed) {
        const val = parseFloat(String(speed).replace('x', ''));
        if (!isNaN(val) && val >= 0.6 && val <= 1.5) {
          parsedSpeed = val;
        }
      }

      // Default verified high-quality Bengali Cartesia voice IDs
      const cartesiaVoiceMap: Record<string, string> = {
        news_anchor: '2a465f1e-10bc-4c90-be83-0bc7499e3635', // Parvez (Bengali Male Authentic)
        attitude_boy: '2ba861ea-7cdc-43d1-8608-4045b5a41de5', // Rubel (Bengali Male Casual)
        reviewer: '2ba861ea-7cdc-43d1-8608-4045b5a41de5', // Rubel (Bengali Male Reviewer)
        nature_poet: '2a465f1e-10bc-4c90-be83-0bc7499e3635', // Parvez (Bengali Poetic & Storyteller)
        horror_thriller: '2ba861ea-7cdc-43d1-8608-4045b5a41de5', // Rubel (Suspense & Thriller)
        islamic_storyteller: '2a465f1e-10bc-4c90-be83-0bc7499e3635', // Parvez (Serene Narrator)
        female_anchor: '59ba7dee-8f9a-432f-a6c0-ffb33666b654', // Pooja (Bengali Female Soft & Clear)
      };

      // Ensure we don't use old non-existent dummy UUIDs
      const invalidOldUuids = [
        'a0e168f2-dd7b-4a1e-9924-2222370707a9',
        '694718d0-0171-4158-b1c0-14b0e37f0e9f',
        '82900ec4-033c-457b-8018-05230820db51',
        'fb9e0721-e374-42f8-9a67-d815779c16e7',
      ];

      // Validate UUID format
      const isValidUuid = typeof voiceId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(voiceId.trim());

      let targetVoiceId = voiceId;
      if (!targetVoiceId || !isValidUuid || invalidOldUuids.includes(targetVoiceId)) {
        targetVoiceId = cartesiaVoiceMap[character] || '2a465f1e-10bc-4c90-be83-0bc7499e3635';
      }

      let response = await fetch('https://api.cartesia.ai/tts/bytes', {
        method: 'POST',
        headers: {
          'X-API-Key': cartesiaApiKey,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: 'sonic-3.6',
          transcript: text.trim(),
          voice: {
            mode: 'id',
            id: targetVoiceId,
          },
          output_format: {
            container: 'wav',
            encoding: 'pcm_s16le',
            sample_rate: 44100,
          },
          language: 'bn',
          ...(parsedSpeed ? { generation_config: { speed: parsedSpeed } } : {}),
          ...(emotion ? { emotion } : {}),
        }),
      });

      if (!response.ok) {
        const firstErrText = await response.clone().text();
        console.warn(`[Cartesia] Primary sonic-3.6 attempt failed (${response.status}): ${firstErrText}. Attempting fallback...`);

        // If voice not found (404/400) or invalid voice error, fallback to verified Bengali default voice
        if (response.status === 404 || response.status === 400 || firstErrText.includes('Voice not found') || firstErrText.toLowerCase().includes('voice')) {
          console.warn(`[Cartesia] Voice error for ${targetVoiceId}, falling back to verified Bengali voice 2a465f1e-10bc-4c90-be83-0bc7499e3635...`);
          targetVoiceId = '2a465f1e-10bc-4c90-be83-0bc7499e3635';
        }

        const fallbackResponse = await fetch('https://api.cartesia.ai/tts/bytes', {
          method: 'POST',
          headers: {
            'X-API-Key': cartesiaApiKey,
            'Cartesia-Version': '2024-06-10',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model_id: 'sonic-3.6',
            transcript: text.trim(),
            voice: {
              mode: 'id',
              id: targetVoiceId,
            },
            output_format: {
              container: 'wav',
              encoding: 'pcm_s16le',
              sample_rate: 44100,
            },
            language: 'bn',
            ...(parsedSpeed ? { generation_config: { speed: parsedSpeed } } : {}),
            ...(emotion ? { emotion } : {}),
          }),
        });

        if (fallbackResponse.ok) {
          response = fallbackResponse;
        }
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error('Cartesia API error response:', response.status, errText);
        let msg = 'Failed to generate voice via Cartesia AI.';
        if (response.status === 401) {
          msg = 'Invalid or missing Cartesia API Key. Please provide a valid Cartesia API Key.';
          return res.status(401).json({ error: msg, isApiKeyMissing: true });
        } else if (response.status === 429) {
          msg = 'Cartesia API rate limit or quota exceeded.';
        }
        return res.status(response.status).json({ error: msg });
      }

      const audioArrayBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');

      return res.json({
        audioBase64,
        mimeType: 'audio/wav',
        format: 'wav',
        character,
        engine: 'Cartesia AI Sonic (V3)',
      });
    } catch (err: any) {
      console.error('Cartesia generation server error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to generate voice via Cartesia AI' });
    }
  });

  // Cartesia AI Voice Cloning Endpoint
  app.post('/api/cartesia-clone-voice', async (req, res) => {
    try {
      const { name, description, audioBase64, mimeType, apiKey } = req.body;
      const cartesiaApiKey = cleanApiKey(apiKey || process.env.CARTESIA_API_KEY);

      if (!audioBase64) {
        return res.status(400).json({ error: 'Audio sample is required for voice cloning.' });
      }

      if (!cartesiaApiKey) {
        return res.status(401).json({
          error: 'Cartesia API Key is required for voice cloning. Please set your Cartesia API Key in settings or environment variables.',
          isApiKeyMissing: true,
        });
      }

      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const voiceName = name?.trim() || `Cloned Voice ${Date.now()}`;
      const voiceDesc = description?.trim() || 'Custom cloned voice from PlayVear AI';

      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: mimeType || 'audio/wav' });
      formData.append('clip', audioBlob, 'sample.wav');
      formData.append('name', voiceName);
      formData.append('description', voiceDesc);
      formData.append('language', 'bn');

      let response = await fetch('https://api.cartesia.ai/voices/clone', {
        method: 'POST',
        headers: {
          'X-API-Key': cartesiaApiKey,
          'Cartesia-Version': '2024-06-10',
        },
        body: formData,
      });

      if (!response.ok) {
        const firstErr = await response.clone().text();
        console.warn('First clone attempt status:', response.status, firstErr);
        
        // Retry with /voices/clone/clip or /voices
        const altResponse = await fetch('https://api.cartesia.ai/voices/clone/clip', {
          method: 'POST',
          headers: {
            'X-API-Key': cartesiaApiKey,
            'Cartesia-Version': '2024-06-10',
          },
          body: formData,
        });

        if (altResponse.ok) {
          response = altResponse;
        } else {
          const altResponse2 = await fetch('https://api.cartesia.ai/voices', {
            method: 'POST',
            headers: {
              'X-API-Key': cartesiaApiKey,
              'Cartesia-Version': '2024-06-10',
            },
            body: formData,
          });
          if (altResponse2.ok) {
            response = altResponse2;
          }
        }
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error('Cartesia Voice Clone API error:', response.status, errText);
        let msg = 'Failed to clone voice via Cartesia AI.';
        if (response.status === 401) {
          msg = 'Invalid or missing Cartesia API Key. Please verify your API key.';
          return res.status(401).json({ error: msg, isApiKeyMissing: true });
        } else if (response.status === 402 || errText.includes('free tier') || errText.includes('subscription')) {
          msg = 'Cartesia Free Tier-এ অডিও ফাইল থেকে সরাসরি API দিয়ে ভয়েস ক্লোন করার সুবিধাটি বন্ধ রয়েছে (Paid tier required)। তবে আপনি কোনো সাবস্ক্রিপশন ছাড়াই "ক্যারেক্টার বিল্ডার" দিয়ে আপনার বর্ণনা ও স্পিড অনুযায়ী আনলিমিটেড ক্যারেক্টার তৈরি করতে পারেন।';
          return res.status(402).json({
            error: msg,
            isTierRestricted: true,
            tierDetails: 'Cartesia requires a paid subscription tier to use the instant voice clone API endpoint.'
          });
        } else if (response.status === 400 || response.status === 422) {
          msg = 'Audio sample too short or invalid audio format (minimum 5-10 seconds recommended).';
        }
        return res.status(response.status).json({ error: msg });
      }

      const resData = await response.json();
      return res.json({
        success: true,
        id: resData.id,
        name: resData.name || voiceName,
        description: resData.description || voiceDesc,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Cartesia clone server error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to process voice cloning.' });
    }
  });

  // Cartesia List Voices Endpoint
  app.get('/api/cartesia-voices', async (req, res) => {
    try {
      const apiKey = cleanApiKey(req.query.apiKey as string || process.env.CARTESIA_API_KEY);
      if (!apiKey) {
        return res.status(401).json({ error: 'Cartesia API Key required', isApiKeyMissing: true });
      }

      const response = await fetch('https://api.cartesia.ai/voices', {
        headers: {
          'X-API-Key': apiKey,
          'Cartesia-Version': '2024-06-10',
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: errText });
      }

      const data = await response.json();
      return res.json({ voices: data });
    } catch (err: any) {
      console.error('Cartesia list voices error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to list voices.' });
    }
  });

  // Background music audio proxy endpoint to eliminate CORS, 403, and mobile streaming issues
  app.get('/api/bgm-stream', async (req, res) => {
    try {
      const audioUrl = req.query.url;
      if (!audioUrl || typeof audioUrl !== 'string') {
        return res.status(400).send('Audio URL parameter is required');
      }

      const parsed = new URL(audioUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).send('Invalid audio URL protocol');
      }

      const isDownload = req.query.download === '1';
      const filename = (typeof req.query.filename === 'string' && req.query.filename) 
        ? req.query.filename 
        : 'background_music.mp3';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(audioUrl, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'audio/*,*/*;q=0.9',
          'Referer': parsed.origin,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(response.status).send(`Upstream audio error: ${response.statusText}`);
      }

      res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=86400');

      if (isDownload) {
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('BGM proxy warning:', err?.message || err);
      }
      res.status(500).send('Failed to stream audio');
    }
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
