import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  Volume2,
  FileText,
  Sparkles,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface MusicGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicGuideModal: React.FC<MusicGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const universalCreditText = `Music: Royalty-Free Background Music
Licensed under Creative Commons: By Attribution 4.0 (CC-BY 4.0)
Source: Incompetech / Free Music Archive (Kevin MacLeod & Open Creators)
Provided by Bangla AI Voice Generator (by PlayVear)`;

  const shortCreditText = `Music by Kevin MacLeod (incompetech.com) | Licensed under CC-BY 4.0`;

  const youtubeDetailedCreditText = `🎵 Background Music Attribution:
Track: Royalty-Free Background Music
Artist: Kevin MacLeod & Open Creative Artists
Source: incompetech.com / freemusicarchive.org
License: Creative Commons Attribution 4.0 International (CC BY 4.0)
https://creativecommons.org/licenses/by/4.0/`;

  return (
    <div
      id="music-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="music-guide-modal-container"
        className="w-full max-w-3xl bg-[#0f141f] border border-stone-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800 bg-[#131926] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                <span>Music Usage & License Guide</span>
                <span className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  100% Royalty Free
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                ব্যাকগ্রাউন্ড মিউজিক ব্যবহারের সম্পূর্ণ গাইডলাইন ও ক্রেডিট লাইন
              </p>
            </div>
          </div>

          <button
            id="close-music-guide-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Close guide modal"
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin text-stone-200 text-xs sm:text-sm leading-relaxed">
          
          {/* Quick Answer Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#101b22] to-cyan-950/40 border border-emerald-500/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3.5 items-start sm:items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm sm:text-base font-bold text-emerald-300 mb-1">
                মিউজিকগুলো কি ১০০% কপিরাইট ফ্রি ও নিরাপদ?
              </h4>
              <p className="text-stone-300 text-xs leading-normal">
                <span className="font-semibold text-emerald-200">হ্যাঁ, সম্পূর্ণ কপিরাইট-ফ্রি ও রয়্যালটি-ফ্রি।</span> এখানে থাকা ১৫০টি মিউজিক ট্র্যাক ওপেন ক্রিয়েটিভ কমনস (CC-BY 4.0) ও পাবলিক ডোমেইনের আওতাভুক্ত। আপনি YouTube, Facebook, TikTok, Instagram Reels এবং যেকোনো বাণিজ্যিক ভিডিওতে এগুলো কোনো প্রকার কপিরাইট স্ট্রাইকের ভয় ছাড়াই ব্যবহার করতে পারবেন।
              </p>
            </div>
          </div>

          {/* Section 1: Best Practices & Tips */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>ইউটিউব ও ফেসবুকে ব্যবহারের ৩টি নিয়ম</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#131824] border border-stone-800/90 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  ১
                </div>
                <div className="font-semibold text-xs text-stone-100">ক্রেডিট লাইন দিন</div>
                <p className="text-[11px] text-stone-400 leading-normal">
                  ভিডিওর ডেসক্রিপশনে নিচে দেওয়া যেকোনো একটি ক্রেডিট লাইন পেস্ট করে দিন। এতে আপনার ভিডিও সম্পূর্ণ নিরাপদ থাকে।
                </p>
              </div>

              <div className="bg-[#131824] border border-stone-800/90 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-xs text-stone-100">ভলিউম ১০%–২০% রাখুন</div>
                <p className="text-[11px] text-stone-400 leading-normal">
                  মূল ভয়েসের নিচে ব্যাকগ্রাউন্ড সাউন্ড ১০% থেকে ২০% এর মধ্যে রাখলে অডিও পরিষ্কার থাকে এবং অটো-বট কোনো ভুল ক্লেইম করে না।
                </p>
              </div>

              <div className="bg-[#131824] border border-stone-800/90 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  ৩
                </div>
                <div className="font-semibold text-xs text-stone-100">সহজ এডিটিং</div>
                <p className="text-[11px] text-stone-400 leading-normal">
                  ডাউনলোড করা MP3 ফাইলটি CapCut, Premiere Pro, InShot বা VN অ্যাপে সহজেই টাইমলাইনে যুক্ত করে এডিট করতে পারবেন।
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Copyable Attribution / Credit Templates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2 text-cyan-400">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>রেডিমেড ক্রেডিট লাইন (কপি করুন)</span>
              </h4>
              <span className="text-[11px] text-stone-400 hidden sm:inline">
                ভিডিও ডেসক্রিপশনে পেস্ট করার জন্য
              </span>
            </div>

            <div className="space-y-3">
              {/* Universal Credit Box */}
              <div className="bg-[#111622] border border-cyan-500/30 rounded-xl p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-cyan-300">
                      ১. ইউনিভার্সাল ক্রেডিট (সব প্ল্যাটফর্মের জন্য সেরা)
                    </span>
                    <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono">
                      Recommended
                    </span>
                  </div>

                  <button
                    id="copy-universal-credit-btn"
                    type="button"
                    onClick={() => handleCopy('universal', universalCreditText)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      copiedId === 'universal'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300 hover:text-cyan-200'
                    }`}
                  >
                    {copiedId === 'universal' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Credit</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#0b0e14] p-3 rounded-lg border border-stone-800/90 font-mono text-[11px] text-stone-300 whitespace-pre-line select-all leading-relaxed">
                  {universalCreditText}
                </div>
              </div>

              {/* YouTube Detailed Credit Box */}
              <div className="bg-[#111622] border border-stone-800 rounded-xl p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-stone-200">
                    ২. ইউটিউব ভিডিও ডেসক্রিপশন ক্রেডিট (YouTube Detailed)
                  </span>

                  <button
                    id="copy-yt-credit-btn"
                    type="button"
                    onClick={() => handleCopy('yt', youtubeDetailedCreditText)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      copiedId === 'yt'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-[#182030] hover:bg-[#202b42] border-stone-700 text-stone-200 hover:text-stone-100'
                    }`}
                  >
                    {copiedId === 'yt' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Credit</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#0b0e14] p-3 rounded-lg border border-stone-800/90 font-mono text-[11px] text-stone-300 whitespace-pre-line select-all leading-relaxed">
                  {youtubeDetailedCreditText}
                </div>
              </div>

              {/* Shorts & Reels One-Line Credit Box */}
              <div className="bg-[#111622] border border-stone-800 rounded-xl p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-stone-200">
                    ৩. শর্টস ও রিলস মিনি ক্রেডিট (Shorts / Reels / TikTok)
                  </span>

                  <button
                    id="copy-short-credit-btn"
                    type="button"
                    onClick={() => handleCopy('short', shortCreditText)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      copiedId === 'short'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-[#182030] hover:bg-[#202b42] border-stone-700 text-stone-200 hover:text-stone-100'
                    }`}
                  >
                    {copiedId === 'short' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Credit</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#0b0e14] p-3 rounded-lg border border-stone-800/90 font-mono text-[11px] text-stone-300 whitespace-pre-line select-all leading-relaxed">
                  {shortCreditText}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: FAQ */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2 text-cyan-400">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)</span>
            </h4>

            <div className="space-y-2.5">
              <div className="bg-[#121622] border border-stone-800/80 rounded-xl p-3.5 space-y-1">
                <div className="font-semibold text-xs text-stone-200 flex items-center gap-1.5">
                  <span className="text-cyan-400">Q:</span> আমার ভিডিওতে কি কপিরাইট স্ট্রাইক আসবে?
                </div>
                <p className="text-[11px] text-stone-400 leading-normal pl-4">
                  <span className="text-emerald-300 font-medium">কখনোই না।</span> কপিরাইট স্ট্রাইক শুধুমাত্র তখনই আসে যখন আপনি অনুমোদিত নয় এমন কপিরাইটযুক্ত গান ব্যবহার করেন। এই মিউজিকগুলো ওপেন সোর্স ও ক্রিয়েটিভ কমনস লাইসেন্সযুক্ত।
                </p>
              </div>

              <div className="bg-[#121622] border border-stone-800/80 rounded-xl p-3.5 space-y-1">
                <div className="font-semibold text-xs text-stone-200 flex items-center gap-1.5">
                  <span className="text-cyan-400">Q:</span> চ্যানেল বা ফেসবুক পেজ মনিটাইজ হবে?
                </div>
                <p className="text-[11px] text-stone-400 leading-normal pl-4">
                  <span className="text-emerald-300 font-medium">হ্যাঁ, ১০০% মনিটাইজ হবে।</span> আপনি এই ব্যাকগ্রাউন্ড মিউজিক ব্যবহার করে বাণিজ্যিকভাবে ইনকাম করতে পারবেন।
                </p>
              </div>

              <div className="bg-[#121622] border border-stone-800/80 rounded-xl p-3.5 space-y-1">
                <div className="font-semibold text-xs text-stone-200 flex items-center gap-1.5">
                  <span className="text-cyan-400">Q:</span> ফেসবুক বা ইউটিউবে অটো ক্লেইম (Content ID Match) দেখালে কী করব?
                </div>
                <p className="text-[11px] text-stone-400 leading-normal pl-4">
                  মাঝে মাঝে ফেসবুক বা ইউটিউবের বট স্বয়ংক্রিয়ভাবে অডিও ম্যাচ করতে পারে। যদি এমন হয়, সহজে "Dispute" বাটনে ক্লিক করে লাইসেন্স টাইপে <span className="font-mono text-cyan-300">Creative Commons CC-BY 4.0</span> এবং উপরের ক্রেডিট টেক্সটটি পেস্ট করে সাবমিট করলেই ২৪-৪৮ ঘণ্টার মধ্যে তা রিমুভ হয়ে যায়।
                </p>
              </div>
            </div>
          </div>

          {/* Official License Reference */}
          <div className="p-3 bg-[#0d1017] border border-stone-800/80 rounded-xl flex items-center justify-between text-[11px] text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Official License Standard: Creative Commons Attribution 4.0 International</span>
            </div>
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Verify</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-stone-800 bg-[#131926] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-400">
            Bangla AI Voice Generator (by PlayVear) — Safe, Creative & Royalty-Free
          </span>
          <button
            id="guide-modal-close-bottom-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
