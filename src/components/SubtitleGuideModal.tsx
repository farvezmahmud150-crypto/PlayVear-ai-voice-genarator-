import React, { useEffect } from 'react';
import {
  X,
  FileText,
  Clock,
  Sparkles,
  Layers,
  Youtube,
  Facebook,
  CheckCircle2,
  Tv,
  ArrowRight,
  Type,
} from 'lucide-react';

interface SubtitleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubtitleGuideModal: React.FC<SubtitleGuideModalProps> = ({ isOpen, onClose }) => {
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

  return (
    <div
      id="subtitle-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="subtitle-guide-modal-container"
        className="w-full max-w-3xl bg-[#0f141f] border border-stone-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800 bg-[#131926] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                <span>Subtitle Usage Guide</span>
                <span className="text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Auto-Synced .SRT
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                ভিডিও এডিটর ও সোশ্যাল মিডিয়ায় স্বয়ংক্রিয় সাবটাইটেল ব্যবহারের সহজ নিয়ম
              </p>
            </div>
          </div>

          <button
            id="close-subtitle-guide-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Close subtitle guide modal"
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin text-stone-200 text-xs sm:text-sm leading-relaxed">
          
          {/* Key Highlight Banner */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-[#101b22] to-fuchsia-950/40 border border-cyan-500/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3.5 items-start sm:items-center">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm sm:text-base font-bold text-cyan-300 mb-1">
                ভয়েসের সাথে ১০০% স্বয়ংক্রিয় টাইমিং সিঙ্ক করা
              </h4>
              <p className="text-stone-300 text-xs leading-normal">
                আপনি যখন <span className="font-semibold text-cyan-200">"Subtitle"</span> বাটনে ক্লিক করবেন, তখন আপনার জেনারেট হওয়া অডিওর সঠিক টাইমিং অনুযায়ী একটি স্ট্যান্ডার্ড <span className="font-mono text-cyan-300">.srt</span> ফাইল ডাউনলোড হবে। আপনাকে ভিডিও এডিটরে কোনো বাংলা টাইপ করতে হবে না।
              </p>
            </div>
          </div>

          {/* Section 1: Video Editor Usage Guide */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2 text-cyan-400">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>ভিডিও এডিটিং অ্যাপে ব্যবহারের সহজ ধাপ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* CapCut Guide */}
              <div className="bg-[#121622] border border-stone-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-100 flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    CapCut (মোবাইল ও পিসি)
                  </span>
                  <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                    Most Popular
                  </span>
                </div>
                <ol className="text-[11px] text-stone-300 space-y-1.5 list-decimal list-inside pl-1 leading-normal">
                  <li>CapCut ওপেন করে আপনার ভিডিও ও জেনারেট হওয়া MP3 টাইমলাইনে নিন।</li>
                  <li><strong>Text</strong> অপশন থেকে <strong>Auto Captions / Local Subtitle (SRT)</strong> সিলেক্ট করে ডাউনলোড করা ফাইলটি ইমপোর্ট করুন।</li>
                  <li>সাথে সাথে পুরো ভিডিওতে ডায়লগ অনুযায়ী বাংলা ক্যাপশন বসে যাবে।</li>
                </ol>
              </div>

              {/* Premiere Pro & Filmora */}
              <div className="bg-[#121622] border border-stone-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-100 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-fuchsia-400" />
                    Premiere Pro / Filmora / VN
                  </span>
                </div>
                <ol className="text-[11px] text-stone-300 space-y-1.5 list-decimal list-inside pl-1 leading-normal">
                  <li>ডাউনলোড করা <code>.srt</code> ফাইলটি সরাসরি প্রজেক্ট প্যানেলে ড্র্যাগ অ্যান্ড ড্রপ (Drag & Drop) করুন।</li>
                  <li>ফাইলটিকে টাইমলাইনের অডিও ট্র্যাকের ওপরে ড্রপ করলেই ক্যাপশন ট্র্যাক তৈরি হবে।</li>
                  <li>কোনো রকম সময় সমন্বয় ছাড়াই অডিওর সাথে ক্যাপশন সিঙ্ক হয়ে যাবে।</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Section 2: Bangla Stylish Font Customization */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2 text-cyan-400">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>বাংলা স্টাইলিশ ফন্ট ও টেক্সট অ্যানিমেশন</span>
            </h4>

            <div className="bg-[#111622] border border-stone-800 rounded-xl p-4 space-y-3">
              <p className="text-xs text-stone-300 leading-normal">
                আমাদের সাবটাইটেল ফাইলে রয়েছে ১০০% নির্ভুল বাংলা ইউনিকোড টেক্সট। তাই ভিডিও এডিটরে নেওয়ার পর আপনি এক ক্লিকেই যেকোনো বাংলা স্টাইলিশ ফন্ট সিলেক্ট করতে পারবেন:
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-[#0b0e14] p-2.5 rounded-lg border border-stone-800 text-center">
                  <span className="text-xs font-semibold text-stone-200">Li Alinur</span>
                  <span className="block text-[9px] text-stone-400">মডার্ন ও স্টাইলিশ</span>
                </div>
                <div className="bg-[#0b0e14] p-2.5 rounded-lg border border-stone-800 text-center">
                  <span className="text-xs font-semibold text-stone-200">Hind Siliguri</span>
                  <span className="block text-[9px] text-stone-400">পরিষ্কার ও আকর্ষণীয়</span>
                </div>
                <div className="bg-[#0b0e14] p-2.5 rounded-lg border border-stone-800 text-center">
                  <span className="text-xs font-semibold text-stone-200">Mayabi</span>
                  <span className="block text-[9px] text-stone-400">কাব্যিক ও সিনেম্যাটিক</span>
                </div>
                <div className="bg-[#0b0e14] p-2.5 rounded-lg border border-stone-800 text-center">
                  <span className="text-xs font-semibold text-stone-200">Kalpurush</span>
                  <span className="block text-[9px] text-stone-400">খবর ও ডকুমেন্টারি</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-cyan-300 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-500/20">
                <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>টিপস: CapCut-এ "Batch Edit" দিয়ে সব সাবটাইটেলে একসাথে ইয়েলো টেক্সট, ব্ল্যাক স্ট্রোক বা ওয়ার্ড-বাই-ওয়ার্ড পপ-আপ অ্যানিমেশন যুক্ত করতে পারবেন।</span>
              </div>
            </div>
          </div>

          {/* Section 3: Direct Upload to YouTube & Facebook */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>ইউটিউব ও ফেসবুকে সরাসরি সাবটাইটেল আপলোড</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#121622] border border-stone-800/80 rounded-xl p-3.5 space-y-1.5">
                <div className="font-semibold text-xs text-stone-200 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-400" />
                  YouTube Studio
                </div>
                <p className="text-[11px] text-stone-400 leading-normal">
                  ভিডিও আপলোডের সময় <strong>Video elements &gt; Add Subtitles &gt; Upload file (With timing)</strong> দিয়ে <code>.srt</code> ফাইলটি দিয়ে দিন। কোনো টাইপিং ছাড়াই ইউটিউব অটোমেটিক CC অন করে দেবে।
                </p>
              </div>

              <div className="bg-[#121622] border border-stone-800/80 rounded-xl p-3.5 space-y-1.5">
                <div className="font-semibold text-xs text-stone-200 flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 text-blue-400" />
                  Facebook Reels / Video
                </div>
                <p className="text-[11px] text-stone-400 leading-normal">
                  ফেসবুক ভিডিও আপলোডার বা Meta Business Suite-এ <strong>Captions &gt; Upload .srt file</strong> দিন। মোবাইলে সাউন্ড ছাড়া স্ক্রল করা দর্শকরাও সম্পূর্ণ ভিডিও দেখতে পারবে।
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-stone-800 bg-[#131926] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-400">
            One-Click Synchronized Subtitle Export
          </span>
          <button
            id="subtitle-guide-modal-close-bottom-btn"
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
