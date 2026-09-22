import React, { useState, useRef, useEffect } from 'react';
import { CharacterId, CHARACTERS } from '../types.ts';
import { AudioWaveform, MoreVertical } from 'lucide-react';

interface HeaderProps {
  selectedCharacter: CharacterId;
  onSelectCharacter: (char: CharacterId) => void;
  onOpenHistory: () => void;
  onOpenBgMusic: () => void;
  onOpenMusicGuide: () => void;
  onOpenSubtitleGuide: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCharacter,
  onSelectCharacter,
  onOpenHistory,
  onOpenBgMusic,
  onOpenMusicGuide,
  onOpenSubtitleGuide,
  historyCount: _historyCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeChar = CHARACTERS.find((c) => c.id === selectedCharacter) || CHARACTERS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsMenuOpen(false);
      }
    };

    // Close on custom back-button event
    const handleCloseAllMenus = () => {
      setIsOpen(false);
      setIsMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('close-all-header-menus', handleCloseAllMenus);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('close-all-header-menus', handleCloseAllMenus);
    };
  }, []);

  const handleHistoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    onOpenHistory();
  };

  const handleBgMusicClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    onOpenBgMusic();
  };

  const handleMusicGuideClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    onOpenMusicGuide();
  };

  const handleSubtitleGuideClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    onOpenSubtitleGuide();
  };

  const renderThreeDotsButton = () => (
    <div ref={menuRef} className="relative">
      <button
        id="header-three-dots-menu-btn"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen((prev) => !prev);
        }}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-label="More options"
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
          isMenuOpen
            ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300'
            : 'bg-[#131823] hover:bg-[#1a2233] border-stone-800 hover:border-cyan-500/50 text-stone-300 hover:text-cyan-300'
        }`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* 3 Dots Menu Options */}
      {isMenuOpen && (
        <div
          id="header-options-dropdown"
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-52 bg-[#12161f] border border-stone-800 rounded-lg shadow-2xl z-50 p-1 flex flex-col backdrop-blur-md"
        >
          <button
            id="menu-option-history"
            type="button"
            role="menuitem"
            onPointerDown={handleHistoryClick}
            onClick={handleHistoryClick}
            className="w-full text-left px-3 py-2 text-xs font-medium text-stone-200 hover:text-cyan-300 hover:bg-stone-800/60 rounded cursor-pointer transition-colors"
          >
            History
          </button>
          <button
            id="menu-option-bg-music"
            type="button"
            role="menuitem"
            onPointerDown={handleBgMusicClick}
            onClick={handleBgMusicClick}
            className="w-full text-left px-3 py-2 text-xs font-medium text-stone-200 hover:text-cyan-300 hover:bg-stone-800/60 rounded cursor-pointer transition-colors"
          >
            Background Music
          </button>
          <button
            id="menu-option-subtitle-guide"
            type="button"
            role="menuitem"
            onPointerDown={handleSubtitleGuideClick}
            onClick={handleSubtitleGuideClick}
            className="w-full text-left px-3 py-2 text-xs font-medium text-stone-200 hover:text-cyan-300 hover:bg-stone-800/60 rounded cursor-pointer transition-colors border-t border-stone-800/80 mt-0.5 pt-2"
          >
            Subtitle Usage Guide
          </button>
          <button
            id="menu-option-music-guide"
            type="button"
            role="menuitem"
            onPointerDown={handleMusicGuideClick}
            onClick={handleMusicGuideClick}
            className="w-full text-left px-3 py-2 text-xs font-medium text-stone-200 hover:text-cyan-300 hover:bg-stone-800/60 rounded cursor-pointer transition-colors"
          >
            Music Usage & License Guide
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header
      id="main-header"
      className="w-full border-b border-stone-800/80 bg-[#0d1017]/90 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5 sm:px-6 shadow-sm"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Mobile top row: Brand Title on left, 3 dots menu on right */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div id="brand-header" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/25 to-fuchsia-500/15 border border-cyan-500/35 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.2)] shrink-0">
              <AudioWaveform className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-cyan-300 via-[80%] to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(34,211,238,0.35)] whitespace-nowrap">
                Bangla AI Voice Generator
              </span>
            </div>
          </div>

          {/* 3 Dots Menu on mobile view */}
          <div className="sm:hidden">
            {renderThreeDotsButton()}
          </div>
        </div>

        {/* Right Area: Character Dropdown + 3 Dots Menu on desktop */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Character Dropdown with custom Name and 9px Role display */}
          <div ref={dropdownRef} className="relative flex-1 sm:w-auto">
            <select
              id="character-dropdown"
              value={selectedCharacter}
              onChange={(e) => onSelectCharacter(e.target.value as CharacterId)}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            >
              {CHARACTERS.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name} — {char.role}
                </option>
              ))}
            </select>

            {/* Custom Trigger Button */}
            <button
              id="character-dropdown-trigger"
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              className="w-full sm:w-auto sm:min-w-[360px] bg-[#131823] text-stone-200 px-3.5 py-2 rounded-xl border border-cyan-500/30 hover:border-cyan-400/70 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 cursor-pointer transition-all shadow-sm flex items-center justify-between gap-3 text-left"
            >
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <span className="text-xs font-semibold text-stone-100 tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
                  {activeChar.name}
                </span>
                <span
                  className="text-[9px] text-stone-400 truncate leading-tight tracking-normal font-normal"
                  style={{ fontSize: '9px', lineHeight: '1.2' }}
                >
                  {activeChar.role}
                </span>
              </div>
              <div className={`text-cyan-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu Options */}
            {isOpen && (
              <div
                id="character-dropdown-menu"
                role="listbox"
                className="absolute top-full mt-1.5 right-0 w-full sm:w-[380px] max-h-[70vh] overflow-y-auto bg-[#111622] border border-cyan-500/40 rounded-xl shadow-2xl z-50 p-1.5 flex flex-col gap-1 backdrop-blur-xl"
              >
                {CHARACTERS.map((char) => {
                  const isSelected = char.id === selectedCharacter;
                  return (
                    <button
                      key={char.id}
                      id={`character-option-${char.id}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSelectCharacter(char.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition-all flex flex-col gap-0.5 cursor-pointer border ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                          : 'border-transparent hover:bg-stone-800/60 text-stone-200 hover:text-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wide text-stone-100">
                          {char.name}
                        </span>
                        {isSelected && (
                          <span
                            className="font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30"
                            style={{ fontSize: '8px' }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <span
                        className="text-[9px] text-stone-400 leading-snug font-normal"
                        style={{ fontSize: '9px', lineHeight: '1.3' }}
                      >
                        {char.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3 Dots Menu on desktop in the same header row */}
          <div className="hidden sm:block">
            {renderThreeDotsButton()}
          </div>
        </div>
      </div>
    </header>
  );
};
