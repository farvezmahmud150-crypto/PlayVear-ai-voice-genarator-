/**
 * Utility to generate standard UTF-8 .SRT Subtitle files
 * mathematically synchronized with generated audio duration.
 */

interface SubtitleCue {
  index: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

/**
 * Splits raw Bengali or Multilingual script into bite-sized subtitle lines.
 */
function splitIntoSubtitleLines(rawText: string): string[] {
  const clean = rawText.trim();
  if (!clean) return [];

  // Split by major Bengali & standard punctuation or newlines
  const rawSegments = clean
    .split(/([।?!;\n]+)/)
    .reduce<string[]>((acc, part, idx, arr) => {
      if (idx % 2 === 0 && part.trim()) {
        const punctuation = arr[idx + 1] ? arr[idx + 1].trim() : '';
        acc.push((part.trim() + (punctuation ? ' ' + punctuation : '')).trim());
      }
      return acc;
    }, []);

  const resultLines: string[] = [];

  for (const segment of rawSegments) {
    if (!segment.trim()) continue;

    // If segment is reasonably short (<= 50 characters or <= 8 words), keep as one cue
    const words = segment.trim().split(/\s+/);
    if (words.length <= 8 || segment.length <= 50) {
      resultLines.push(segment.trim());
    } else {
      // If segment is too long, sub-split by comma or word groups
      const commaParts = segment.split(/,\s*/);
      if (commaParts.length > 1) {
        for (const cp of commaParts) {
          if (cp.trim()) {
            const subWords = cp.trim().split(/\s+/);
            if (subWords.length > 8) {
              for (let i = 0; i < subWords.length; i += 6) {
                resultLines.push(subWords.slice(i, i + 6).join(' '));
              }
            } else {
              resultLines.push(cp.trim());
            }
          }
        }
      } else {
        for (let i = 0; i < words.length; i += 6) {
          resultLines.push(words.slice(i, i + 6).join(' '));
        }
      }
    }
  }

  return resultLines.filter((l) => l.length > 0);
}

/**
 * Formats seconds into SRT timestamp format: HH:MM:SS,mmm
 */
function formatSrtTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);
  const milliseconds = Math.floor((safeSeconds % 1) * 1000);

  const pad = (n: number, size = 2) => n.toString().padStart(size, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
}

/**
 * Generates an .SRT string from script and audio duration.
 */
export function generateSrtContent(scriptText: string, durationSeconds: number): string {
  const lines = splitIntoSubtitleLines(scriptText);
  if (lines.length === 0) return '';

  const totalDuration = durationSeconds > 0 ? durationSeconds : Math.max(2, scriptText.length / 13);

  // Total character count across all lines
  const totalChars = lines.reduce((sum, line) => sum + line.length, 0);

  // Distribute timing proportionally
  let currentStart = 0.15; // small initial pause
  const cues: SubtitleCue[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const weight = Math.max(0.05, line.length / totalChars);
    const cueDuration = Math.max(1.2, weight * (totalDuration - 0.3));

    let cueEnd = currentStart + cueDuration;
    if (i === lines.length - 1) {
      // Last cue ends cleanly near audio end
      cueEnd = Math.max(cueEnd, totalDuration);
    }

    cues.push({
      index: i + 1,
      startTime: currentStart,
      endTime: cueEnd,
      text: line,
    });

    currentStart = cueEnd + 0.05; // tiny breath gap between cues
  }

  // Build SRT string with UTF-8 BOM representation
  return cues
    .map((cue) => {
      return `${cue.index}\n${formatSrtTimestamp(cue.startTime)} --> ${formatSrtTimestamp(
        cue.endTime
      )}\n${cue.text}\n`;
    })
    .join('\n');
}

/**
 * Triggers a browser file download of the generated .SRT file.
 */
export function downloadSrtFile(
  scriptText: string,
  durationSeconds: number,
  filename = 'subtitle.srt'
) {
  const srtContent = generateSrtContent(scriptText, durationSeconds);
  if (!srtContent) return;

  // Include UTF-8 BOM so all video editors (CapCut, Premiere, DaVinci) recognize Bengali characters seamlessly
  const blob = new Blob(['\uFEFF' + srtContent], {
    type: 'text/plain;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.srt') ? filename : `${filename}.srt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
