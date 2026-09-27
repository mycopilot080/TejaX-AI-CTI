import React, { useState, useRef, useEffect } from 'react';
import { Shield, ChevronDown, Check, Info, Lock, AlertTriangle, X } from 'lucide-react';
import { TLPLevel, TLP_CONFIGS, ALL_TLP_LEVELS, getTlpConfig } from '../types/tlp';

export interface TLPBadgeProps {
  level?: TLPLevel | string;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const TLPBadge: React.FC<TLPBadgeProps> = ({
  level = 'TLP:AMBER',
  size = 'sm',
  showIcon = true,
  className = '',
  onClick,
  title
}) => {
  const config = getTlpConfig(level);

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs'
  }[size];

  return (
    <span
      onClick={onClick}
      title={title || `${config.name}: ${config.sharingBoundary}`}
      className={`inline-flex items-center gap-1 font-mono font-bold rounded border transition-all ${config.badgeClasses} ${sizeClasses} ${
        onClick ? 'cursor-pointer hover:opacity-90 active:scale-95' : ''
      } ${className}`}
    >
      {showIcon && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
          style={{ backgroundColor: config.hexColor }}
        />
      )}
      <span>{config.level}</span>
    </span>
  );
};

export interface TLPSelectorProps {
  value?: TLPLevel | string;
  onChange: (newLevel: TLPLevel) => void;
  label?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

export const TLPSelector: React.FC<TLPSelectorProps> = ({
  value = 'TLP:AMBER',
  onChange,
  label = 'Customise TLP',
  size = 'sm',
  disabled = false,
  compact = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = getTlpConfig(value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (level: TLPLevel) => {
    onChange(level);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 rounded-lg border font-mono font-bold transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50 shadow-sm ${
            currentConfig.badgeClasses
          } ${
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:scale-95'}`}
          title={`Click to customise TLP classification (Current: ${currentConfig.name})`}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: currentConfig.hexColor }}
          />
          <span>{currentConfig.level}</span>
          {!compact && (
            <span className="text-[10px] font-sans font-medium text-slate-400 border-l border-slate-700/60 pl-1.5 ml-0.5">
              {label}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setInfoModalOpen(true);
          }}
          className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
          title="Learn about FIRST Traffic Light Protocol (TLP 2.0) guidelines"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl z-50 p-2 space-y-1 font-sans animate-fadeIn ring-1 ring-black/40">
          <div className="px-2.5 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                Customise TLP Classification
              </span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
              TLP 2.0 Standard
            </span>
          </div>

          <p className="px-2.5 py-1 text-[11px] text-slate-400">
            Select the appropriate Traffic Light Protocol sensitivity marking for sharing, export, and briefing governance:
          </p>

          <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5 py-1">
            {ALL_TLP_LEVELS.map((level) => {
              const cfg = TLP_CONFIGS[level];
              const isSelected = cfg.level === currentConfig.level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleSelect(level)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? `${cfg.badgeClasses} ring-1 ring-cyan-500/40`
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: cfg.hexColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-bold text-white">
                        {cfg.level}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                      {cfg.recipientScope}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {cfg.sharingBoundary}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Applies immediately to reports & exports</span>
            <button
              type="button"
              onClick={() => setInfoModalOpen(true)}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>TLP 2.0 Rules</span>
              <Info className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* TLP INFO MODAL */}
      {infoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  FIRST Traffic Light Protocol (TLP 2.0) Reference
                </h3>
              </div>
              <button
                onClick={() => setInfoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The Forum of Incident Response and Security Teams (FIRST) defines TLP as a set of designations used to ensure that sensitive cyber threat intelligence is shared only with appropriate audiences.
            </p>

            <div className="space-y-3">
              {ALL_TLP_LEVELS.map((level) => {
                const cfg = TLP_CONFIGS[level];
                return (
                  <div
                    key={level}
                    className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cfg.hexColor }}
                        />
                        <span className="font-mono font-bold text-xs text-white">
                          {cfg.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {cfg.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      <strong>Sharing Scope:</strong> {cfg.recipientScope}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {cfg.sharingBoundary}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
