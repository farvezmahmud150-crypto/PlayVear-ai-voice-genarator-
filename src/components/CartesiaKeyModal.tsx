import React, { useState } from 'react';
import { X, Key, ExternalLink, Check, Zap } from 'lucide-react';

interface CartesiaKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const CartesiaKeyModal: React.FC<CartesiaKeyModalProps> = ({
  isOpen,
  onClose,
  currentApiKey,
  onSaveApiKey,
}) => {
  const [keyInput, setKeyInput] = useState(currentApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="cartesia-key-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0f141e] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 gap-5 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                Cartesia AI Sonic (V3) Key
              </h3>
              <p className="text-xs text-stone-400">Configure Cartesia API Key for Ultra Fast Voice</p>
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

        {/* Info Box */}
        <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3.5 text-xs text-stone-300 leading-relaxed flex flex-col gap-2">
          <p className="font-medium text-purple-300">
            কার্টেসিয়া এপিআই কী দিলে আপনি ০.০৯ সেকেন্ডের আল্ট্রা-ফাস্ট Sonic V3 মডেল ব্যবহার করতে পারবেন।
          </p>
          <a
            href="https://play.cartesia.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 hover:underline font-semibold"
          >
            <span>কার্টেসিয়া থেকে ফ্রি API Key সংগ্রহ করুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Cartesia API Key:</span>
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="e.g. sk_car_..."
              className="w-full bg-[#161c28] border border-stone-700 hover:border-purple-500/50 focus:border-purple-400 text-stone-100 placeholder-stone-600 text-sm rounded-xl px-4 py-2.5 outline-none font-mono transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 active:scale-95 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save API Key</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
