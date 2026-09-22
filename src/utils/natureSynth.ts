/**
 * Web Audio Procedural Nature & Folk Sound Generator
 * Generates authentic rural Bangladeshi soundscapes:
 * - Bamboo Flute (মেঠো বাঁশি)
 * - Birds Chirping (পাখির কিচিরমিচির ও কোকিলের ডাক)
 * - Village Rain & Tin Roof (গ্রামে ঝুম বৃষ্টি)
 * - Paddy Field Wind (বাতাস ও পাতায় শব্দ)
 * - Riverside Water (নদীর ঢেউ ও পানির শব্দ)
 * - Night Crickets (ঝিঁঝিঁ পোকার ডাক)
 */

export async function generateNatureSoundBlob(trackId: string, durationSec = 120): Promise<Blob> {
  const sampleRate = 44100;
  const totalFrames = sampleRate * durationSec;
  const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);

  // Determine synthesis parameters based on track ID
  switch (trackId) {
    case 'nat_1': // মেঠো বাঁশির সুর ও পশুপাখির ডাক
      buildFluteAndBirdsSoundscape(offlineCtx, durationSec, { flute: true, birds: true, wind: true });
      break;
    case 'nat_2': // গ্রামের টিপ টিপ বৃষ্টি ও মাটির গন্ধ
      buildRainAndThunderSoundscape(offlineCtx, durationSec, { rainIntensity: 'medium', wind: true });
      break;
    case 'nat_3': // মেঠো পথের শিস ও চপল বাতাস
      buildWhistleAndBreezeSoundscape(offlineCtx, durationSec);
      break;
    case 'nat_4': // ভোরের দোয়েল-কোয়েলের ডাক ও শিউলি বাতাস
      buildDawnChorusSoundscape(offlineCtx, durationSec);
      break;
    case 'nat_5': // সবুজ ধানক্ষেত, বাতাসের দোলা ও পাখির গান
      buildPaddyFieldAndCuckooSoundscape(offlineCtx, durationSec);
      break;
    case 'nat_6': // গাছের পাতার মরমর শব্দ ও ঝিরিঝিরি বাতাস
      buildLeavesAndWindSoundscape(offlineCtx, durationSec);
      break;
    case 'nat_7': // নদী পারের পালতোলা নৌকা ও পাখির কলকাকলি
      buildRiverAndFluteSoundscape(offlineCtx, durationSec);
      break;
    case 'nat_8': // গ্রামের গোধূলি সন্ধ্যা ও ঝিঁঝিঁ পোকার ডাক
      buildCricketsAndTwilightSoundscape(offlineCtx, durationSec);
      break;
    case 'nat_9': // কদম ফুলের গন্ধ, ঝুম বৃষ্টি ও বাউল সুর
      buildMonsoonRainAndFolkFluteSoundscape(offlineCtx, durationSec);
      break;
    case 'nat_10': // কাঁচা মেঠো পথ, বাঁশঝাড়ের বাতাস ও পাখির বাসা
      buildBambooWindAndBirdsSoundscape(offlineCtx, durationSec);
      break;
    default:
      buildFluteAndBirdsSoundscape(offlineCtx, durationSec, { flute: true, birds: true, wind: true });
      break;
  }

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavBlob(renderedBuffer);
}

// ==================== SYNTHESIS BUILDING BLOCKS ====================

/**
 * 1. Bamboo Flute Synthesizer (মেঠো বাঁশি)
 * Synthesizes a pentatonic Bengali folk melody using sine/triangle oscillators with breath noise & vibrato
 */
function addBambooFluteMelody(
  ctx: OfflineAudioContext,
  startTime: number,
  duration: number,
  masterGain: GainNode
) {
  // Bengali Folk Pentatonic Scale (Bhupali / Folk Frequencies in Hz)
  // C4, D4, E4, G4, A4, C5, D5, E5
  const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

  let currentTime = startTime;
  const noteDurations = [1.2, 0.8, 1.5, 2.0, 1.0, 2.5, 1.8];

  while (currentTime < startTime + duration - 2) {
    const noteFreq = scale[Math.floor(Math.random() * scale.length)];
    const noteLen = noteDurations[Math.floor(Math.random() * noteDurations.length)];

    // Flute Tone Oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq, currentTime);

    // Overtone Oscillator (for wooden resonance)
    const overtone = ctx.createOscillator();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(noteFreq * 2, currentTime);

    // Vibrato (5Hz pitch modulation)
    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 5.2;
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.value = noteFreq * 0.018; // Subtle vibrato
    vibrato.connect(osc.frequency);
    vibrato.connect(overtone.frequency);

    // Flute Envelope (Soft attack, gentle decay)
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.001, currentTime);
    noteGain.gain.linearRampToValueAtTime(0.22, currentTime + 0.18); // Soft attack
    noteGain.gain.setValueAtTime(0.22, currentTime + noteLen - 0.25);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, currentTime + noteLen);

    // Breath Noise (Air blowing sound)
    const noiseBuffer = createWhiteNoiseBuffer(ctx, noteLen);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = noteFreq * 1.5;
    noiseFilter.Q.value = 3.0;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.015, currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.035, currentTime + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + noteLen);

    // Connect Flute
    osc.connect(noteGain);
    overtone.connect(noteGain);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(noteGain);

    noteGain.connect(masterGain);

    vibrato.start(currentTime);
    osc.start(currentTime);
    overtone.start(currentTime);
    noiseSource.start(currentTime);

    vibrato.stop(currentTime + noteLen);
    osc.stop(currentTime + noteLen);
    overtone.stop(currentTime + noteLen);
    noiseSource.stop(currentTime + noteLen);

    currentTime += noteLen + (Math.random() * 0.8 + 0.3); // Pause between notes
  }
}

/**
 * 2. Birds Chirping Synthesizer (পাখির কলকাকলি)
 * Synthesizes natural bird chirps with randomized pitch sweeps & pauses
 */
function addBirdsChirping(
  ctx: OfflineAudioContext,
  durationSec: number,
  masterGain: GainNode,
  density: 'light' | 'medium' | 'dense' = 'medium'
) {
  const numChirps = density === 'light' ? 25 : density === 'medium' ? 45 : 70;

  for (let i = 0; i < numChirps; i++) {
    const time = Math.random() * (durationSec - 3);
    const startFreq = 2200 + Math.random() * 2000; // 2.2kHz - 4.2kHz
    const chirpDuration = 0.08 + Math.random() * 0.15;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(startFreq * (1.2 + Math.random() * 0.5), time + chirpDuration * 0.5);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.8, time + chirpDuration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.06, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + chirpDuration);

    // Stereo Panning for spatial realism
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.value = (Math.random() - 0.5) * 1.8;
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(masterGain);
    } else {
      osc.connect(gain);
      gain.connect(masterGain);
    }

    osc.start(time);
    osc.stop(time + chirpDuration);
  }
}

/**
 * 3. Cuckoo Bird (কোকিল) Call Synthesizer
 * Synthesizes the signature "coo-oo" call of rural Bengal
 */
function addCuckooBirdCalls(ctx: OfflineAudioContext, durationSec: number, masterGain: GainNode) {
  let time = 3.0;
  while (time < durationSec - 5) {
    const callStart = time;
    const baseFreq = 520 + Math.random() * 40; // ~520Hz

    // "Coo" note 1
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, callStart);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, callStart + 0.35);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.001, callStart);
    gain1.gain.linearRampToValueAtTime(0.12, callStart + 0.08);
    gain1.gain.exponentialRampToValueAtTime(0.001, callStart + 0.38);

    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(callStart);
    osc1.stop(callStart + 0.4);

    // "Oo" note 2 (higher pitch)
    const call2Start = callStart + 0.22;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 1.25, call2Start);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, call2Start + 0.45);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.001, call2Start);
    gain2.gain.linearRampToValueAtTime(0.15, call2Start + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, call2Start + 0.5);

    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(call2Start);
    osc2.stop(call2Start + 0.52);

    time += 8.0 + Math.random() * 12.0; // Repeat every 8-20 seconds
  }
}

/**
 * 4. Rain & Wind Generator (গ্রামে ঝুম বৃষ্টি ও বাতাস)
 */
function addRainSound(
  ctx: OfflineAudioContext,
  durationSec: number,
  masterGain: GainNode,
  intensity: 'light' | 'medium' | 'heavy' = 'medium'
) {
  const noiseBuffer = createPinkNoiseBuffer(ctx, durationSec);
  const rainSource = ctx.createBufferSource();
  rainSource.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = intensity === 'light' ? 800 : intensity === 'medium' ? 1400 : 2200;

  const gain = ctx.createGain();
  gain.gain.value = intensity === 'light' ? 0.08 : intensity === 'medium' ? 0.16 : 0.28;

  rainSource.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  rainSource.start(0);

  // Individual Raindrop Impact Clicks
  const clickCount = intensity === 'light' ? 80 : intensity === 'medium' ? 180 : 350;
  for (let i = 0; i < clickCount; i++) {
    const time = Math.random() * durationSec;
    const dropOsc = ctx.createOscillator();
    dropOsc.type = 'sine';
    dropOsc.frequency.setValueAtTime(1200 + Math.random() * 1800, time);
    dropOsc.frequency.exponentialRampToValueAtTime(300, time + 0.03);

    const dropGain = ctx.createGain();
    dropGain.gain.setValueAtTime(0.04 + Math.random() * 0.04, time);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

    dropOsc.connect(dropGain);
    dropGain.connect(masterGain);
    dropOsc.start(time);
    dropOsc.stop(time + 0.035);
  }
}

/**
 * 5. Wind in Paddy Field / Trees (বাতাসের শনশন শব্দ)
 */
function addWindSound(ctx: OfflineAudioContext, durationSec: number, masterGain: GainNode) {
  const noiseBuffer = createBrownNoiseBuffer(ctx, durationSec);
  const windSource = ctx.createBufferSource();
  windSource.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 400;
  filter.Q.value = 2.0;

  // LFO to simulate wind gusting
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15; // Slow breeze cycle
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 250; // Sweeps 150Hz - 650Hz

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  const gain = ctx.createGain();
  gain.gain.value = 0.09;

  windSource.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  lfo.start(0);
  windSource.start(0);
}

/**
 * 6. Night Crickets (ঝিঁঝিঁ পোকার ডাক)
 */
function addNightCrickets(ctx: OfflineAudioContext, durationSec: number, masterGain: GainNode) {
  let time = 0;
  while (time < durationSec) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(4800 + Math.random() * 400, time);

    const gain = ctx.createGain();
    const burstLen = 0.05;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.03, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + burstLen);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(time);
    osc.stop(time + burstLen);

    time += 0.08 + (Math.random() > 0.7 ? 0.3 : 0.02);
  }
}

/**
 * 7. River Water Waves (নদীর ঢেউ ও পানির শব্দ)
 */
function addRiverWaves(ctx: OfflineAudioContext, durationSec: number, masterGain: GainNode) {
  const noiseBuffer = createPinkNoiseBuffer(ctx, durationSec);
  const waterSource = ctx.createBufferSource();
  waterSource.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;

  const gain = ctx.createGain();
  gain.gain.value = 0.12;

  // Modulate amplitude for wave swells
  const waveLfo = ctx.createOscillator();
  waveLfo.frequency.value = 0.2; // 5-second wave cycle
  const waveLfoGain = ctx.createGain();
  waveLfoGain.gain.value = 0.05;

  waveLfo.connect(waveLfoGain);
  waveLfoGain.connect(gain.gain);

  waterSource.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  waveLfo.start(0);
  waterSource.start(0);
}

// ==================== SPECIFIC TRACK COMPOSITIONS ====================

function buildFluteAndBirdsSoundscape(
  ctx: OfflineAudioContext,
  dur: number,
  opts: { flute: boolean; birds: boolean; wind: boolean }
) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  if (opts.wind) addWindSound(ctx, dur, master);
  if (opts.birds) addBirdsChirping(ctx, dur, master, 'medium');
  if (opts.flute) addBambooFluteMelody(ctx, 1.0, dur, master);
}

function buildRainAndThunderSoundscape(
  ctx: OfflineAudioContext,
  dur: number,
  opts: { rainIntensity: 'light' | 'medium' | 'heavy'; wind: boolean }
) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  addRainSound(ctx, dur, master, opts.rainIntensity);
  if (opts.wind) addWindSound(ctx, dur, master);
  addBirdsChirping(ctx, dur, master, 'light');
}

function buildWhistleAndBreezeSoundscape(ctx: OfflineAudioContext, dur: number) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  addWindSound(ctx, dur, master);
  addBirdsChirping(ctx, dur, master, 'dense');
  addBambooFluteMelody(ctx, 2.0, dur, master);
}

function buildDawnChorusSoundscape(ctx: OfflineAudioContext, dur: number) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  addWindSound(ctx, dur, master);
  addBirdsChirping(ctx, dur, master, 'dense');
  addCuckooBirdCalls(ctx, dur, master);
}

function buildPaddyFieldAndCuckooSoundscape(ctx: OfflineAudioContext, dur: number) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  addWindSound(ctx, dur, master);
  addCuckooBirdCalls(ctx, dur, master);
  addBirdsChirping(ctx, dur, master, 'medium');
}

function buildLeavesAndWindSoundscape(ctx: OfflineAudioContext, dur: number) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  addWindSound(ctx, dur, master);
  addBirdsChirping(ctx, dur, master, 'medium');
}

function buildRiverAndFluteSoundscape(ctx: OfflineAudioContext, dur: number) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  addRiverWaves(ctx, dur, master);
  addBambooFluteMelody(ctx, 1.5, dur, master);
  addBirdsChirping(ctx, dur, master, 'light');
}

function buildCricketsAndTwilightSoundscape(ctx: OfflineAudioContext, dur: number) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  addWindSound(ctx, dur, master);
  addNightCrickets(ctx, dur, master);
}

function buildMonsoonRainAndFolkFluteSoundscape(ctx: OfflineAudioContext, dur: number) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  addRainSound(ctx, dur, master, 'heavy');
  addBambooFluteMelody(ctx, 3.0, dur, master);
}

function buildBambooWindAndBirdsSoundscape(ctx: OfflineAudioContext, dur: number) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  addWindSound(ctx, dur, master);
  addBirdsChirping(ctx, dur, master, 'dense');
}

// ==================== NOISE BUFFERS ====================

function createWhiteNoiseBuffer(ctx: OfflineAudioContext, durationSec: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, sampleRate * durationSec, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createPinkNoiseBuffer(ctx: OfflineAudioContext, durationSec: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, sampleRate * durationSec, sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

function createBrownNoiseBuffer(ctx: OfflineAudioContext, durationSec: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, sampleRate * durationSec, sampleRate);
  const data = buffer.getChannelData(0);
  let lastOutput = 0.0;

  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOutput + 0.02 * white) / 1.02;
    lastOutput = data[i];
    data[i] *= 3.5;
  }
  return buffer;
}

// ==================== HELPER CONVERTER ====================

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    for (let i = 0; i < left.length; i++) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataByteLength = result.length * bytesPerSample;
  const totalByteLength = 44 + dataByteLength;

  const arrayBuffer = new ArrayBuffer(totalByteLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataByteLength, true);

  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    const sample = Math.max(-1, Math.min(1, result[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
