import React, { useState, useRef, useEffect } from 'react';
import { CharacterId, VoiceGenerationResponse } from './types.ts';
import { Header } from './components/Header.tsx';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { HistoryModal } from './components/HistoryModal.tsx';
import { BgMusicModal } from './components/BgMusicModal.tsx';
import { MusicGuideModal } from './components/MusicGuideModal.tsx';
import { SubtitleGuideModal } from './components/SubtitleGuideModal.tsx';
import { CartesiaKeyModal } from './components/CartesiaKeyModal.tsx';
import { VoiceCloningModal, ClonedVoiceItem } from './components/VoiceCloningModal.tsx';
import {
  HistoryVoiceItem,
  getAllVoicesFromDevice,
  saveVoiceToDevice,
  deleteVoiceFromDevice,
  clearAllVoicesFromDevice,
} from './services/historyStorage.ts';
import { Sparkles, Loader2, Key, Zap, Settings2, Mic } from 'lucide-react';

export default function App() {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>('news_anchor');
  const [script, setScript] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Multi-Engine Selection: v2 (Gemini TTS Built-in) vs v3 (Cartesia AI Sonic)
  const [engineMode, setEngineMode] = useState<'v2' | 'v3'>('v2');
  const [cartesiaApiKey, setCartesiaApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('playvear_cartesia_api_key') || '';
    } catch {
      return '';
    }
  });
  const [showCartesiaKeyModal, setShowCartesiaKeyModal] = useState<boolean>(false);

  // Default verified Bengali characters for Cartesia Engine
  const defaultBengaliCharacters: ClonedVoiceItem[] = [
    {
      id: '2a465f1e-10bc-4c90-be83-0bc7499e3635',
      name: 'পারভেজ (Parvez - সাবলীল বাংলা)',
      description: 'স্পষ্ট, আকর্ষণীয় ও প্রাঞ্জল বাংলা পুরুষ কণ্ঠ',
      speed: '1.0x',
      emotion: 'neutral',
      createdAt: 'Official',
    },
    {
      id: '2ba861ea-7cdc-43d1-8608-4045b5a41de5',
      name: 'রুবেল (Rubel - উপস্থাপক ও কথক)',
      description: 'ক্যাজুয়াল, প্রাণবন্ত ও বাস্তবসম্মত ধারাভাষ্য কণ্ঠ',
      speed: '1.0x',
      emotion: 'neutral',
      createdAt: 'Official',
    },
    {
      id: '59ba7dee-8f9a-432f-a6c0-ffb33666b654',
      name: 'পূজা (Pooja - শান্ত মিষ্টি নারী কণ্ঠ)',
      description: 'কোমল ও মার্জিত বাংলা নারী কণ্ঠ',
      speed: '1.0x',
      emotion: 'serene',
      createdAt: 'Official',
    },
  ];

  // Voice cloning modal & state
  const [showVoiceCloneModal, setShowVoiceCloneModal] = useState<boolean>(false);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('playvear_cloned_voices');
      const invalidOldUuids = [
        'a0e168f2-dd7b-4a1e-9924-2222370707a9',
        '694718d0-0171-4158-b1c0-14b0e37f0e9f',
        '82900ec4-033c-457b-8018-05230820db51',
        'fb9e0721-e374-42f8-9a67-d815779c16e7',
      ];
      if (saved) {
        const parsed: ClonedVoiceItem[] = JSON.parse(saved);
        const validCustom = parsed.filter(v => !invalidOldUuids.includes(v.id));
        const combined = [...validCustom];
        defaultBengaliCharacters.forEach(def => {
          if (!combined.some(v => v.id === def.id)) {
            combined.push(def);
          }
        });
        return combined;
      }
      return defaultBengaliCharacters;
    } catch {
      return defaultBengaliCharacters;
    }
  });
  const [selectedClonedVoiceId, setSelectedClonedVoiceId] = useState<string | null>('2a465f1e-10bc-4c90-be83-0bc7499e3635');

  // History modal state
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<HistoryVoiceItem[]>([]);

  // Background music modal state
  const [isBgMusicOpen, setIsBgMusicOpen] = useState<boolean>(false);
  const [bgMusicVoice, setBgMusicVoice] = useState<{
    voiceAudioUrl: string;
    characterId: string;
    title?: string;
  } | null>(null);

  // Music usage & license guide modal state
  const [isMusicGuideOpen, setIsMusicGuideOpen] = useState<boolean>(false);

  // Subtitle usage guide modal state
  const [isSubtitleGuideOpen, setIsSubtitleGuideOpen] = useState<boolean>(false);

  // Double tap exit toast indicator
  const [showExitToast, setShowExitToast] = useState<boolean>(false);

  const prevAudioUrlRef = useRef<string | null>(null);
  const lastBackPressTimeRef = useRef<number>(0);
  const exitToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent browser pull-to-refresh on mobile swipe down
  useEffect(() => {
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;

        // If swiping downwards at the top of page or scroll container
        if (deltaY > 0 && window.scrollY <= 0) {
          // Check if target is a scrollable container that is scrolled down
          let el = e.target as HTMLElement | null;
          let canScrollUp = false;
          while (el && el !== document.body && el !== document.documentElement) {
            if (el.scrollTop > 0) {
              canScrollUp = true;
              break;
            }
            el = el.parentElement;
          }

          if (!canScrollUp) {
            // Prevent browser default pull-to-refresh
            if (e.cancelable) {
              e.preventDefault();
            }
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Load persistent history items from IndexedDB
  useEffect(() => {
    let mounted = true;
    getAllVoicesFromDevice()
      .then((items: HistoryVoiceItem[]) => {
        if (mounted) setHistoryItems(items);
      })
      .catch((err: unknown) => console.error('Error loading history from device storage:', err));
    return () => {
      mounted = false;
    };
  }, []);

  // Keep refs up to date so popstate listener never uses stale closures
  const isHistoryOpenRef = useRef<boolean>(isHistoryOpen);
  const isBgMusicOpenRef = useRef<boolean>(isBgMusicOpen);
  const isMusicGuideOpenRef = useRef<boolean>(isMusicGuideOpen);
  const isSubtitleGuideOpenRef = useRef<boolean>(isSubtitleGuideOpen);

  useEffect(() => {
    isHistoryOpenRef.current = isHistoryOpen;
  }, [isHistoryOpen]);

  useEffect(() => {
    isBgMusicOpenRef.current = isBgMusicOpen;
  }, [isBgMusicOpen]);

  useEffect(() => {
    isMusicGuideOpenRef.current = isMusicGuideOpen;
  }, [isMusicGuideOpen]);

  useEffect(() => {
    isSubtitleGuideOpenRef.current = isSubtitleGuideOpen;
  }, [isSubtitleGuideOpen]);

  // Sync browser/mobile history state for hardware back button interception
  useEffect(() => {
    // Push an initial state so back button can be intercepted
    window.history.replaceState({ appState: 'root' }, '');
    window.history.pushState({ appState: 'active' }, '');

    const handlePopState = () => {
      // Step 1: Check if any UI modals/menus/popups are open
      const isConfirmModalOpen = !!document.getElementById('clear-all-confirmation-modal');
      const isDropdownOpen = !!document.getElementById('character-dropdown-menu');
      const isMenuOpen = !!document.getElementById('header-options-dropdown');

      if (isConfirmModalOpen) {
        // Close clear confirm modal
        window.dispatchEvent(new CustomEvent('close-clear-confirm-modal'));
        window.history.pushState({ appState: 'active' }, '');
        return;
      }

      if (isSubtitleGuideOpenRef.current) {
        // Close subtitle guide modal
        setIsSubtitleGuideOpen(false);
        window.history.pushState({ appState: 'active' }, '');
        return;
      }

      if (isMusicGuideOpenRef.current) {
        // Close music guide modal
        setIsMusicGuideOpen(false);
        window.history.pushState({ appState: 'active' }, '');
        return;
      }

      if (isHistoryOpenRef.current) {
        // Close history modal
        setIsHistoryOpen(false);
        window.history.pushState({ appState: 'active' }, '');
        return;
      }

      if (isBgMusicOpenRef.current) {
        // Close background music modal
        setIsBgMusicOpen(false);
        window.history.pushState({ appState: 'active' }, '');
        return;
      }

      if (isDropdownOpen || isMenuOpen) {
        // Close open dropdowns/menus
        window.dispatchEvent(new CustomEvent('close-all-header-menus'));
        window.history.pushState({ appState: 'active' }, '');
        return;
      }

      // Step 2: At root screen - handle double-tap to exit
      const now = Date.now();
      const timeDiff = now - lastBackPressTimeRef.current;

      if (timeDiff < 2000) {
        // Double tap confirmed! Allow exit
        if (exitToastTimerRef.current) {
          clearTimeout(exitToastTimerRef.current);
        }
        setShowExitToast(false);
        // Allow actual back navigation / exit
        window.history.back();
      } else {
        // First tap: Intercept back, re-push state, and show toast
        lastBackPressTimeRef.current = now;
        window.history.pushState({ appState: 'active' }, '');

        setShowExitToast(true);
        if (exitToastTimerRef.current) {
          clearTimeout(exitToastTimerRef.current);
        }
        exitToastTimerRef.current = setTimeout(() => {
          setShowExitToast(false);
        }, 2000);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (exitToastTimerRef.current) {
        clearTimeout(exitToastTimerRef.current);
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!script.trim()) {
      setErrorMessage('Please enter or paste your script text.');
      return;
    }

    // In V3 mode, if no cloned voice is created yet, prompt user to clone a character
    if (engineMode === 'v3' && !selectedClonedVoiceId && clonedVoices.length === 0) {
      setErrorMessage('V3 মডেলে ভয়েস তৈরি করতে অনুগ্রহ করে প্রথমে একটি ভয়েস ক্লোন ক্যারেক্টার তৈরি করুন।');
      setShowVoiceCloneModal(true);
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    // Get active cloned voice details if in V3 mode
    const activeClonedVoice = engineMode === 'v3'
      ? clonedVoices.find((v) => v.id === selectedClonedVoiceId) || clonedVoices[0]
      : null;

    try {
      const endpoint = engineMode === 'v3' ? '/api/cartesia-generate' : '/api/generate-voice';
      const bodyPayload =
        engineMode === 'v3'
          ? {
              text: script.trim(),
              character: selectedCharacter,
              apiKey: cartesiaApiKey,
              voiceId: activeClonedVoice?.id || '2a465f1e-10bc-4c90-be83-0bc7499e3635',
              emotion: activeClonedVoice?.emotion || 'neutral',
              speed: activeClonedVoice?.speed || '1.0x',
            }
          : { text: script.trim(), character: selectedCharacter };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        if (data.isApiKeyMissing) {
          setShowCartesiaKeyModal(true);
        }
        throw new Error(data.error || 'Failed to generate voice.');
      }

      // Convert base64 to Blob URL
      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });

      // Clean up previous URL
      if (prevAudioUrlRef.current) {
        URL.revokeObjectURL(prevAudioUrlRef.current);
      }

      const newUrl = URL.createObjectURL(blob);
      prevAudioUrlRef.current = newUrl;
      setAudioUrl(newUrl);

      // Save to device local storage (IndexedDB persistent storage)
      saveVoiceToDevice({
        character: selectedCharacter,
        script: script.trim(),
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        format: data.format || (engineMode === 'v3' ? 'wav' : 'mp3'),
      })
        .then((savedItem) => {
          setHistoryItems((prev) => [savedItem, ...prev]);
        })
        .catch((err) => {
          console.warn('Could not save to local device storage:', err);
        });
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMessage(err?.message || 'An error occurred while generating the voice.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${selectedCharacter}-voice.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResetToNew = () => {
    if (prevAudioUrlRef.current) {
      URL.revokeObjectURL(prevAudioUrlRef.current);
      prevAudioUrlRef.current = null;
    }
    setAudioUrl(null);
    setScript('');
    setErrorMessage(null);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await deleteVoiceFromDevice(id);
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = async () => {
    await clearAllVoicesFromDevice();
    setHistoryItems([]);
  };

  const handleSelectHistoryScript = (historicScript: string) => {
    setScript(historicScript);
  };

  return (
    <div
      id="app-root"
      className="min-h-screen bg-[#090b0e] text-stone-100 flex flex-col font-['Plus_Jakarta_Sans','Hind_Siliguri',sans-serif] selection:bg-cyan-500 selection:text-stone-950 relative"
    >
      {/* Top Header with Character Dropdown & 3-Dots Menu */}
      <Header
        selectedCharacter={selectedCharacter}
        onSelectCharacter={(char) => {
          setSelectedCharacter(char);
          setErrorMessage(null);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenBgMusic={() => {
          if (audioUrl) {
            setBgMusicVoice({
              voiceAudioUrl: audioUrl,
              characterId: selectedCharacter,
              title: script ? script.slice(0, 40) + '...' : undefined,
            });
          } else {
            setBgMusicVoice(null);
          }
          setIsBgMusicOpen(true);
        }}
        onOpenMusicGuide={() => setIsMusicGuideOpen(true)}
        onOpenSubtitleGuide={() => setIsSubtitleGuideOpen(true)}
        historyCount={historyItems.length}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-6 pb-6 gap-5">
        {/* Model Engine Selector Switch (V2 Model vs V3 Model) */}
        <div id="model-engine-selector-bar" className="w-full flex items-center justify-between bg-[#10141d] border border-stone-800 rounded-2xl p-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 flex-1">
            <button
              id="engine-v2-tab-btn"
              type="button"
              onClick={() => {
                setEngineMode('v2');
                setErrorMessage(null);
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                engineMode === 'v2'
                  ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.18)]'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>V2 Model</span>
            </button>

            <button
              id="engine-v3-tab-btn"
              type="button"
              onClick={() => {
                setEngineMode('v3');
                setErrorMessage(null);
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                engineMode === 'v3'
                  ? 'bg-purple-950/80 border border-purple-500/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.18)]'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>V3 Model</span>
            </button>
          </div>
        </div>

        {/* V3 Cloned Character Selection & Management Card */}
        {engineMode === 'v3' && (
          <div id="v3-character-selection-card" className="w-full bg-[#111622] border border-purple-500/35 rounded-2xl p-4 shadow-lg flex flex-col gap-3 animate-in fade-in">
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Mic className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-stone-100 flex items-center gap-2">
                    V3 কাস্টম ক্লোন ক্যারেক্টার নির্বাচন
                    <span className="text-[10px] text-purple-300 font-mono bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/30">
                      Cartesia Engine
                    </span>
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {clonedVoices.length > 0
                      ? 'আপনার ক্লোন করা ক্যারেক্টার সিলেক্ট করে ভয়েস জেনারেট করুন'
                      : 'ভয়েস ক্লোন করে আপনার পছন্দের ক্যারেক্টার তৈরি করুন'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowVoiceCloneModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer ml-auto"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>+ নতুন ক্যারেক্টার ক্লোন করুন</span>
              </button>
            </div>

            {clonedVoices.length > 0 ? (
              <div className="flex flex-col gap-2">
                {/* Character Selector Dropdown */}
                <div className="relative">
                  <select
                    value={selectedClonedVoiceId || (clonedVoices[0]?.id || '')}
                    onChange={(e) => setSelectedClonedVoiceId(e.target.value || null)}
                    className="w-full bg-[#161c28] border border-purple-500/50 hover:border-purple-400 focus:border-purple-400 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer transition-all font-semibold"
                  >
                    {clonedVoices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.speed || '1.0x'} • {v.emotion || 'neutral'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Character Details Banner */}
                {(() => {
                  const activeVoice = clonedVoices.find(v => v.id === (selectedClonedVoiceId || clonedVoices[0]?.id));
                  if (!activeVoice) return null;
                  return (
                    <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex flex-col gap-1 text-xs text-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-100 flex items-center gap-2">
                          🎭 {activeVoice.name}
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/80 border border-purple-500/30">
                            ⚡ স্পিড: {activeVoice.speed || '1.0x'}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/80 border border-purple-500/30 capitalize">
                            ✨ টোন: {activeVoice.emotion || 'neutral'}
                          </span>
                        </span>
                      </div>
                      {activeVoice.description && (
                        <p className="text-[11px] text-purple-300/80 italic mt-0.5">
                          "{activeVoice.description}"
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-3.5 bg-purple-950/30 border border-purple-500/20 rounded-xl text-center flex flex-col items-center gap-1.5">
                <p className="text-xs text-stone-300">
                  V3 মডেলে কথা বলানোর জন্য আপনার এখনো কোনো ক্লোন ক্যারেক্টার তৈরি নেই।
                </p>
                <button
                  type="button"
                  onClick={() => setShowVoiceCloneModal(true)}
                  className="text-xs font-bold text-purple-300 hover:text-purple-100 underline cursor-pointer"
                >
                  এখানে ক্লিক করে ১০-১৫ সেকেন্ডের অডিও থেকে প্রথম ক্যারেক্টার ক্লোন করুন
                </button>
              </div>
            )}
          </div>
        )}

        {/* Script Text Box & Stats Bar */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="w-full flex flex-col h-[220px] sm:h-[340px]">
            <textarea
              id="script-input-box"
              value={script}
              onChange={(e) => {
                setScript(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder=""
              className="w-full h-full bg-[#11141c] text-stone-100 placeholder-transparent text-base sm:text-lg leading-relaxed p-4 sm:p-5 rounded-2xl border border-stone-800 hover:border-cyan-500/40 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 transition-all resize-y shadow-sm focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            />
          </div>

          {/* Character counter & estimated voice length */}
          <div
            id="script-counter-stats"
            className="flex items-center justify-end gap-3 text-stone-400 font-mono select-none px-2 tracking-wider uppercase text-[7px]"
            style={{ fontSize: '7px', lineHeight: '1.2' }}
          >
            <span id="script-character-count">
              Characters: {script.length}
            </span>
            <span className="text-stone-700">|</span>
            <span id="script-estimated-duration">
              Est. Voice Length: ~{(() => {
                const clean = script.trim();
                if (!clean) return '0s';
                const totalSeconds = Math.max(1, Math.round(clean.length / 13));
                const mins = Math.floor(totalSeconds / 60);
                const secs = totalSeconds % 60;
                return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
              })()}
            </span>
          </div>
        </div>

        {/* Inline error if script is missing or generation fails */}
        {errorMessage && (
          <div id="error-message" className="flex flex-col items-center gap-2 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-fuchsia-300 text-xs font-medium text-center max-w-md mx-auto animate-in fade-in">
            <span>{errorMessage}</span>
            {engineMode === 'v3' && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowCartesiaKeyModal(true)}
                  className="px-3 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                >
                  Cartesia API Key ইনপুট দিন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEngineMode('v2');
                    setErrorMessage(null);
                  }}
                  className="px-3 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/40 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                >
                  V2 মডেলে স্যুইচ করুন
                </button>
              </div>
            )}
          </div>
        )}

        {/* Generate Button & Small "New" Option */}
        <div className="flex items-center justify-center gap-3 w-full relative">
          <button
            id="generate-voice-btn"
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0e1622] hover:bg-[#142338] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0e1622] text-cyan-300 hover:text-cyan-100 font-semibold text-sm rounded-xl border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.12)] hover:shadow-[0_0_18px_rgba(6,182,212,0.28)] transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-200" />
                <span className="tracking-wide">Generate</span>
              </>
            )}
          </button>

          {/* Small "New" text button on the right side of Generate button */}
          {audioUrl && (
            <button
              id="reset-new-screen-btn"
              type="button"
              onClick={handleResetToNew}
              className="text-[11px] font-normal text-stone-400 hover:text-cyan-300 hover:underline cursor-pointer transition-colors p-0 bg-transparent border-0 select-none animate-in fade-in duration-200"
            >
              New
            </button>
          )}
        </div>

        {/* Voice Play Layout & Action Links */}
        {audioUrl && (
          <div id="result-audio-container" className="w-full mt-2">
            <AudioPlayer
              audioUrl={audioUrl}
              characterId={selectedCharacter}
              scriptText={script}
              onDownloadRaw={handleDownload}
              onOpenMixMusic={() => {
                setBgMusicVoice({
                  voiceAudioUrl: audioUrl,
                  characterId: selectedCharacter,
                  title: script ? script.slice(0, 40) + '...' : undefined,
                });
                setIsBgMusicOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Subtle bottom-right watermark / brand tag */}
      <footer id="bottom-brand-footer" className="fixed bottom-2 right-3 z-10 pointer-events-none select-none opacity-40 transition-opacity">
        <span className="text-[10px] font-medium tracking-wider text-stone-400">
          by <span className="text-cyan-400 font-semibold">PlayVear</span>
        </span>
      </footer>

      {/* Voice History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyItems={historyItems}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
        onSelectScript={handleSelectHistoryScript}
        onOpenMixMusic={(item) => {
          try {
            const byteCharacters = atob(item.audioBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: item.mimeType || 'audio/mpeg' });
            const url = URL.createObjectURL(blob);

            setBgMusicVoice({
              voiceAudioUrl: url,
              characterId: item.character,
              title: item.characterName,
            });
            setIsBgMusicOpen(true);
          } catch (err) {
            console.error('Failed to prepare history voice for mixing:', err);
          }
        }}
      />

      {/* Copyright-Free Background Music Modal */}
      <BgMusicModal
        isOpen={isBgMusicOpen}
        onClose={() => setIsBgMusicOpen(false)}
        defaultCharacterId={bgMusicVoice?.characterId || selectedCharacter}
        voiceAudioUrl={bgMusicVoice?.voiceAudioUrl}
        voiceTitle={bgMusicVoice?.title}
        onOpenMusicGuide={() => setIsMusicGuideOpen(true)}
      />

      {/* Music Usage & License Guide Modal */}
      <MusicGuideModal
        isOpen={isMusicGuideOpen}
        onClose={() => setIsMusicGuideOpen(false)}
      />

      {/* Subtitle Usage Guide Modal */}
      <SubtitleGuideModal
        isOpen={isSubtitleGuideOpen}
        onClose={() => setIsSubtitleGuideOpen(false)}
      />

      {/* Cartesia AI API Key Modal */}
      <CartesiaKeyModal
        isOpen={showCartesiaKeyModal}
        onClose={() => setShowCartesiaKeyModal(false)}
        currentApiKey={cartesiaApiKey}
        onSaveApiKey={(key) => {
          setCartesiaApiKey(key);
          try {
            localStorage.setItem('playvear_cartesia_api_key', key);
          } catch (e) {
            console.warn('Could not save cartesia key to localStorage:', e);
          }
        }}
      />

      {/* Voice Cloning Modal */}
      <VoiceCloningModal
        isOpen={showVoiceCloneModal}
        onClose={() => setShowVoiceCloneModal(false)}
        cartesiaApiKey={cartesiaApiKey}
        clonedVoices={clonedVoices}
        onVoiceCloned={(newVoice) => {
          setClonedVoices((prev) => {
            const updated = [newVoice, ...prev];
            try {
              localStorage.setItem('playvear_cloned_voices', JSON.stringify(updated));
            } catch (e) {
              console.warn('Could not save cloned voices:', e);
            }
            return updated;
          });
        }}
        onDeleteVoice={(id) => {
          setClonedVoices((prev) => {
            const updated = prev.filter((v) => v.id !== id);
            try {
              localStorage.setItem('playvear_cloned_voices', JSON.stringify(updated));
            } catch (e) {
              console.warn('Could not save cloned voices:', e);
            }
            return updated;
          });
          if (selectedClonedVoiceId === id) {
            setSelectedClonedVoiceId(null);
          }
        }}
        selectedClonedVoiceId={selectedClonedVoiceId}
        onSelectClonedVoice={(id) => setSelectedClonedVoiceId(id)}
      />

      {/* Double Tap Exit Toast Notification */}
      {showExitToast && (
        <div
          id="exit-toast-notification"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] bg-[#141a26]/95 border border-cyan-500/40 text-stone-200 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md text-xs font-medium tracking-wide animate-in fade-in slide-in-from-bottom-3 duration-150 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Press back again to exit</span>
        </div>
      )}
    </div>
  );
}
