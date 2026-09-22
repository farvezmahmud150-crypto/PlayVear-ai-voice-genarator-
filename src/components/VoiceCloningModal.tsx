import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  Trash2,
  Check,
  Zap,
  Sparkles,
  Volume2,
  AlertCircle,
  Loader2,
  RefreshCw,
  PlusCircle,
  Sliders,
} from 'lucide-react';

export interface ClonedVoiceItem {
  id: string;
  name: string;
  description?: string;
  speed?: string;
  emotion?: string;
  createdAt: string;
  sampleAudioBase64?: string;
}

interface VoiceCloningModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartesiaApiKey: string;
  clonedVoices: ClonedVoiceItem[];
  onVoiceCloned: (newVoice: ClonedVoiceItem) => void;
  onDeleteVoice: (id: string) => void;
  selectedClonedVoiceId: string | null;
  onSelectClonedVoice: (id: string | null) => void;
}

const CARTESIA_BASE_PRESETS = [
  { id: '2a465f1e-10bc-4c90-be83-0bc7499e3635', label: 'পারভেজ - স্পষ্ট ও সাবলীল (Parvez - Bengali Male)' },
  { id: '2ba861ea-7cdc-43d1-8608-4045b5a41de5', label: 'রুবেল - ক্যাজুয়াল উপস্থাপক (Rubel - Bengali Male)' },
  { id: '59ba7dee-8f9a-432f-a6c0-ffb33666b654', label: 'পূজা - শান্ত ও মিষ্টি নারী কণ্ঠ (Pooja - Bengali Female)' },
  { id: '79a125e8-cd45-4c13-8a67-188112f4dd22', label: 'কার্টেসিয়া গ্লোবাল (Sonic Multilingual)' },
  { id: 'db6b0ed5-d5d3-463d-ae85-518a07d3c2b4', label: 'স্কাইলার - কনভার্সেশনাল (Skylar Expressive)' },
  { id: 'custom', label: 'কাস্টম Cartesia Voice ID লিখুন...' },
];

export const VoiceCloningModal: React.FC<VoiceCloningModalProps> = ({
  isOpen,
  onClose,
  cartesiaApiKey,
  clonedVoices,
  onVoiceCloned,
  onDeleteVoice,
  selectedClonedVoiceId,
  onSelectClonedVoice,
}) => {
  const [activeTab, setActiveTab] = useState<'create_char' | 'record' | 'upload' | 'my_voices'>('create_char');

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecord, setIsPlayingRecord] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const recordAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);

  // Form states
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [voiceSpeed, setVoiceSpeed] = useState<string>('1.0x');
  const [voiceEmotion, setVoiceEmotion] = useState<string>('neutral');
  const [selectedBasePreset, setSelectedBasePreset] = useState<string>('2a465f1e-10bc-4c90-be83-0bc7499e3635');
  const [customVoiceIdInput, setCustomVoiceIdInput] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTierRestricted, setIsTierRestricted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
    };
  }, []);

  if (!isOpen) return null;

  // Start recording
  const startRecording = async () => {
    try {
      setErrorMessage(null);
      setIsTierRestricted(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setErrorMessage(
        'মাইক্রোফোন পারমিশন পাওয়া যায়নি বা ব্রাউজার দ্বারা ব্লক করা হয়েছে। "Upload Audio" ট্যাবে ফাইল আপলোড করে অথবা "ক্যারেক্টার বিল্ডার" দিয়ে তৈরি করুন।'
      );
      setActiveTab('create_char');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  // Reset recording
  const resetRecording = () => {
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
    setIsPlayingRecord(false);
  };

  // Toggle preview audio
  const togglePlayRecord = () => {
    if (!recordedAudioUrl) return;
    if (!recordAudioElementRef.current) {
      recordAudioElementRef.current = new Audio(recordedAudioUrl);
      recordAudioElementRef.current.onended = () => setIsPlayingRecord(false);
    }

    if (isPlayingRecord) {
      recordAudioElementRef.current.pause();
      setIsPlayingRecord(false);
    } else {
      recordAudioElementRef.current.play();
      setIsPlayingRecord(true);
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('অডিও ফাইলের সাইজ ২৫ মেগাবাইটের কম হতে হবে।');
      return;
    }

    if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);

    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setUploadedAudioUrl(url);
    setErrorMessage(null);
    setIsTierRestricted(false);
  };

  // Direct Character Builder Submit (No paid API cloning needed)
  const handleCreateCustomCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsTierRestricted(false);

    const nameToUse = voiceName.trim();
    if (!nameToUse) {
      setErrorMessage('অনুগ্রহ করে ক্যারেক্টারের একটি নাম লিখুন (যেমন: শামীম স্যার, নিউজ রিডার)।');
      return;
    }

    let finalVoiceId = selectedBasePreset;
    if (selectedBasePreset === 'custom') {
      if (!customVoiceIdInput.trim()) {
        setErrorMessage('অনুগ্রহ করে Cartesia Voice ID প্রদান করুন অথবা উপরের যেকোনো বেস ভয়েস নির্বাচন করুন।');
        return;
      }
      finalVoiceId = customVoiceIdInput.trim();
    }

    const newVoice: ClonedVoiceItem = {
      id: finalVoiceId,
      name: nameToUse,
      description: voiceDescription.trim() || 'Custom character',
      speed: voiceSpeed,
      emotion: voiceEmotion,
      createdAt: new Date().toLocaleDateString('bn-BD'),
    };

    onVoiceCloned(newVoice);
    onSelectClonedVoice(newVoice.id);

    setSuccessMessage(`"${newVoice.name}" ক্যারেক্টারটি সফলভাবে তৈরি করা হয়েছে!`);

    // Reset forms
    setVoiceName('');
    setVoiceDescription('');
    setVoiceSpeed('1.0x');
    setVoiceEmotion('neutral');
    setCustomVoiceIdInput('');

    setTimeout(() => {
      setActiveTab('my_voices');
      setSuccessMessage(null);
    }, 1200);
  };

  // Fallback direct save from audio when Cartesia 402 tier error occurs
  const handleFallbackDirectSave = () => {
    const nameToUse = voiceName.trim() || `কাস্টম ক্যারেক্টার ${Date.now().toString().slice(-4)}`;
    const newVoice: ClonedVoiceItem = {
      id: '2a465f1e-10bc-4c90-be83-0bc7499e3635', // Verified authentic Bengali voice
      name: nameToUse,
      description: voiceDescription.trim() || 'Custom character profile with custom speed & tone',
      speed: voiceSpeed,
      emotion: voiceEmotion,
      createdAt: new Date().toLocaleDateString('bn-BD'),
    };

    onVoiceCloned(newVoice);
    onSelectClonedVoice(newVoice.id);

    setSuccessMessage(`"${newVoice.name}" ক্যারেক্টারটি সফলভাবে সংরক্ষিত হয়েছে!`);
    setIsTierRestricted(false);
    setErrorMessage(null);

    // Reset forms
    setVoiceName('');
    setVoiceDescription('');
    setVoiceSpeed('1.0x');
    setVoiceEmotion('neutral');
    resetRecording();
    setUploadedFile(null);
    if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
    setUploadedAudioUrl(null);

    setTimeout(() => {
      setActiveTab('my_voices');
      setSuccessMessage(null);
    }, 1200);
  };

  // Submit voice clone request to Cartesia API
  const handleCloneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsTierRestricted(false);

    const nameToUse = voiceName.trim();
    if (!nameToUse) {
      setErrorMessage('অনুগ্রহ করে ক্যারেক্টারের একটি নাম লিখুন।');
      return;
    }

    let audioBlobToSend: Blob | null = null;
    if (activeTab === 'record') {
      if (!recordedAudioBlob) {
        setErrorMessage('অনুগ্রহ করে অন্তত ৫-১০ সেকেন্ডের কথা রেকর্ড করুন।');
        return;
      }
      audioBlobToSend = recordedAudioBlob;
    } else if (activeTab === 'upload') {
      if (!uploadedFile) {
        setErrorMessage('অনুগ্রহ করে একটি অডিও ফাইল নির্বাচন করুন।');
        return;
      }
      audioBlobToSend = uploadedFile;
    }

    if (!audioBlobToSend) return;

    setIsSubmitting(true);

    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlobToSend);
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];
          const mimeType = audioBlobToSend?.type || 'audio/wav';

          const response = await fetch('/api/cartesia-clone-voice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: nameToUse,
              description: voiceDescription.trim() || 'Custom cloned voice',
              audioBase64: base64Data,
              mimeType,
              apiKey: cartesiaApiKey,
            }),
          });

          const data = await response.json();

          if (!response.ok || data.error) {
            if (response.status === 402 || data.isTierRestricted) {
              setIsTierRestricted(true);
              setErrorMessage(
                data.error ||
                  'Cartesia Free Tier-এ অডিও ফাইল থেকে সরাসরি API ক্লোনিং বন্ধ রয়েছে (Paid tier required)। তবে আপনি নিচের বাটন দিয়ে সরাসরি কাস্টম ক্যারেক্টার হিসেবে সেভ করতে পারেন।'
              );
              setIsSubmitting(false);
              return;
            }
            throw new Error(data.error || 'ভয়েস ক্লোন করতে ব্যর্থ হয়েছে।');
          }

          const newVoice: ClonedVoiceItem = {
            id: data.id,
            name: data.name || nameToUse,
            description: voiceDescription.trim() || 'Custom cloned character',
            speed: voiceSpeed,
            emotion: voiceEmotion,
            createdAt: new Date().toLocaleDateString('bn-BD'),
          };

          onVoiceCloned(newVoice);
          onSelectClonedVoice(newVoice.id);

          setSuccessMessage(`"${newVoice.name}" ক্যারেক্টারটি সফলভাবে তৈরি করা হয়েছে!`);
          setIsSubmitting(false);

          // Reset forms
          setVoiceName('');
          setVoiceDescription('');
          setVoiceSpeed('1.0x');
          setVoiceEmotion('neutral');
          resetRecording();
          setUploadedFile(null);
          if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
          setUploadedAudioUrl(null);

          setTimeout(() => {
            setActiveTab('my_voices');
            setSuccessMessage(null);
          }, 1500);
        } catch (innerErr: any) {
          console.error('Voice clone network error:', innerErr);
          setErrorMessage(innerErr.message || 'ভয়েস ক্লোন করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
          setIsSubmitting(false);
        }
      };
    } catch (err: any) {
      console.error('Voice clone file reader error:', err);
      setErrorMessage(err.message || 'ভয়েস ক্লোন করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="voice-cloning-modal-backdrop"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="voice-cloning-modal"
        className="w-full max-w-lg bg-[#0f141f] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-[#121826]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/35 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5 animate-pulse text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                V3 কাস্টম ক্যারেক্টার বিল্ডার ও ক্লোনিং
              </h3>
              <p className="text-xs text-stone-400">
                পছন্দের ক্যারেক্টার তৈরি করুন, স্পিড ও নির্দেশাবলী সেট করুন (Cartesia AI V3)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-2 bg-[#0a0d14] border-b border-stone-800 gap-1.5 px-3 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create_char');
              setErrorMessage(null);
              setIsTierRestricted(false);
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'create_char'
                ? 'bg-purple-900/70 border border-purple-500/60 text-purple-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>ক্যারেক্টার তৈরি করুন</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('record');
              setErrorMessage(null);
              setIsTierRestricted(false);
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'record'
                ? 'bg-purple-900/70 border border-purple-500/60 text-purple-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>রেকর্ড ক্লোন</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
              setIsTierRestricted(false);
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-purple-900/70 border border-purple-500/60 text-purple-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>অডিও আপলোড</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('my_voices');
              setErrorMessage(null);
              setIsTierRestricted(false);
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'my_voices'
                ? 'bg-purple-900/70 border border-purple-500/60 text-purple-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>ক্যারেক্টারসমূহ ({clonedVoices.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="flex flex-col gap-1.5 flex-1">
                <span>{errorMessage}</span>
                {isTierRestricted && (
                  <div className="mt-1 p-2.5 bg-purple-950/50 border border-purple-500/40 rounded-lg flex flex-col gap-2">
                    <span className="text-[11px] text-purple-200 font-medium">
                      💡 Cartesia-র ফ্রি অ্যাকাউন্টে সরাসরি অডিও ক্লোনিং বন্ধ থাকলেও আপনি এই অডিওর বিবরণ ও স্পিড দিয়ে অবিলম্বে একটি কাস্টম ক্যারেক্টার প্রোফাইল সেভ করতে পারেন:
                    </span>
                    <button
                      type="button"
                      onClick={handleFallbackDirectSave}
                      className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow transition-all cursor-pointer flex items-center justify-center gap-1.5 w-fit"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>"{voiceName.trim() || 'এই ক্যারেক্টারটি'}" কাস্টম ক্যারেক্টার হিসেবে সেভ করুন</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 0: Character Builder (Direct Creation - Free Tier Friendly) */}
          {activeTab === 'create_char' && (
            <form onSubmit={handleCreateCustomCharacter} className="flex flex-col gap-3.5">
              <div className="p-3 bg-purple-950/30 border border-purple-500/25 rounded-xl text-xs text-purple-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  এখানে আপনি আপনার যেকোনো ক্যারেক্টার তৈরি করতে পারেন। সে কীভাবে কি করবে, কেমন আচরণ করবে এবং তার স্পিড ও টোন কেমন হবে তা নিচে বর্ণনা করে দিলেই তৈরি হয়ে যাবে!
                </p>
              </div>

              {/* Character Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-300">ক্যারেক্টারের নাম (Character Name):</label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="যেমন: শামীম স্যার, নিউজ অ্যাঙ্কর, থ্রিলার কথক, দাদু..."
                  className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all"
                  required
                />
              </div>

              {/* Character Persona & Instructions */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  ক্যারেক্টারের ভূমিকা ও বর্ণনা (সে কীভাবে কথা বলবে / Instructions):
                </label>
                <textarea
                  value={voiceDescription}
                  onChange={(e) => setVoiceDescription(e.target.value)}
                  placeholder="যেমন: এই ক্যারেক্টারটি ধীর গতিতে স্পষ্ট উচ্চারণে একজন শিক্ষকের মতো সুন্দরভাবে বুঝিয়ে কথা বলবে..."
                  rows={2}
                  className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all resize-none"
                />
              </div>

              {/* Speed & Emotion */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-300 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-purple-400" />
                    <span>ভয়েস স্পিড (Speed):</span>
                  </label>
                  <select
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(e.target.value)}
                    className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3 py-2 outline-none transition-all cursor-pointer"
                  >
                    <option value="0.8x">0.8x (খুব ধীর)</option>
                    <option value="0.9x">0.9x (ধীর গতি)</option>
                    <option value="1.0x">1.0x (স্বাভাবিক / Normal)</option>
                    <option value="1.1x">1.1x (হালকা দ্রুত)</option>
                    <option value="1.2x">1.2x (দ্রুত)</option>
                    <option value="1.4x">1.4x (খুব দ্রুত)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-300">ইমোশন ও টোন (Emotion):</label>
                  <select
                    value={voiceEmotion}
                    onChange={(e) => setVoiceEmotion(e.target.value)}
                    className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3 py-2 outline-none transition-all cursor-pointer"
                  >
                    <option value="neutral">Neutral (স্বাভাবিক)</option>
                    <option value="serene">Serene & Calm (শান্ত)</option>
                    <option value="excited">Excited (উৎফুল্ল)</option>
                    <option value="serious">Serious & Deep (গম্ভীর)</option>
                    <option value="mysterious">Mysterious (রহস্যময়)</option>
                  </select>
                </div>
              </div>

              {/* Base Cartesia Voice Model */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  কার্টেসিয়া ভয়েস মডেল নির্বাচন (Base Voice Model):
                </label>
                <select
                  value={selectedBasePreset}
                  onChange={(e) => setSelectedBasePreset(e.target.value)}
                  className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3 py-2 outline-none transition-all cursor-pointer"
                >
                  {CARTESIA_BASE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBasePreset === 'custom' && (
                <div className="flex flex-col gap-1.5 animate-in fade-in">
                  <label className="text-xs font-semibold text-purple-300">
                    Cartesia Voice ID (আপনার ক্লোন করা বা প্লেগ্রাউন্ডের ভয়েস আইডি):
                  </label>
                  <input
                    type="text"
                    value={customVoiceIdInput}
                    onChange={(e) => setCustomVoiceIdInput(e.target.value)}
                    placeholder="e.g. a0e168f2-dd7b-4a1e-9924-2222370707a9"
                    className="w-full bg-[#141a26] border border-purple-500/50 text-stone-100 text-xs rounded-xl px-3.5 py-2 outline-none font-mono"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>ক্যারেক্টার তৈরি ও সেভ করুন</span>
              </button>
            </form>
          )}

          {/* TAB 1: Live Record */}
          {activeTab === 'record' && (
            <form onSubmit={handleCloneSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-800 bg-[#121722] rounded-2xl gap-3 text-center">
                {!isRecording && !recordedAudioBlob && (
                  <>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                    <p className="text-xs text-stone-300 font-medium">
                      ১০-১৫ সেকেন্ড কথা রেকর্ড করতে মাইকে ক্লিক করুন
                    </p>
                    <p className="text-[11px] text-stone-500">
                      (পরামর্শ: নিরিবিলি পরিবেশে স্বাভাবিক কন্ঠে স্পষ্টভাবে কথা বলুন।)
                    </p>
                  </>
                )}

                {isRecording && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 animate-ping absolute inset-0" />
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-all cursor-pointer relative z-10"
                      >
                        <Square className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-red-400 font-mono tracking-wider">
                      Recording... 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s
                    </div>
                    <p className="text-xs text-stone-400">রেকর্ড শেষ হলে লাল বাটনে ক্লিক করুন</p>
                  </div>
                )}

                {!isRecording && recordedAudioBlob && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={togglePlayRecord}
                        className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        {isPlayingRecord ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={resetRecording}
                        className="p-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
                        title="Re-record"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      অডিও রেকর্ড সম্পন্ন (00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s)
                    </span>
                  </div>
                )}
              </div>

              {/* Character Form Fields */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-300">ক্যারেক্টারের নাম (Character Name):</label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="যেমন: নিউজ রিডার, শামীম স্যার, থ্রিলার নারেটর..."
                  className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  ক্যারেক্টারের বর্ণনা ও নির্দেশাবলী (Description & Instructions):
                </label>
                <textarea
                  value={voiceDescription}
                  onChange={(e) => setVoiceDescription(e.target.value)}
                  placeholder="যেমন: এই ক্যারেক্টারটি ধীর গতিতে স্পষ্ট টোন ও প্রফেশনাল সংবাদ পাঠের মতো কথা বলবে..."
                  rows={2}
                  className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-300">ভয়েস স্পিড (Speech Speed):</label>
                  <select
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(e.target.value)}
                    className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3 py-2 outline-none transition-all cursor-pointer"
                  >
                    <option value="0.8x">0.8x (খুব ধীর)</option>
                    <option value="0.9x">0.9x (ধীর গতি)</option>
                    <option value="1.0x">1.0x (স্বাভাবিক / Normal)</option>
                    <option value="1.1x">1.1x (হালকা দ্রুত)</option>
                    <option value="1.2x">1.2x (দ্রুত)</option>
                    <option value="1.4x">1.4x (খুব দ্রুত)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-300">ইমোশন ও টোন (Emotion):</label>
                  <select
                    value={voiceEmotion}
                    onChange={(e) => setVoiceEmotion(e.target.value)}
                    className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3 py-2 outline-none transition-all cursor-pointer"
                  >
                    <option value="neutral">Neutral (স্বাভাবিক)</option>
                    <option value="serene">Serene & Calm (শান্ত)</option>
                    <option value="excited">Excited (উৎফুল্ল)</option>
                    <option value="serious">Serious & Deep (গম্ভীর)</option>
                    <option value="mysterious">Mysterious (রহস্যময়)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !recordedAudioBlob}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ভয়েস ক্লোন হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ভয়েস ক্লোন সাবমিট করুন</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: Upload Audio File */}
          {activeTab === 'upload' && (
            <form onSubmit={handleCloneSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-800 hover:border-purple-500/50 bg-[#121722] rounded-2xl gap-3 text-center transition-all relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Upload className="w-6 h-6" />
                </div>
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-emerald-400">{uploadedFile.name}</span>
                    <span className="text-[10px] text-stone-400">
                      ({(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-stone-200">
                      অডিও ফাইল নির্বাচন করতে ক্লিক করুন বা ড্র্যাগ করুন
                    </p>
                    <p className="text-[11px] text-stone-400">
                      সাপোর্টেড: WAV, MP3, M4A, WEBM, OGG (১০-৩০ সেকেন্ডের স্পষ্ট অডিও)
                    </p>
                  </>
                )}
              </div>

              {/* Character Form Fields */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-300">ক্যারেক্টারের নাম (Character Name):</label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="যেমন: নিউজ রিডার, শামীম স্যার, থ্রিলার নারেটর..."
                  className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-300">
                  ক্যারেক্টারের বর্ণনা ও নির্দেশাবলী (Description & Instructions):
                </label>
                <textarea
                  value={voiceDescription}
                  onChange={(e) => setVoiceDescription(e.target.value)}
                  placeholder="যেমন: এই ক্যারেক্টারটি ধীর গতিতে স্পষ্ট টোন ও প্রফেশনাল সংবাদ পাঠের মতো কথা বলবে..."
                  rows={2}
                  className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-300">ভয়েস স্পিড (Speech Speed):</label>
                  <select
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(e.target.value)}
                    className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3 py-2 outline-none transition-all cursor-pointer"
                  >
                    <option value="0.8x">0.8x (খুব ধীর)</option>
                    <option value="0.9x">0.9x (ধীর গতি)</option>
                    <option value="1.0x">1.0x (স্বাভাবিক / Normal)</option>
                    <option value="1.1x">1.1x (হালকা দ্রুত)</option>
                    <option value="1.2x">1.2x (দ্রুত)</option>
                    <option value="1.4x">1.4x (খুব দ্রুত)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-stone-300">ইমোশন ও টোন (Emotion):</label>
                  <select
                    value={voiceEmotion}
                    onChange={(e) => setVoiceEmotion(e.target.value)}
                    className="w-full bg-[#141a26] border border-stone-700 focus:border-purple-500 text-stone-100 text-xs rounded-xl px-3 py-2 outline-none transition-all cursor-pointer"
                  >
                    <option value="neutral">Neutral (স্বাভাবিক)</option>
                    <option value="serene">Serene & Calm (শান্ত)</option>
                    <option value="excited">Excited (উৎফুল্ল)</option>
                    <option value="serious">Serious & Deep (গম্ভীর)</option>
                    <option value="mysterious">Mysterious (রহস্যময়)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !uploadedFile}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ভয়েস ক্লোন হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ভয়েস ক্লোন সাবমিট করুন</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: My Cloned Voices */}
          {activeTab === 'my_voices' && (
            <div className="flex flex-col gap-3">
              {clonedVoices.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs flex flex-col items-center gap-2">
                  <Volume2 className="w-8 h-8 text-stone-600" />
                  <p>এখনো কোনো ক্যারেক্টার তৈরি করা হয়নি।</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('create_char')}
                    className="text-purple-400 hover:text-purple-300 underline font-semibold text-xs mt-1 cursor-pointer"
                  >
                    "ক্যারেক্টার তৈরি করুন" ট্যাবে ক্লিক করে আপনার প্রথম ক্যারেক্টার বানান
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {clonedVoices.map((voice) => {
                    const isSelected = selectedClonedVoiceId === voice.id;
                    return (
                      <div
                        key={voice.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-purple-950/60 border-purple-500/60 text-purple-100 shadow-md'
                            : 'bg-[#121722] border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-purple-600 text-white' : 'bg-stone-800 text-stone-300'
                            }`}
                          >
                            <Mic className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-stone-100 flex items-center gap-2">
                              {voice.name}
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30">
                                {voice.speed || '1.0x'}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 capitalize">
                                {voice.emotion || 'neutral'}
                              </span>
                            </span>
                            {voice.description && (
                              <p className="text-[11px] text-stone-400 line-clamp-1">
                                {voice.description}
                              </p>
                            )}
                            <span className="text-[10px] text-stone-500">
                              আইডি: {voice.id.substring(0, 8)}... • তৈরি: {voice.createdAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                onSelectClonedVoice(null);
                              } else {
                                onSelectClonedVoice(voice.id);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>সিলেক্টেড</span>
                              </>
                            ) : (
                              <span>সিলেক্ট করুন</span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteVoice(voice.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
