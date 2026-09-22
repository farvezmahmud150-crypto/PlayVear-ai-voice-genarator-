/**
 * Client-side Web Audio API helper to merge/mix voice audio and background music (BGM)
 * with volume balancing and loop handling, outputting a standard WAV/MP3 Blob.
 */

export async function mixVoiceAndBgm(
  voiceAudioUrl: string,
  bgmAudioUrl: string,
  bgmVolume = 0.25,
  voiceVolume = 1.0
): Promise<Blob> {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

  try {
    // 1. Fetch array buffers for both voice and BGM
    const [voiceRes, bgmRes] = await Promise.all([
      fetch(voiceAudioUrl),
      fetch(bgmAudioUrl),
    ]);

    if (!voiceRes.ok) throw new Error('Failed to fetch voice audio');
    if (!bgmRes.ok) throw new Error('Failed to fetch background music');

    const [voiceArrayBuffer, bgmArrayBuffer] = await Promise.all([
      voiceRes.arrayBuffer(),
      bgmRes.arrayBuffer(),
    ]);

    // 2. Decode audio data
    const [voiceBuffer, bgmBuffer] = await Promise.all([
      audioCtx.decodeAudioData(voiceArrayBuffer),
      audioCtx.decodeAudioData(bgmArrayBuffer),
    ]);

    const sampleRate = voiceBuffer.sampleRate || 44100;
    const duration = voiceBuffer.duration; // Match voice duration
    const numChannels = Math.max(voiceBuffer.numberOfChannels, bgmBuffer.numberOfChannels, 2);
    const totalFrames = Math.ceil(duration * sampleRate);

    // 3. Create OfflineAudioContext for rendering
    const offlineCtx = new OfflineAudioContext(numChannels, totalFrames, sampleRate);

    // Voice Source & Gain
    const voiceSource = offlineCtx.createBufferSource();
    voiceSource.buffer = voiceBuffer;
    const voiceGain = offlineCtx.createGain();
    voiceGain.gain.value = Math.max(0, Math.min(1.5, voiceVolume));
    voiceSource.connect(voiceGain);
    voiceGain.connect(offlineCtx.destination);
    voiceSource.start(0);

    // BGM Source & Gain (with looping if voice is longer than BGM)
    const bgmSource = offlineCtx.createBufferSource();
    bgmSource.buffer = bgmBuffer;
    bgmSource.loop = true; // Loop BGM smoothly if voice duration > bgm duration
    const bgmGain = offlineCtx.createGain();
    bgmGain.gain.value = Math.max(0, Math.min(1.5, bgmVolume));
    bgmSource.connect(bgmGain);
    bgmGain.connect(offlineCtx.destination);
    bgmSource.start(0);

    // 4. Render audio offline
    const renderedBuffer = await offlineCtx.startRendering();

    // 5. Convert AudioBuffer to WAV Blob
    return audioBufferToWavBlob(renderedBuffer);
  } finally {
    try {
      await audioCtx.close();
    } catch {
      // Ignore
    }
  }
}

/**
 * Converts an AudioBuffer to a valid 16-bit PCM WAV Blob
 */
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
  const headerByteLength = 44;
  const totalByteLength = headerByteLength + dataByteLength;

  const arrayBuffer = new ArrayBuffer(totalByteLength);
  const view = new DataView(arrayBuffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + dataByteLength, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, dataByteLength, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    const sample = Math.max(-1, Math.min(1, result[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
