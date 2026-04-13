'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense, useRef } from 'react';
import {
  Check,
  BookOpen,
  Lightbulb,
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight,
  Copy,
  Award,
  BarChart3,
  Download,
  X,
  RotateCcw,
  Mail,
  AlertCircle,
  Users,
  Palette,
  Moon,
  Waves,
  TreePine,
  Sun,
  Sparkles,
  Cloud,
  LogOut,
  Star,
  AlertTriangle,
  ClipboardList,
  Save,
  Trash2,
  Clock,
  CheckCircle2,
  Flame,
  Zap,
  Trophy,
  WifiOff,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ==================== THEME DATA (Enhanced with icons & descriptions) ====================
type ThemeIcon = 'moon' | 'waves' | 'trees' | 'sun' | 'sparkles' | 'cloud';

const THEMES: { id: string; label: string; description: string; color: string; bg: string; textColor: string; icon: ThemeIcon }[] = [
  { id: 'midnight-gold', label: 'Midnight Gold', description: 'Bold & brilliant on deep black', color: '#FFEA00', bg: '#000000', textColor: '#ffffff', icon: 'moon' },
  { id: 'ocean-deep', label: 'Ocean Deep', description: 'Calm depths of the sea', color: '#00d4ff', bg: '#0a0f1a', textColor: '#e8f4fd', icon: 'waves' },
  { id: 'forest-calm', label: 'Forest Calm', description: 'Peaceful woodland greens', color: '#76ff03', bg: '#0a110a', textColor: '#e8f5e9', icon: 'trees' },
  { id: 'sunset-ember', label: 'Sunset Ember', description: 'Warm glow of evening', color: '#ff6d00', bg: '#1a0a0a', textColor: '#fff5f0', icon: 'sun' },
  { id: 'lavender-dream', label: 'Lavender Dream', description: 'Gentle purple twilight', color: '#e040fb', bg: '#0f0a1a', textColor: '#f3e8ff', icon: 'sparkles' },
  { id: 'arctic-light', label: 'Arctic Light', description: 'Clean & bright daylight', color: '#0ea5e9', bg: '#f8fafc', textColor: '#0f172a', icon: 'cloud' },
];

const THEME_ICONS: Record<ThemeIcon, React.ReactNode> = {
  moon: <Moon className="h-4 w-4" />,
  waves: <Waves className="h-4 w-4" />,
  trees: <TreePine className="h-4 w-4" />,
  sun: <Sun className="h-4 w-4" />,
  sparkles: <Sparkles className="h-4 w-4" />,
  cloud: <Cloud className="h-4 w-4" />,
};

// ==================== TYPES ====================
interface SoapData {
  scripture: string;
  observation: string;
  application: string;
  prayer: string;
}

interface DayData {
  readingComplete: boolean;
  soap: SoapData;
  prayers: Record<string, string>;
  checkedBy: string;
}

interface QuizState {
  answer: string;
  submitted: boolean;
  correct: boolean;
  accuracy: number;
}

interface QuizHistoryEntry {
  accuracy: number;
  timestamp: string;
}

interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

interface ScheduleEntry {
  day: string;
  chapter: string;
  soapRange: string;
  soapText: string;
}

interface Prayer {
  title: string;
  prompt: string;
}

interface HistoryEntry {
  timestamp: string;
  data: Record<string, DayData>;
}

interface BadgeNotification {
  id: string;
  label: string;
  emoji: string;
}

interface StudentInfo {
  name: string;
  weekData: Record<string, DayData>;
  streak: number;
  quizHistory: Record<string, QuizHistoryEntry>;
  badges: string[];
  studentId: string;
  email?: string;
}

interface ClipboardEntry {
  id: string;
  text: string;
  label: string;
  timestamp: string;
}

type DayStatus = 'done' | 'past-due' | 'due-today' | 'current' | 'future';

// ==================== CONSTANTS ====================
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SCHEDULE: ScheduleEntry[] = [
  { day: 'Monday', chapter: 'John 1', soapRange: 'John 3:1-3', soapText: 'Nicodemus came to Jesus at night...' },
  { day: 'Tuesday', chapter: 'John 2', soapRange: 'John 3:4-6', soapText: 'How can someone be born when they are old?...' },
  { day: 'Wednesday', chapter: 'John 3', soapRange: 'John 3:7-9', soapText: 'The wind blows wherever it pleases...' },
  { day: 'Thursday', chapter: 'John 4', soapRange: 'John 3:10-12', soapText: "You are Israel's teacher...we speak of what we know..." },
  { day: 'Friday', chapter: 'John 5', soapRange: 'John 3:13-15', soapText: 'No one has ever gone into heaven except the one who came from heaven...' },
  { day: 'Saturday', chapter: 'John 6', soapRange: 'John 3:16-18', soapText: 'For God so loved the world that he gave his one and only Son...' },
  { day: 'Sunday', chapter: 'John 7', soapRange: 'John 3:19-21', soapText: 'This is the verdict: Light has come into the world...' },
];

const PRAYERS: Prayer[] = [
  { title: 'See Prayer', prompt: "What is God showing you in today's reading? What does He want you to see?" },
  { title: 'Surrender Prayer', prompt: 'How will you surrender to what God is teaching you today?' },
  { title: 'Send Prayer', prompt: 'How will you live out this truth? Who needs to see Jesus in you this week?' },
];

const MEMORY_VERSE = 'In the beginning was the Word, and the Word was with God, and the Word was God. In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it.';
const MEMORY_REFERENCE = 'John 1:1-5';

const ALL_BADGES: Badge[] = [
  { id: 'perfect-week', label: 'Perfect Week!', emoji: '\u2B50', description: 'Complete all 7 days with full SOAP entries' },
  { id: 'streak', label: 'On Fire!', emoji: '\uD83D\uDD25', description: 'Complete 5 or more days in a single week' },
  { id: 'memory-master', label: 'Memory Master', emoji: '\uD83E\uDDE0', description: 'Achieve 80%+ accuracy on the memory verse quiz' },
  { id: 'consistency', label: 'Consistent', emoji: '\uD83D\uDCAA', description: 'Maintain a streak of 2 or more weeks' },
];

const SOAP_FIELDS: { key: keyof SoapData; label: string }[] = [
  { key: 'scripture', label: 'S: Scripture \u2014 What verse stands out?' },
  { key: 'observation', label: 'O: Observation \u2014 What do you notice?' },
  { key: 'application', label: 'A: Application \u2014 How does this apply to YOUR life?' },
  { key: 'prayer', label: 'P: Prayer \u2014 Pray your response to God' },
];

const TEACHER_PASSWORD = '/123';

// ==================== UTILITY FUNCTIONS ====================

/** Compute today's index mapped to Mon=0, Tue=1, ..., Sun=6 */
function getTodayIndex(): number {
  const jsDay = new Date().getDay(); // Sun=0, Mon=1, ..., Sat=6
  return jsDay === 0 ? 6 : jsDay - 1;
}

/** Check if a DayData has any SOAP content (non-empty string in any field) */
function hasSoapContent(dayData: DayData | undefined): boolean {
  if (!dayData?.soap) return false;
  return Object.values(dayData.soap).some((v) => typeof v === 'string' && v.trim().length > 0);
}

/**
 * Determine the status of a day based on its index and data.
 * - "done": reading complete AND has SOAP content
 * - "past-due": index < today AND NOT done
 * - "due-today": index === today AND NOT done
 * - "current": index === today (selected active)
 * - "future": index > today
 */
function getDayStatus(dayIndex: number, dailyData: Record<string, DayData>): DayStatus {
  const todayIdx = getTodayIndex();
  const dayName = DAYS[dayIndex];
  const dayData = dailyData[dayName];
  const isDone = dayData?.readingComplete === true && hasSoapContent(dayData);

  if (isDone) return 'done';
  if (dayIndex < todayIdx) return 'past-due';
  if (dayIndex === todayIdx) return 'due-today';
  return 'future';
}

/** Get relative time string (e.g., "2 min ago", "just now") */
function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
}

/** Generate a simple unique ID */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/** Safe localStorage wrapper with error handling, retry, and logging */
const STORAGE_RETRIES = 2;
const STORAGE_RETRY_DELAY = 100;

function safeGetItem(key: string, fallback: string | null = null): string | null {
 try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[Habits Storage] Failed to read '${key}':`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

function safeSetItem(key: string, value: string, retries = STORAGE_RETRIES): boolean {
 for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      if (attempt < retries) {
        console.warn(`[Habits Storage] Write attempt ${attempt + 1} failed for '${key}', retrying...`);
        // Exponential backoff: 100ms, 200ms
        const backoff = new Promise<void>(r => setTimeout(r, STORAGE_RETRY_DELAY * Math.pow(2, attempt)));
        // Synchronous fallback - just try again immediately
        continue;
      }
      console.error(`[Habits Storage] Failed to write '${key}' after ${retries} retries:`, err instanceof Error ? err.message : err);
      return false;
    }
  }
  return false;
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Habits Storage] Failed to remove '${key}':`, err instanceof Error ? err.message : err);
  }
}

function safeParseJSON<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch (err) {
    console.warn('[Habits Storage] Failed to parse JSON:', err instanceof Error ? err.message : err);
    return fallback;
  }
}

/** Focus trap hook for modals */
function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    // Save previously focused element
    const previouslyFocused = document.activeElement as HTMLElement;

    // Focus the first focusable element in the container
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const firstFocusable = container.querySelector<HTMLElement>(focusableSelector);
    if (firstFocusable) {
      requestAnimationFrame(() => firstFocusable.focus());
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Trigger close by clicking the close button if available
        const closeBtn = container.querySelector<HTMLButtonElement>('[aria-label*="Close"], [aria-label*="close"]');
        if (closeBtn) closeBtn.click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscape);
      // Restore focus
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
}

/** Auto-scroll container to center a child element */
function useAutoScroll<T extends HTMLElement>(trigger: unknown) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const activeChild = container.querySelector<HTMLElement>('[data-active="true"]');
    if (activeChild) {
      const containerRect = container.getBoundingClientRect();
      const childRect = activeChild.getBoundingClientRect();
      const scrollLeft = container.scrollLeft + childRect.left - containerRect.left - (containerRect.width / 2) + (childRect.width / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [trigger]);

  return ref;
}

// ==================== THEME SELECTOR COMPONENT (Enhanced with animation & toast) ====================
const ThemeSelector = React.memo(function ThemeSelector({ currentTheme, setTheme }: { currentTheme: string; setTheme: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const activeTheme = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  const handleSelect = (themeId: string) => {
    setTheme(themeId);
    const theme = THEMES.find((t) => t.id === themeId);
    if (theme) {
      setToastMsg(`Theme changed to ${theme.label}`);
      setTimeout(() => setToastMsg(''), 2000);
    }
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[70]">
      {open && (
        <div
          className="absolute bottom-16 right-0 p-4 rounded-2xl shadow-2xl shadow-black/40 border-2 w-72 modal-content"
          style={{
            backgroundColor: 'var(--th-bg-card)',
            borderColor: 'var(--th-border)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--th-text-secondary)' }}>Theme</p>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg" style={{ color: 'var(--th-text-muted)' }}>
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {THEMES.map((t) => {
              const isActive = t.id === currentTheme;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className="theme-option w-full flex items-center gap-3 p-3 rounded-xl text-left"
                  style={{
                    backgroundColor: isActive ? t.color + '18' : 'transparent',
                    border: `2px solid ${isActive ? t.color : 'transparent'}`,
                    transform: isActive ? 'scale(1)' : undefined,
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: t.color, color: t.bg }}
                  >
                    {THEME_ICONS[t.icon]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold leading-tight" style={{ color: t.color }}>{t.label}</p>
                    <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--th-text-muted)' }}>{t.description}</p>
                  </div>
                  {isActive && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.color, color: t.bg }}>
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {toastMsg && (
        <div className="absolute bottom-16 right-0 mb-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider slide-in-right" style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}>
          {toastMsg}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-[0.95] border-2"
        style={{
          backgroundColor: activeTheme.color,
          color: activeTheme.bg,
          borderColor: 'var(--th-border)',
          boxShadow: `0 0 20px ${activeTheme.color}40`,
        }}
        aria-label={`Change theme (current: ${activeTheme.label})`}
        title={activeTheme.label}
      >
        {THEME_ICONS[activeTheme.icon]}
      </button>
    </div>
  );
});

// ==================== CLIPBOARD HISTORY MODAL ====================
const ClipboardHistoryModal = React.memo(function ClipboardHistoryModal({
  show,
  onClose,
  clipboardHistory,
  onDeleteEntry,
  onClearAll,
}: {
  show: boolean;
  onClose: () => void;
  clipboardHistory: ClipboardEntry[];
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
}) {
  const trapRef = useFocusTrap(show);

  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div ref={trapRef} role="dialog" aria-modal="true" aria-label="Clipboard history"
        className="rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl shadow-black/30 border-2 modal-content" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl flex items-center gap-2" style={{ color: 'var(--th-accent)' }}>
            <ClipboardList className="h-5 w-5" /> Clipboard
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }} aria-label="Close clipboard">
            <X className="h-5 w-5" style={{ color: 'var(--th-text)' }} />
          </button>
        </div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--th-text-muted)' }}>
            {clipboardHistory.length} / 20 entries
          </p>
          {clipboardHistory.length > 0 && (
            <button onClick={onClearAll} className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-[0.97]" style={{ color: 'var(--th-danger)', backgroundColor: 'var(--th-danger)' + '15' }}>
              <Trash2 className="h-3 w-3" /> Clear All
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {clipboardHistory.length === 0 && (
            <div className="text-center py-8">
              <ClipboardList className="h-10 w-10 mx-auto mb-2" style={{ color: 'var(--th-text-muted)', opacity: 0.3 }} />
              <p className="text-xs" style={{ color: 'var(--th-text-muted)' }}>No clipboard entries yet</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--th-text-muted)' }}>Copy SOAP entries or prayers to see them here</p>
            </div>
          )}
          {clipboardHistory.map((entry) => (
            <div key={entry.id} className="clipboard-item border-2 p-3 rounded-xl" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg-card)' }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--th-accent)' }}>{entry.label}</p>
                <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--th-text-muted)' }}>
                  <Clock className="h-3 w-3" /> {getRelativeTime(entry.timestamp)}
                </span>
              </div>
              <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--th-text-secondary)', wordBreak: 'break-word' }}>
                {entry.text.length > 120 ? entry.text.slice(0, 120) + '...' : entry.text}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(entry.text).catch(() => {});
                  }}
                  className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-[0.97]"
                  style={{ color: 'var(--th-accent)', backgroundColor: 'var(--th-accent-dim)' }}
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-[0.97]"
                  style={{ color: 'var(--th-danger)', backgroundColor: 'var(--th-danger)' + '15' }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ==================== MODAL COMPONENTS ====================
const ReflectBackModal = React.memo(function ReflectBackModal({
  show,
  onClose,
  dailyData,
  currentWeek,
}: {
  show: boolean;
  onClose: () => void;
  dailyData: Record<string, DayData>;
  currentWeek: number;
}) {
  const trapRef = useFocusTrap(show);

  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div ref={trapRef} role="dialog" aria-modal="true" aria-label="Week reflection"
        className="rounded-2xl p-4 sm:p-6 max-w-4xl w-full my-8 shadow-2xl shadow-black/30 border-2 modal-content" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl" style={{ color: 'var(--th-accent)' }}>
            Week {currentWeek} Reflection
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }} aria-label="Close reflection">
            <X className="h-5 w-5" style={{ color: 'var(--th-text)' }} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {DAYS.map((day, idx) => {
            const d = dailyData[day];
            const status = getDayStatus(idx, dailyData);
            return (
              <div key={day} className="rounded-xl p-3 sm:p-4 border-2" style={{ borderColor: status === 'done' ? 'var(--th-success)' : status === 'past-due' ? 'var(--th-danger)' : 'var(--th-border)', backgroundColor: status === 'done' ? 'var(--th-accent-dim)' : status === 'past-due' ? 'rgba(239,68,68,0.08)' : 'var(--th-bg-elevated)' }}>
                <p className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: status === 'done' ? 'var(--th-success)' : status === 'past-due' ? 'var(--th-danger)' : 'var(--th-accent)' }}>
                  {status === 'done' && <Star className="h-3 w-3" style={{ color: 'var(--th-success)' }} />}
                  {status === 'past-due' && <AlertTriangle className="h-3 w-3 pulse-warning" style={{ color: 'var(--th-danger)' }} />}
                  {day.toUpperCase()}
                </p>
                <div className="text-xs space-y-1" style={{ color: 'var(--th-text-secondary)' }}>
                  <p><span style={{ color: 'var(--th-accent)' }}>S:</span> {d?.soap?.scripture?.slice(0, 50) || 'Empty'}{d?.soap?.scripture?.length > 50 ? '...' : ''}</p>
                  <p><span style={{ color: 'var(--th-accent)' }}>O:</span> {d?.soap?.observation?.slice(0, 50) || 'Empty'}{d?.soap?.observation?.length > 50 ? '...' : ''}</p>
                  <p><span style={{ color: 'var(--th-accent)' }}>A:</span> {d?.soap?.application?.slice(0, 50) || 'Empty'}{d?.soap?.application?.length > 50 ? '...' : ''}</p>
                  <p><span style={{ color: 'var(--th-accent)' }}>P:</span> {d?.soap?.prayer?.slice(0, 50) || 'Empty'}{d?.soap?.prayer?.length > 50 ? '...' : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-4 rounded-xl border-2 text-xs" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>
          <p>Growth Arc: {DAYS.length} days of spiritual reflection across John 3:1-21. Each S.O.A.P. entry captures your journey from Scripture to Prayer.</p>
        </div>
      </div>
    </div>
  );
});

const BadgesModal = React.memo(function BadgesModal({
  show,
  onClose,
  earnedBadges,
}: {
  show: boolean;
  onClose: () => void;
  earnedBadges: string[];
}) {
  const trapRef = useFocusTrap(show);

  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div ref={trapRef} role="dialog" aria-modal="true" aria-label="Your badges"
        className="rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl shadow-black/30 border-2 modal-content" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl" style={{ color: 'var(--th-accent)' }}>Your Badges</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }} aria-label="Close badges">
            <X className="h-5 w-5" style={{ color: 'var(--th-text)' }} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {ALL_BADGES.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 border-2 text-center rounded-xl transition-all ${isEarned ? 'badge-unlock' : ''}`}
                style={{
                  borderColor: isEarned ? 'var(--th-accent)' : 'var(--th-border)',
                  backgroundColor: isEarned ? 'var(--th-accent-dim)' : 'var(--th-bg-card)',
                  opacity: isEarned ? 1 : 0.4,
                }}
              >
                <p className="text-3xl mb-2">{isEarned ? badge.emoji : '?'}</p>
                <p className="text-sm font-bold" style={{ color: isEarned ? 'var(--th-accent)' : 'var(--th-text-muted)' }}>
                  {badge.label}
                </p>
                <p className="text-[10px] mt-1 leading-tight" style={{ color: 'var(--th-text-muted)' }}>{badge.description}</p>
                {isEarned && <p className="text-xs mt-2 font-bold" style={{ color: 'var(--th-success)' }}>Earned!</p>}
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-3 rounded-xl border text-xs" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>
          <p>Complete activities to unlock badges. Each badge represents a milestone in your spiritual journey!</p>
        </div>
      </div>
    </div>
  );
});

const MemorizationMeterModal = React.memo(function MemorizationMeterModal({
  show,
  onClose,
  score,
  attemptCount,
}: {
  show: boolean;
  onClose: () => void;
  score: number;
  attemptCount: number;
}) {
  const trapRef = useFocusTrap(show);

  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);

  if (!show) return null;
  const tier = score >= 80 ? 'master' : score >= 50 ? 'progress' : 'beginner';
  const tierLabel = score >= 80 ? 'Memory Master!' : score >= 50 ? 'Getting There!' : 'Keep Practicing!';
  const tierColor = score >= 80 ? 'var(--th-success)' : score >= 50 ? 'var(--th-accent)' : 'var(--th-danger)';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl shadow-black/30 border-2 modal-content" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl" style={{ color: 'var(--th-accent)' }}>Memorization Meter</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }} aria-label="Close meter">
            <X className="h-5 w-5" style={{ color: 'var(--th-text)' }} />
          </button>
        </div>
        <div className="text-center mb-6">
          <p className="text-5xl font-black mb-2" style={{ color: tierColor }}>{score}%</p>
          <p className="text-sm font-bold" style={{ color: tierColor }}>{tierLabel}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--th-text-secondary)' }}>Average quiz accuracy across {attemptCount} attempt{attemptCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="w-full h-4 rounded-full mb-6 overflow-hidden" style={{ backgroundColor: 'var(--th-bg-input)' }}>
          <div className="h-4 rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: tierColor }} />
        </div>
        <div className="space-y-3">
          {[
            { range: '80-100%', label: 'Memory Master', desc: 'You\'ve memorized the verse!', color: 'var(--th-success)', active: tier === 'master' },
            { range: '50-79%', label: 'Progress', desc: 'You\'re making great progress!', color: 'var(--th-accent)', active: tier === 'progress' },
            { range: '0-49%', label: 'Beginner', desc: 'Repetition builds memory.', color: 'var(--th-danger)', active: tier === 'beginner' },
          ].map((t) => (
            <div key={t.range} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: t.active ? t.color + '15' : 'transparent', border: `1px solid ${t.active ? t.color : 'transparent'}` }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
              <div className="flex-1">
                <p className="text-xs font-bold" style={{ color: t.color }}>{t.range} {t.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--th-text-muted)' }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ==================== ONBOARDING MODAL (Enhanced with theme icons & descriptions) ====================
const OnboardingModal = React.memo(function OnboardingModal({
  currentTheme,
  onThemeSelect,
  onComplete,
}: {
  currentTheme: string;
  onThemeSelect: (t: string) => void;
  onComplete: (name: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const handleNameSubmit = () => {
    if (name.trim()) setStep(1);
  };

  const handleThemeConfirm = () => {
    onComplete(name.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.97)' }}>
      <div className="rounded-2xl p-6 sm:p-10 max-w-md w-full shadow-2xl border-2 modal-content" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        {step === 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}>
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--th-text-muted)' }}>Habits Class</span>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl mb-3" style={{ color: 'var(--th-accent)', fontFamily: "'DM Serif Display', serif" }}>
                Welcome
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
                What&apos;s your name? This helps your teacher track your spiritual growth journey throughout the week.
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNameSubmit(); }}
                placeholder="Enter your name"
                className="w-full px-5 py-4 rounded-xl border-2 focus:outline-none text-base"
                style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                autoFocus
              />
              <button
                onClick={handleNameSubmit}
                className="w-full font-bold uppercase py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-30 text-sm tracking-wider"
                style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}
                disabled={!name.trim()}
              >
                Choose My Theme &rarr;
              </button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--th-accent)' }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--th-border)' }} />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--th-text-muted)' }}>Choose Your Style</span>
              <span className="text-xs" style={{ color: 'var(--th-text-muted)' }}>{name}</span>
            </div>
            <p className="text-xs leading-relaxed -mt-2" style={{ color: 'var(--th-text-secondary)' }}>
              Pick a theme that inspires your daily devotionals. You can always change it later.
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-[340px] overflow-y-auto no-scrollbar pr-1">
              {THEMES.map((t) => {
                const isActive = t.id === currentTheme;
                return (
                  <button
                    key={t.id}
                    onClick={() => onThemeSelect(t.id)}
                    className="p-3 rounded-xl border-2 transition-all active:scale-[0.97] text-left"
                    style={{
                      borderColor: isActive ? t.color : 'var(--th-border)',
                      backgroundColor: isActive ? t.color + '15' : 'var(--th-bg-card)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.color, color: t.bg }}>
                        {THEME_ICONS[t.icon]}
                      </span>
                      <span className="text-xs font-bold leading-tight" style={{ color: t.color }}>{t.label}</span>
                    </div>
                    <p className="text-[10px] leading-tight" style={{ color: 'var(--th-text-muted)' }}>{t.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              <button
                onClick={handleThemeConfirm}
                className="w-full font-bold uppercase py-4 rounded-xl transition-all active:scale-[0.98] text-sm tracking-wider flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}
              >
                <Sparkles className="h-4 w-4" /> Start My Journey
              </button>
              <button onClick={() => setStep(0)} className="w-full text-xs font-bold uppercase py-2 rounded-xl transition-colors" style={{ color: 'var(--th-text-muted)' }}>
                &larr; Back
              </button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--th-border)' }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--th-accent)' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ==================== TEACHER LOGIN MODAL ====================
const TeacherLoginModal = React.memo(function TeacherLoginModal({
  onClose,
  onLogin,
}: {
  onClose: () => void;
  onLogin: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <div className="rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl shadow-black/30 border-2 modal-content" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl" style={{ color: 'var(--th-accent)' }}>Teacher Access</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }} aria-label="Close teacher login">
            <X className="h-5 w-5" style={{ color: 'var(--th-text)' }} />
          </button>
        </div>
        <p className="mb-4 text-sm" style={{ color: 'var(--th-text-secondary)' }}>Enter the teacher password to view the dashboard.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (password === TEACHER_PASSWORD) onLogin();
              else setError(true);
            }
          }}
          placeholder="Password"
          className="w-full px-4 py-3 mb-4 rounded-xl border-2 focus:outline-none"
          style={{ backgroundColor: 'var(--th-bg-input)', borderColor: error ? 'var(--th-danger)' : 'var(--th-border)', color: 'var(--th-text)' }}
          autoFocus
        />
        {error && <p className="text-xs mb-4" style={{ color: 'var(--th-danger)' }}>Incorrect password. Try again.</p>}
        <button
          onClick={() => { if (password === TEACHER_PASSWORD) onLogin(); else setError(true); }}
          className="w-full font-bold uppercase py-3 rounded-xl transition-all active:scale-[0.98]"
          style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}
        >
          Login
        </button>
      </div>
    </div>
  );
});

// ==================== TEACHER DASHBOARD COMPONENT ====================
const TeacherDashboardPanel = React.memo(function TeacherDashboardPanel({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [classData, setClassData] = useState<Record<string, StudentInfo>>({});
  const [selectedStudent, setSelectedStudent] = useState<[string, StudentInfo] | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [parentEmailMode, setParentEmailMode] = useState(false);
  const [selectedStudentForEmail, setSelectedStudentForEmail] = useState<[string, StudentInfo] | null>(null);

  /** Load student data from localStorage */
  const loadStudentData = useCallback(() => {
    const students: Record<string, StudentInfo> = {};
    const seenIds = new Set<string>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const match = key.match(/^(student_[^_]+_[^_]+)_habitsWeek\d+Daily$/);
      if (match) {
        const sid = match[1];
        if (seenIds.has(sid)) continue;
        seenIds.add(sid);
        try {
          const weekData = JSON.parse(localStorage.getItem(key) || '{}');
          const streak = parseInt(localStorage.getItem(`${sid}_streak`) || '0', 10) || 0;
          const quizHistory = JSON.parse(localStorage.getItem(`${sid}_quizHistory`) || '{}');
          const badges = JSON.parse(localStorage.getItem(`${sid}_badges`) || '[]');
          const name = localStorage.getItem(`${sid}_name`) || `Student ${Object.keys(students).length + 1}`;
          students[sid] = { name, weekData, streak, quizHistory, badges, studentId: sid };
        } catch {
          // Skip corrupt entries
        }
      }
    }

    const oldKey = 'habitsWeek1Daily';
    const oldData = localStorage.getItem(oldKey);
    if (oldData && Object.keys(students).length === 0) {
      try {
        const parsed = JSON.parse(oldData) as Record<string, DayData>;
        students['student_legacy'] = {
          name: 'Legacy Student', weekData: parsed,
          streak: parseInt(localStorage.getItem('habitsStreak') || '0', 10) || 0,
          quizHistory: JSON.parse(localStorage.getItem('habitsQuizHistory') || '{}'),
          badges: JSON.parse(localStorage.getItem('habitsBadges') || '[]'),
          studentId: 'student_legacy',
        };
      } catch {
        // Skip corrupt legacy data
      }
    }
    setClassData(students);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => { loadStudentData(); });
  }, [currentWeek, loadStudentData]);

  const metrics = useMemo(() => {
    const entries = Object.entries(classData);
    const total = entries.length;
    if (total === 0) return { totalStudents: 0, avgCompletion: 0, avgSoapQuality: 0, dailyCompletion: {} as Record<string, number>, behindStudents: [] as [string, StudentInfo][] };
    const dailyCompletion: Record<string, number> = {};
    DAYS.forEach((day) => {
      const completed = entries.filter(([, d]) => d.weekData?.[day]?.readingComplete).length;
      dailyCompletion[day] = Math.round((completed / total) * 100);
    });
    const overallCompletion = entries.map(([, d]) => (DAYS.filter((day) => d.weekData?.[day]?.readingComplete).length / DAYS.length) * 100);
    const avgCompletion = Math.round(overallCompletion.reduce((a, b) => a + b, 0) / overallCompletion.length);
    const soapQuality = entries.map(([, d]) => (DAYS.filter((day) => { const soap = d.weekData?.[day]?.soap; return soap?.scripture && soap?.observation && soap?.application && soap?.prayer; }).length / DAYS.length) * 100);
    const avgSoapQuality = Math.round(soapQuality.reduce((a, b) => a + b, 0) / soapQuality.length);
    const behindStudents = entries.filter(([, d]) => DAYS.filter((day) => d.weekData?.[day]?.readingComplete).length < 4);
    return { totalStudents: total, avgCompletion, avgSoapQuality, dailyCompletion, behindStudents };
  }, [classData]);

  /** Generate a text report for a student */
  const generateStudentReport = useCallback((_studentId: string, studentData: StudentInfo) => {
    const completedDays = DAYS.filter((d) => studentData.weekData?.[d]?.readingComplete).length;
    const completionPct = Math.round((completedDays / DAYS.length) * 100);
    const quizScores = Object.values(studentData.quizHistory || {}).filter((q) => q?.accuracy).map((q) => q.accuracy);
    const avgQuiz = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b) / quizScores.length) : 0;
    return `HABITS CLASS - STUDENT PROGRESS REPORT\nWeek ${currentWeek}\n\nStudent: ${studentData.name}\nDate: ${new Date().toLocaleDateString()}\n\n=== COMPLETION ===\nDays Completed: ${completedDays}/7 (${completionPct}%)\nBible: John 1-7\n\n=== SPIRITUAL REFLECTIONS ===\n${DAYS.map((day) => { const soap = studentData.weekData?.[day]?.soap; if (soap?.scripture) return `${day}:\nScripture: ${soap.scripture.slice(0, 60)}...\nApplication: ${soap.application.slice(0, 60)}...`; return `${day}: [Not yet completed]`; }).join('\n')}\n\n=== WEEKLY SUMMARY ===\nStreak: ${studentData.streak} weeks\nQuiz Accuracy: ${avgQuiz}%\nStatus: ${completionPct === 100 ? 'PERFECT WEEK!' : completionPct >= 75 ? 'On Track' : 'Needs Support'}\n\n---\nThis report generated by Habits Class`.trim();
  }, [currentWeek]);

  /** Download student report as text file */
  const downloadParentReport = useCallback((studentId: string, studentData: StudentInfo) => {
    const report = generateStudentReport(studentId, studentData);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `Habits_Report_${studentData.name.replace(/\s+/g, '_')}_Week${currentWeek}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [generateStudentReport, currentWeek]);

  /** Open email client with student report */
  const sendParentEmail = useCallback((studentId: string, studentData: StudentInfo) => {
    const report = generateStudentReport(studentId, studentData);
    const mailtoLink = `mailto:?subject=Habits Class Progress Report - ${studentData.name}&body=${encodeURIComponent(`Dear Parent,\n\nHere's ${studentData.name}'s weekly progress:\n\n${report}\n\nBest regards,\nHabits Class Teacher`)}`;
    window.location.href = mailtoLink;
  }, [generateStudentReport]);

  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom)]" style={{ backgroundColor: 'var(--th-bg)', color: 'var(--th-text)' }}>
      {parentEmailMode && selectedStudentForEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 modal-content" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
            <h2 className="text-xl sm:text-2xl mb-6" style={{ color: 'var(--th-accent)' }}>Send to Parents</h2>
            <div className="rounded-xl p-4 mb-6 border-2" style={{ backgroundColor: 'var(--th-bg-elevated)', borderColor: 'var(--th-border)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--th-text-secondary)' }}>Student: <span className="font-bold" style={{ color: 'var(--th-text)' }}>{selectedStudentForEmail[1].name}</span></p>
              <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>Email: <span className="font-bold" style={{ color: 'var(--th-text)' }}>{selectedStudentForEmail[1].email || 'Not provided'}</span></p>
            </div>
            <div className="space-y-3">
              <button onClick={() => sendParentEmail(selectedStudentForEmail[0], selectedStudentForEmail[1])} className="w-full font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-success)', color: '#fff' }}>
                <Mail className="h-4 w-4" /> Open Email Client
              </button>
              <button onClick={() => downloadParentReport(selectedStudentForEmail[0], selectedStudentForEmail[1])} className="w-full font-bold uppercase py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                <Download className="h-4 w-4" /> Download Report
              </button>
              <button onClick={() => { setParentEmailMode(false); setSelectedStudentForEmail(null); }} className="w-full font-bold uppercase py-2 rounded-xl border-2 transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-4 sm:p-6 max-w-2xl w-full my-8 shadow-2xl border-2 modal-content" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl" style={{ color: 'var(--th-accent)' }}>{selectedStudent[1].name}</h2>
              <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }} aria-label="Close student details">
                <X className="h-5 w-5" style={{ color: 'var(--th-text)' }} />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {DAYS.map((day, idx) => {
                const dayData = selectedStudent[1].weekData?.[day];
                const status = getDayStatus(idx, selectedStudent[1].weekData || {});
                const isComplete = status === 'done';
                return (
                  <div key={day} className="border-2 p-3 sm:p-4 rounded-xl" style={{ borderColor: status === 'done' ? 'var(--th-success)' : status === 'past-due' ? 'var(--th-danger)' : 'var(--th-border)', backgroundColor: isComplete ? 'var(--th-accent-dim)' : status === 'past-due' ? 'rgba(239,68,68,0.08)' : 'var(--th-bg-card)' }}>
                    <p className="font-bold mb-2 text-sm flex items-center gap-2">
                      {status === 'done' && <Star className="h-3 w-3" style={{ color: 'var(--th-success)' }} />}
                      {status === 'past-due' && !isComplete && <AlertTriangle className="h-3 w-3 pulse-warning" style={{ color: 'var(--th-danger)' }} />}
                      {status === 'due-today' && !isComplete && <AlertCircle className="h-3 w-3" style={{ color: 'var(--th-warning)' }} />}
                      {day}
                      {isComplete && <Check className="h-3 w-3" style={{ color: 'var(--th-success)' }} />}
                    </p>
                    <div className="space-y-1 text-xs" style={{ color: 'var(--th-text-secondary)' }}>
                      <p><span style={{ color: 'var(--th-accent)' }}>S:</span> {dayData?.soap?.scripture?.slice(0, 60) || 'Empty'}</p>
                      <p><span style={{ color: 'var(--th-accent)' }}>O:</span> {dayData?.soap?.observation?.slice(0, 60) || 'Empty'}</p>
                      <p><span style={{ color: 'var(--th-accent)' }}>A:</span> {dayData?.soap?.application?.slice(0, 60) || 'Empty'}</p>
                      <p><span style={{ color: 'var(--th-accent)' }}>P:</span> {dayData?.soap?.prayer?.slice(0, 60) || 'Empty'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={() => { setSelectedStudentForEmail(selectedStudent); setParentEmailMode(true); setSelectedStudent(null); }} className="w-full font-bold uppercase py-3 rounded-xl transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-info)', color: '#fff' }}>Send Parent Report</button>
              <button onClick={() => downloadParentReport(selectedStudent[0], selectedStudent[1])} className="w-full font-bold uppercase py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}><Download className="h-4 w-4" /> Download Report</button>
              <button onClick={() => setSelectedStudent(null)} className="w-full font-bold uppercase py-2 rounded-xl border-2 transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b-2 p-4 sm:p-6" style={{ borderColor: 'var(--th-accent)', background: 'linear-gradient(135deg, var(--th-bg), var(--th-bg-card))' }}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl" style={{ color: 'var(--th-accent)' }}>Teacher Dashboard</h1>
              <p className="text-xs sm:text-sm uppercase tracking-widest mt-2" style={{ color: 'var(--th-text-muted)' }}>Week {currentWeek} &middot; Real-time Analytics</p>
            </div>
            <div className="flex gap-2 items-center">
              <select value={currentWeek} onChange={(e) => setCurrentWeek(parseInt(e.target.value))} className="px-3 sm:px-4 py-2 font-bold uppercase text-sm rounded-lg border-2" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                {[1, 2, 3, 4].map((w) => <option key={w} value={w}>Week {w}</option>)}
              </select>
              <button onClick={onLogout} className="p-2 sm:p-3 border-2 text-xs font-bold uppercase rounded-lg transition-all active:scale-[0.98] flex items-center gap-1" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }} aria-label="Exit teacher mode">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" /> Exit
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Class Size', value: `${metrics.totalStudents}`, color: 'var(--th-accent)' },
              { label: 'Avg Completion', value: `${metrics.avgCompletion}%`, color: 'var(--th-success)' },
              { label: 'SOAP Quality', value: `${metrics.avgSoapQuality}%`, color: 'var(--th-info)' },
              { label: 'At Risk', value: `${metrics.behindStudents.length}`, color: metrics.behindStudents.length > 0 ? 'var(--th-danger)' : 'var(--th-success)' },
            ].map((m) => (
              <div key={m.label} className="border-2 p-3 sm:p-4 rounded-xl" style={{ borderColor: m.color, backgroundColor: 'var(--th-bg-card)' }}>
                <p className="text-[10px] sm:text-xs uppercase font-bold" style={{ color: 'var(--th-text-muted)' }}>{m.label}</p>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        <div className="rounded-xl border-2 p-4 sm:p-6" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg-card)' }}>
          <h2 className="text-lg sm:text-xl uppercase mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5" style={{ color: 'var(--th-accent)' }} /> Daily Completion Rate</h2>
          <div className="space-y-3">
            {DAYS.map((day, idx) => {
              const todayIdx = getTodayIndex();
              const status = idx < todayIdx ? 'past' : idx === todayIdx ? 'today' : 'future';
              return (
                <div key={day}>
                  <div className="flex justify-between mb-1 items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold flex items-center gap-2">
                      {idx < todayIdx && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--th-text-muted)' }} />}
                      {idx === todayIdx && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--th-accent)' }} />}
                      {day}
                    </span>
                    <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--th-accent)' }}>{metrics.dailyCompletion[day] || 0}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--th-bg-input)' }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${metrics.dailyCompletion[day] || 0}%`, backgroundColor: (metrics.dailyCompletion[day] || 0) >= 80 ? 'var(--th-success)' : (metrics.dailyCompletion[day] || 0) >= 50 ? 'var(--th-warning)' : 'var(--th-danger)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {metrics.behindStudents.length > 0 && (
          <div className="rounded-xl border-2 p-4 sm:p-6" style={{ borderColor: 'var(--th-danger)', backgroundColor: 'var(--th-accent-dim)' }}>
            <h2 className="text-lg sm:text-xl uppercase mb-4 flex items-center gap-2" style={{ color: 'var(--th-danger)' }}><AlertTriangle className="h-5 w-5" /> Students Behind (&lt; 4 Days)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.behindStudents.map(([sid, data]) => {
                const completed = DAYS.filter((d) => data.weekData?.[d]?.readingComplete).length;
                return (
                  <div key={sid} className="border-2 p-4 rounded-xl" style={{ borderColor: 'var(--th-danger)', backgroundColor: 'var(--th-bg)' }}>
                    <p className="font-bold text-sm" style={{ color: 'var(--th-danger)' }}>{data.name}</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--th-text-secondary)' }}>{completed}/7 days complete</p>
                    <button onClick={() => setSelectedStudent([sid, data])} className="text-xs px-3 py-1 font-bold rounded-lg transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-danger)', color: '#fff' }}>View Details</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-xl border-2 p-4 sm:p-6" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg-card)' }}>
          <h2 className="text-lg sm:text-xl uppercase mb-4 flex items-center gap-2"><Users className="h-5 w-5" style={{ color: 'var(--th-accent)' }} /> Student Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--th-border)' }}>
                  <th className="text-left py-2 px-2 font-bold" style={{ color: 'var(--th-accent)' }}>Student</th>
                  <th className="text-center py-2 px-2 font-bold">Days</th>
                  <th className="text-center py-2 px-2 font-bold">%</th>
                  <th className="text-center py-2 px-2 font-bold hidden sm:table-cell">SOAP</th>
                  <th className="text-center py-2 px-2 font-bold">Report</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(classData).map(([sid, data]) => {
                  const completed = DAYS.filter((d) => data.weekData?.[d]?.readingComplete).length;
                  const pct = Math.round((completed / DAYS.length) * 100);
                  const soapComplete = DAYS.filter((d) => { const soap = data.weekData?.[d]?.soap; return soap?.scripture && soap?.observation && soap?.application && soap?.prayer; }).length;
                  const soapPct = Math.round((soapComplete / DAYS.length) * 100);
                  return (
                    <tr key={sid} className="cursor-pointer" style={{ borderBottom: '1px solid var(--th-border)' }} onClick={() => setSelectedStudent([sid, data])}>
                      <td className="py-3 px-2 font-bold">{data.name}</td>
                      <td className="py-3 px-2 text-center">{completed}/7</td>
                      <td className="py-3 px-2 text-center">{pct}%</td>
                      <td className="py-3 px-2 text-center hidden sm:table-cell">{soapPct}%</td>
                      <td className="py-3 px-2 text-center">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedStudentForEmail([sid, data]); setParentEmailMode(true); }} className="text-xs px-2 py-1 font-bold rounded-lg transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-info)', color: '#fff' }}>Send</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => loadStudentData()} className="font-bold uppercase py-3 flex items-center justify-center gap-2 text-sm rounded-xl transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}><RotateCcw className="h-4 w-4" /> Refresh Data</button>
          <button onClick={() => window.location.reload()} className="font-bold uppercase py-3 text-sm rounded-xl border-2 transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>Hard Refresh</button>
          <button onClick={onLogout} className="font-bold uppercase py-3 text-sm rounded-xl border-2 transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>Back to Student View</button>
        </div>
        <div className="rounded-xl border-2 p-3 text-center text-[10px] sm:text-xs" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>
          <p>Student data is stored locally on each device. Teacher dashboard aggregates data from the same device.</p>
        </div>
      </main>
    </div>
  );
});

// ==================== MAIN COMPONENT ====================
export default function HabitsTracker() {
  const [currentDay, setCurrentDay] = useState(() => getTodayIndex());
  const [dailyData, setDailyData] = useState<Record<string, DayData>>({});
  const [quiz, setQuiz] = useState<QuizState>({ answer: '', submitted: false, correct: false, accuracy: 0 });
  const [saveStatus, setSaveStatus] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showReflect, setShowReflect] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showMeter, setShowMeter] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [quizHistory, setQuizHistory] = useState<Record<string, QuizHistoryEntry>>({});
  const [currentWeek, setCurrentWeek] = useState(1);

  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [badgeUnlocked, setBadgeUnlocked] = useState<BadgeNotification | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [showTeacherLogin, setShowTeacherLogin] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('midnight-gold');

  const [checkedBy, setCheckedBy] = useState('');

  // Day status system: track which day was recently completed for animation
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  // Save work feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Clipboard history
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardEntry[]>([]);
  const [showClipboard, setShowClipboard] = useState(false);

  // Last saved timestamp
  const [lastSavedAt, setLastSavedAt] = useState<string>('');

  // PWA Install Prompt
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Offline Status
  const [isOnline, setIsOnline] = useState(true);

  const setTheme = useCallback((themeId: string) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    try { localStorage.setItem('habitsTheme', themeId); } catch { /* ignore */ }
  }, []);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    let savedTheme = 'midnight-gold';
    try { savedTheme = localStorage.getItem('habitsTheme') || 'midnight-gold'; } catch { /* ignore */ }
    document.documentElement.setAttribute('data-theme', savedTheme);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/habits-pwa/service-worker.js', { scope: '/habits-pwa/' }).then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                setSaveStatus('Update available! Refresh to update.');
                setTimeout(() => setSaveStatus(''), 5000);
              }
            });
          }
        });
      }).catch(() => {});
    }

    let id: string | null = null;
    let name = '';

    try {
      id = localStorage.getItem('habitsStudentId');
    } catch { /* ignore */ }

    if (!id) {
      id = `student_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      try { localStorage.setItem('habitsStudentId', id); } catch { /* ignore */ }
    } else {
      try { name = localStorage.getItem(`${id}_name`) || ''; } catch { /* ignore */ }
    }

    if (!name && id) {
      requestAnimationFrame(() => { setShowNameModal(true); });
    }

    const storageKey = id ? `${id}_habitsWeek1Daily` : 'habitsWeek1Daily';
    let saved: string | null = null;
    try { saved = localStorage.getItem(storageKey) || localStorage.getItem('habitsWeek1Daily'); } catch { /* ignore */ }

    let parsed: Record<string, DayData> | null = null;
    if (saved) { try { parsed = JSON.parse(saved); } catch { parsed = null; } }

    if (!parsed || Object.keys(parsed).length === 0) {
      parsed = {};
      DAYS.forEach((day) => {
        parsed![day] = { readingComplete: false, soap: { scripture: '', observation: '', application: '', prayer: '' }, prayers: { 0: '', 1: '', 2: '' }, checkedBy: '' };
      });
    }

    const savedCheckedBy = parsed ? DAYS.map((d) => parsed[d]?.checkedBy || '').find((c) => c) || '' : '';

    // Load quiz history
    let loadedQuizHistory: Record<string, QuizHistoryEntry> = {};
    try { loadedQuizHistory = JSON.parse(localStorage.getItem(id ? `${id}_quizHistory` : 'habitsQuizHistory') || '{}'); } catch { /* ignore */ }

    // Load streak
    let loadedStreak = 0;
    try { loadedStreak = parseInt(localStorage.getItem(id ? `${id}_streak` : 'habitsStreak') || '0', 10) || 0; } catch { /* ignore */ }

    // Load badges
    let loadedBadges: string[] = [];
    try { loadedBadges = JSON.parse(localStorage.getItem(id ? `${id}_badges` : 'habitsBadges') || '[]'); } catch { /* ignore */ }

    // Load clipboard history
    let loadedClipboard: ClipboardEntry[] = [];
    try { loadedClipboard = JSON.parse(localStorage.getItem(id ? `${id}_clipboardHistory` : 'clipboardHistory') || '[]'); } catch { /* ignore */ }

    requestAnimationFrame(() => {
      setStudentId(id);
      setStudentName(name);
      setCurrentTheme(savedTheme);
      setEarnedBadges(loadedBadges);
      setDailyData(parsed!);
      setStreakCount(loadedStreak);
      setQuizHistory(loadedQuizHistory);
      setCheckedBy(savedCheckedBy);
      setClipboardHistory(loadedClipboard);
    });
  }, []);

  // ==================== PWA INSTALL PROMPT ====================
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show install banner after 3 seconds
      setTimeout(() => setShowInstallBanner(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const dismissInstallBanner = () => setShowInstallBanner(false);

  // ==================== OFFLINE STATUS ====================
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // ==================== AUTO-SAVE ====================
  useEffect(() => {
    if (Object.keys(dailyData).length === 0) return;
    const timer = setTimeout(() => {
      try {
        if (studentId) {
          localStorage.setItem(`${studentId}_habitsWeek${currentWeek}Daily`, JSON.stringify(dailyData));
        }
        localStorage.setItem('habitsWeek1Daily', JSON.stringify(dailyData));
      } catch { /* ignore */ }
      setHistory((prev) => [...prev.slice(-9), { timestamp: new Date().toISOString(), data: dailyData }]);
      setSaveStatus('Saved \u2713');
      setLastSavedAt(new Date().toISOString());
      const clearTimer = setTimeout(() => setSaveStatus(''), 2000);
      return () => clearTimeout(clearTimer);
    }, 300);
    return () => clearTimeout(timer);
  }, [dailyData, studentId, currentWeek]);

  // ==================== PERSIST CLIPBOARD HISTORY ====================
  useEffect(() => {
    if (!studentId) return;
    try {
      localStorage.setItem(`${studentId}_clipboardHistory`, JSON.stringify(clipboardHistory));
    } catch { /* ignore */ }
  }, [clipboardHistory, studentId]);

  // ==================== BADGE FUNCTIONS ====================
  /** Check if a badge should be unlocked and unlock it */
  const checkAndUnlockBadge = useCallback((badgeId: string, badgeLabel: string, badgeEmoji: string) => {
    if (!studentId) return;
    try {
      const savedB = JSON.parse(localStorage.getItem(`${studentId}_badges`) || '[]') as string[];
      if (!savedB.includes(badgeId)) {
        savedB.push(badgeId);
        localStorage.setItem(`${studentId}_badges`, JSON.stringify(savedB));
        try { localStorage.setItem('habitsBadges', JSON.stringify(savedB)); } catch { /* ignore */ }
        setEarnedBadges(savedB);
        setBadgeUnlocked({ id: badgeId, label: badgeLabel, emoji: badgeEmoji });
        setTimeout(() => setBadgeUnlocked(null), 5000);
      }
    } catch { /* ignore */ }
  }, [studentId]);

  /** Calculate memorization score from quiz history */
  const getMemorizationScore = useCallback((): number => {
    const scores = Object.values(quizHistory).filter((q) => q?.accuracy).map((q) => q.accuracy);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  }, [quizHistory]);

  /** Determine which badges the user has earned */
  const getEarnedBadges = useCallback((): Badge[] => {
    const bdgs: Badge[] = [];
    const completedDaysCount = Object.keys(dailyData).filter(
      (day) => dailyData[day]?.readingComplete && hasSoapContent(dailyData[day])
    ).length;
    if (completedDaysCount === 7) bdgs.push(ALL_BADGES[0]);
    if (completedDaysCount >= 5) bdgs.push(ALL_BADGES[1]);
    if (getMemorizationScore() >= 80) bdgs.push(ALL_BADGES[2]);
    if (streakCount >= 2) bdgs.push(ALL_BADGES[3]);
    return bdgs;
  }, [dailyData, getMemorizationScore, streakCount]);

  useEffect(() => {
    if (!studentId || Object.keys(dailyData).length === 0) return;
    const bdgs = getEarnedBadges();
    bdgs.forEach((badge) => {
      if (!earnedBadges.includes(badge.id)) {
        checkAndUnlockBadge(badge.id, badge.label, badge.emoji);
      }
    });
  }, [dailyData, studentId, earnedBadges, getEarnedBadges, checkAndUnlockBadge]);

  // ==================== HANDLERS ====================
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 400) + 'px';
  };

  const handleSoapChange = useCallback((day: string, field: keyof SoapData, value: string) => {
    setDailyData((prev) => ({ ...prev, [day]: { ...prev[day], soap: { ...prev[day]?.soap, [field]: value } } }));
  }, []);

  const handlePrayerChange = useCallback((day: string, index: number, value: string) => {
    setDailyData((prev) => ({ ...prev, [day]: { ...prev[day], prayers: { ...prev[day]?.prayers, [index]: value } } }));
  }, []);

  const handleCheckedByChange = useCallback((value: string) => {
    setCheckedBy(value);
    setDailyData((prev) => {
      const day = SCHEDULE[currentDay].day;
      return { ...prev, [day]: { ...prev[day], checkedBy: value } };
    });
  }, [currentDay]);

  /** Add an entry to clipboard history */
  const addToClipboard = useCallback((text: string, label: string) => {
    if (!text.trim()) return;
    const entry: ClipboardEntry = {
      id: generateId(),
      text: text.trim(),
      label,
      timestamp: new Date().toISOString(),
    };
    setClipboardHistory((prev) => [entry, ...prev].slice(0, 20));
  }, []);

  /** Toggle reading completion with star animation */
  const toggleReading = useCallback((day: string) => {
    setDailyData((prev) => {
      const wasComplete = prev[day]?.readingComplete;
      const updated = { ...prev, [day]: { ...prev[day], readingComplete: !wasComplete } };
      if (!wasComplete) {
        // Mark as recently completed for animation
        setRecentlyCompleted(day);
        setTimeout(() => setRecentlyCompleted(null), 2000);
        const allDone = DAYS.filter((d) => updated[d]?.readingComplete).length;
        if (allDone === 7) {
          const newStreak = streakCount + 1;
          setStreakCount(newStreak);
          if (studentId) {
            try {
              localStorage.setItem(`${studentId}_streak`, JSON.stringify(newStreak));
              localStorage.setItem('habitsStreak', JSON.stringify(newStreak));
            } catch { /* ignore */ }
          }
          checkAndUnlockBadge('consistency', 'Consistent', '\uD83D\uDCAA');
        }
      }
      return updated;
    });
  }, [streakCount, studentId, checkAndUnlockBadge]);

  const handleUndo = () => {
    if (history.length > 0) {
      setDailyData(history[history.length - 1].data);
      setHistory((prev) => prev.slice(0, -1));
      setSaveStatus('Undone \u21B6');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  /** Copy text to clipboard and add to history */
  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    addToClipboard(text, label);
    setSaveStatus(`Copied ${label}!`);
    setTimeout(() => setSaveStatus(''), 2000);
  }, [addToClipboard]);

  const copySoapEntry = useCallback(() => {
    const todayEntry = SCHEDULE[currentDay];
    const current = dailyData[todayEntry.day] || { soap: {} };
    const soapText = `S.O.A.P. - ${todayEntry.soapRange}\nScripture: ${current.soap?.scripture}\nObservation: ${current.soap?.observation}\nApplication: ${current.soap?.application}\nPrayer: ${current.soap?.prayer}`.trim();
    copyToClipboard(soapText, 'SOAP Entry');
  }, [currentDay, dailyData, copyToClipboard]);

  /** Submit memory verse quiz */
  const handleQuizSubmit = useCallback(() => {
    const answer = quiz.answer.toLowerCase();
    const correctWords = ['beginning', 'word', 'god', 'life', 'light', 'darkness', 'mankind'];
    const matchedWords = correctWords.filter((w) => answer.includes(w)).length;
    const accuracy = Math.round((matchedWords / correctWords.length) * 100);
    const isCorrect = matchedWords >= 4;
    const day = SCHEDULE[currentDay].day;
    setQuiz((prev) => ({ ...prev, submitted: true, correct: isCorrect, accuracy }));
    const updatedHistory = { ...quizHistory, [day]: { accuracy, timestamp: new Date().toISOString() } };
    setQuizHistory(updatedHistory);
    if (studentId) {
      try {
        localStorage.setItem(`${studentId}_quizHistory`, JSON.stringify(updatedHistory));
        localStorage.setItem('habitsQuizHistory', JSON.stringify(updatedHistory));
      } catch { /* ignore */ }
    }
    if (accuracy >= 80) { checkAndUnlockBadge('memory-master', 'Memory Master', '\uD83E\uDDE0'); }
  }, [quiz.answer, currentDay, quizHistory, studentId, checkAndUnlockBadge]);

  /** Export prayers as text file */
  const exportPrayersToPDF = useCallback(() => {
    const day = SCHEDULE[currentDay].day;
    let prayerText = `\nHABITS CLASS - WEEK ${currentWeek} PRAYERS\n${new Date().toLocaleDateString()}\n\n`;
    PRAYERS.forEach((p, idx) => { prayerText += `${p.title.toUpperCase()}\n${dailyData[day]?.prayers?.[idx] || '[No entry]'}\n\n---\n`; });
    prayerText += '\nKeep these close to your heart.\nMay God guide your path.'.trim();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(prayerText));
    element.setAttribute('download', `Habits_Week${currentWeek}_Prayers.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setSaveStatus('Prayers exported!');
    setTimeout(() => setSaveStatus(''), 2000);
  }, [currentDay, currentWeek, dailyData]);

  const handleNameSubmit = (name: string) => {
    setStudentName(name);
    if (studentId) { try { localStorage.setItem(`${studentId}_name`, name); } catch { /* ignore */ } }
    setShowNameModal(false);
  };

  const handleSwitchUser = () => {
    if (studentId) { try { localStorage.removeItem(`${studentId}_name`); } catch { /* ignore */ } }
    try { localStorage.removeItem('habitsStudentId'); } catch { /* ignore */ }
    window.location.reload();
  };

  /** Force save and show visual confirmation */
  const handleForceSave = useCallback(() => {
    if (Object.keys(dailyData).length === 0) return;
    setIsSaving(true);
    try {
      if (studentId) {
        localStorage.setItem(`${studentId}_habitsWeek${currentWeek}Daily`, JSON.stringify(dailyData));
      }
      localStorage.setItem('habitsWeek1Daily', JSON.stringify(dailyData));
      setLastSavedAt(new Date().toISOString());
      setSaveMessage('Saved \u2713');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch {
      setSaveMessage('Save failed');
      setTimeout(() => setSaveMessage(''), 2000);
    }
    setTimeout(() => setIsSaving(false), 600);
  }, [dailyData, studentId, currentWeek]);

  /** Delete a clipboard entry */
  const deleteClipboardEntry = useCallback((id: string) => {
    setClipboardHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  /** Clear all clipboard entries */
  const clearAllClipboard = useCallback(() => {
    setClipboardHistory([]);
  }, []);

  // ==================== COMPUTED VALUES ====================
  const today = SCHEDULE[currentDay];
  const current = dailyData[today.day] || { readingComplete: false, soap: {}, prayers: {}, checkedBy: '' };
  const completedDays = useMemo(() => Object.keys(dailyData).filter(
    (day) => dailyData[day]?.readingComplete && hasSoapContent(dailyData[day])
  ).length, [dailyData]);
  const badges = getEarnedBadges();
  const memScore = getMemorizationScore();

  /** Count quiz attempts for the current day */
  const todayQuizAttempts = useMemo(() => {
    const day = SCHEDULE[currentDay].day;
    const entry = quizHistory[day];
    return entry ? 1 : 0;
  }, [quizHistory, currentDay]);

  /** Auto-dismiss badge notification with fade out */
  const [badgeFading, setBadgeFading] = useState(false);
  useEffect(() => {
    if (badgeUnlocked) {
      const fadeTimer = setTimeout(() => setBadgeFading(true), 4000);
      return () => clearTimeout(fadeTimer);
    }
  }, [badgeUnlocked]);

  // Reset badge fading when notification is dismissed
  useEffect(() => {
    if (!badgeUnlocked && badgeFading) {
      const raf = requestAnimationFrame(() => setBadgeFading(false));
      return () => cancelAnimationFrame(raf);
    }
  }, [badgeUnlocked, badgeFading]);

  // ==================== TEACHER MODE ====================
  if (isTeacherMode) {
    return (
      <>
        <TeacherDashboardPanel onLogout={() => setIsTeacherMode(false)} />
        <ThemeSelector currentTheme={currentTheme} setTheme={setTheme} />
      </>
    );
  }

  // ==================== LOADING STATE ====================
  if (Object.keys(dailyData).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--th-bg)' }}>
        <div className="shimmer rounded-2xl p-8 w-64 h-16" />
      </div>
    );
  }

  // ==================== STUDENT VIEW ====================
  return (
    <div className="min-h-screen overflow-x-hidden pb-[env(safe-area-inset-bottom)]" style={{ backgroundColor: 'var(--th-bg)', color: 'var(--th-text)' }}>
      <Suspense fallback={<div className="shimmer rounded-xl" style={{ width: 400, height: 300, margin: '20vh auto' }} />}>
        {showReflect && <ReflectBackModal show={showReflect} onClose={() => setShowReflect(false)} dailyData={dailyData} currentWeek={currentWeek} />}
        {showBadges && <BadgesModal show={showBadges} onClose={() => setShowBadges(false)} earnedBadges={earnedBadges} />}
        {showMeter && <MemorizationMeterModal show={showMeter} onClose={() => setShowMeter(false)} score={memScore} attemptCount={Object.keys(quizHistory).length} />}
        {showClipboard && <ClipboardHistoryModal show={showClipboard} onClose={() => setShowClipboard(false)} clipboardHistory={clipboardHistory} onDeleteEntry={deleteClipboardEntry} onClearAll={clearAllClipboard} />}
      </Suspense>
      {/* Offline Status Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[90] py-2 text-center text-[10px] font-bold uppercase tracking-widest pulse-warning" style={{ backgroundColor: 'var(--th-danger)', color: '#fff' }}>
          <span className="flex items-center justify-center gap-1"><WifiOff className="h-3 w-3" /> Offline — Changes saved locally</span>
        </div>
      )}
      {/* PWA Install Banner */}
      {showInstallBanner && installPrompt && (
        <div className="fixed top-0 left-0 right-0 z-[80] p-3 slide-in-right" style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}>
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Download className="h-5 w-5 flex-shrink-0" />
              <p className="text-xs font-bold truncate">Install Habits Class for quick access</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleInstallPWA} className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all active:scale-[0.95]" style={{ backgroundColor: 'var(--th-bg)', color: 'var(--th-accent)' }}>
                Install
              </button>
              <button onClick={dismissInstallBanner} className="p-1 rounded-lg transition-all active:scale-[0.95]" style={{ color: 'var(--th-bg)' }}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {showNameModal && studentId && <OnboardingModal currentTheme={currentTheme} onThemeSelect={setTheme} onComplete={handleNameSubmit} />}
      {showTeacherLogin && <TeacherLoginModal onClose={() => setShowTeacherLogin(false)} onLogin={() => { setIsTeacherMode(true); setShowTeacherLogin(false); }} />}

      {/* Badge Notification with auto-dismiss */}
      {badgeUnlocked && (
        <div
          className={`fixed top-20 right-4 z-[60] p-4 sm:p-6 rounded-2xl border-2 max-w-xs shadow-lg shadow-black/30 slide-in-right ${badgeFading ? 'opacity-0 transition-opacity duration-1000' : ''}`}
          style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-accent-dim)' }}
        >
          <div className="text-center">
            <p className="text-4xl sm:text-5xl mb-2 badge-unlock">{badgeUnlocked.emoji}</p>
            <p className="font-black uppercase text-sm sm:text-base" style={{ color: 'var(--th-accent)' }}>{badgeUnlocked.label}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--th-text-secondary)' }}>You unlocked a badge!</p>
          </div>
        </div>
      )}

      {/* Full Header */}
      <header className="border-b-2 p-4 sm:p-6" style={{ borderColor: 'var(--th-accent)', background: 'linear-gradient(135deg, var(--th-bg), var(--th-bg-card))' }}>
        <div className="max-w-5xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl mb-1" style={{ color: 'var(--th-accent)' }}>
                Habits Class: Week {currentWeek}
              </h1>
              {studentName && <p className="text-sm font-bold" style={{ color: 'var(--th-accent)', opacity: 0.8 }}>{studentName}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSwitchUser} className="text-xs px-3 py-2 font-bold uppercase rounded-lg border-2 transition-all active:scale-[0.98] flex items-center gap-1" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }} aria-label="Switch user">
                <LogOut className="h-3 w-3" /> Switch
              </button>
              <button onClick={() => setShowTeacherLogin(true)} className="text-xs px-3 py-2 font-bold uppercase rounded-lg border-2 transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }} aria-label="Teacher login">
                Teacher?
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap">
            <span className="text-xs px-2 py-1 font-bold rounded-lg flex items-center gap-1" style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}>
              <Flame className="h-3 w-3" /> {streakCount} week streak
            </span>
            {badges.map((b) => (
              <span key={b.id} className="text-xs px-2 py-1 font-bold rounded-lg flex items-center gap-1" style={{ backgroundColor: 'var(--th-bg-input)', color: 'var(--th-accent)' }}>
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Sticky Mini Header with Save Button */}
      <div className="sticky top-0 z-50 border-b-2 px-3 sm:px-6 py-2 sm:py-3" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-bg)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest truncate" style={{ color: 'var(--th-text-secondary)' }}>
              Daily Devotional &middot; {today.chapter} &middot; Knowing God
            </p>
            <p className="text-[10px] sm:text-xs" style={{ color: 'var(--th-text-muted)' }}>{completedDays}/7 days progressing</p>
          </div>
          <div className="flex gap-2 text-xs items-center">
            <button onClick={handleUndo} className="p-1 rounded-lg transition-colors" title="Undo" style={{ color: 'var(--th-text)' }} aria-label="Undo">{'\u21B6'}</button>
            <button onClick={() => setShowMeter(true)} className="p-1 rounded-lg transition-colors flex items-center gap-1" title="Memorization" style={{ color: 'var(--th-text)' }} aria-label="Memorization meter">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="text-[10px] sm:text-xs">{memScore}%</span>
            </button>
            <button
              onClick={handleForceSave}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 border ${isSaving ? 'save-pulse' : ''}`}
              title="Save Now"
              style={{
                color: saveMessage === 'Saved \u2713' ? 'var(--th-success)' : 'var(--th-text)',
                borderColor: saveMessage === 'Saved \u2713' ? 'var(--th-success)' : 'var(--th-border)',
                backgroundColor: saveMessage === 'Saved \u2713' ? 'var(--th-success)' + '15' : 'transparent',
              }}
              aria-label="Save now"
            >
              <Save className="h-3 w-3" />
              {saveMessage && <span className="text-[10px] font-bold hidden sm:inline">{saveMessage}</span>}
            </button>
            <p className="font-bold text-[10px] sm:text-xs" style={{ color: saveStatus === 'Saved \u2713' ? 'var(--th-success)' : 'var(--th-text-muted)' }}>{saveStatus}</p>
          </div>
        </div>
      </div>

      {/* Day Selector with Status System */}
      <nav className="border-b-2 sticky top-[44px] sm:top-[52px] z-40" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg-elevated)' }}>
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => currentDay > 0 && setCurrentDay(currentDay - 1)} disabled={currentDay === 0} className="p-2 disabled:opacity-30 flex-shrink-0 rounded-lg transition-colors" style={{ color: 'var(--th-text)' }} aria-label="Previous day">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1 sm:gap-2 justify-center flex-1 min-w-0">
            {DAYS.map((day, idx) => {
              const status = getDayStatus(idx, dailyData);
              const isActive = currentDay === idx;
              const isRecent = recentlyCompleted === day;

              // Style based on status
              let bgStyle = 'var(--th-bg-card)';
              let borderStyle = 'var(--th-border)';
              let colorStyle = 'var(--th-text-muted)';
              let statusDot = null;

              if (status === 'done') {
                bgStyle = 'var(--th-accent-dim)';
                borderStyle = 'var(--th-success)';
                colorStyle = 'var(--th-success)';
                statusDot = <Star className="h-2.5 w-2.5" style={{ color: 'var(--th-success)' }} />;
              } else if (status === 'past-due') {
                bgStyle = 'rgba(239,68,68,0.08)';
                borderStyle = 'var(--th-danger)';
                colorStyle = 'var(--th-danger)';
                statusDot = <AlertTriangle className="h-2.5 w-2.5 pulse-warning" style={{ color: 'var(--th-danger)' }} />;
              } else if (status === 'due-today') {
                bgStyle = 'rgba(234,179,8,0.08)';
                borderStyle = 'var(--th-warning)';
                colorStyle = 'var(--th-warning)';
                statusDot = <AlertCircle className="h-2.5 w-2.5" style={{ color: 'var(--th-warning)' }} />;
              }

              if (isActive) {
                bgStyle = 'var(--th-accent)';
                borderStyle = 'var(--th-accent)';
                colorStyle = 'var(--th-bg)';
              }

              return (
                <button
                  key={day}
                  onClick={() => setCurrentDay(idx)}
                  className="px-2 sm:px-3 py-2 font-bold uppercase text-[10px] sm:text-xs border-2 transition-all flex-shrink-0 rounded-lg active:scale-[0.97] flex flex-col items-center gap-0.5"
                  style={{ borderColor: borderStyle, backgroundColor: bgStyle, color: colorStyle }}
                >
                  <span>{day.slice(0, 3)}</span>
                  {statusDot}
                  {isRecent && (
                    <span className="star-burst text-[8px]" style={{ color: 'var(--th-success)' }}>
                      <Star className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={() => currentDay < 6 && setCurrentDay(currentDay + 1)} disabled={currentDay === 6} className="p-2 disabled:opacity-30 flex-shrink-0 rounded-lg transition-colors" style={{ color: 'var(--th-text)' }} aria-label="Next day">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="w-full max-w-5xl mx-auto px-2 sm:px-6 py-4 sm:py-6">
        <div className="border-2 sm:border-4 p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-hidden rounded-2xl" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-bg-card)' }}>
          {/* Day Header */}
          <div className="flex items-start justify-between pb-4 sm:pb-6 gap-4" style={{ borderBottom: '2px solid var(--th-border)' }}>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-3xl mb-1 sm:mb-2">{today.day.toUpperCase()}</h2>
              <p className="uppercase tracking-widest text-xs sm:text-sm" style={{ color: 'var(--th-text-secondary)' }}>{today.chapter}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] sm:text-xs uppercase mb-1" style={{ color: 'var(--th-text-muted)' }}>Memory Verse</p>
              <p className="text-[10px] sm:text-xs font-mono" style={{ color: 'var(--th-accent)' }}>{MEMORY_REFERENCE}</p>
            </div>
          </div>

          {/* TASK A: BIBLE READING */}
          <section className="space-y-4">
            <h3 className="text-base sm:text-xl uppercase flex items-center gap-2">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--th-accent)' }} />
              Read {today.chapter}
            </h3>
            <button
              onClick={() => toggleReading(today.day)}
              className="w-full p-4 sm:p-6 border-2 sm:border-4 font-bold uppercase transition-all text-sm sm:text-lg rounded-xl active:scale-[0.98]"
              style={{
                borderColor: current.readingComplete ? 'var(--th-accent)' : 'var(--th-border)',
                backgroundColor: current.readingComplete ? 'var(--th-accent)' : 'var(--th-bg-input)',
                color: current.readingComplete ? 'var(--th-bg)' : 'var(--th-text-secondary)',
              }}
            >
              {current.readingComplete ? (
                <span className="flex items-center justify-center gap-3">
                  {recentlyCompleted === today.day ? (
                    <>
                      <span className="star-burst"><Star className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" /></span>
                      <span className="checkmark-appear">Completed ✓</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                      Reading Complete ✓
                    </>
                  )}
                </span>
              ) : 'Mark Reading Complete'}
            </button>

            {/* Reward Section - shown when reading is complete */}
            {current.readingComplete && (
              <div className="rounded-xl p-4 border-2 space-y-2" style={{ borderColor: 'var(--th-success)', backgroundColor: 'var(--th-accent-dim)' }}>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" style={{ color: 'var(--th-success)' }} fill="var(--th-success)" />
                  <p className="text-sm font-bold" style={{ color: 'var(--th-success)' }}>Reading Complete!</p>
                </div>
                <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>
                  Great job! Now complete your S.O.A.P. journal entry below to earn a full star for this day.
                </p>
                {hasSoapContent(current) && (
                  <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--th-success)' + '40' }}>
                    <Trophy className="h-4 w-4" style={{ color: 'var(--th-accent)' }} />
                    <p className="text-xs font-bold" style={{ color: 'var(--th-accent)' }}>Full star earned! This day is complete.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* TASK B: DAILY S.O.A.P. */}
          <section className="space-y-4 pt-6 sm:pt-8" style={{ borderTop: '2px solid var(--th-border)' }}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-xl uppercase flex items-center gap-2 mb-1 sm:mb-2">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--th-accent)' }} />
                  Daily S.O.A.P.
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--th-text-secondary)' }}>{today.soapRange}</p>
              </div>
              <button onClick={copySoapEntry} className="p-2 rounded-lg flex-shrink-0 transition-colors" title="Copy SOAP" style={{ color: 'var(--th-text-secondary)' }} aria-label="Copy SOAP entry">
                <Copy className="h-5 w-5" />
              </button>
            </div>
            <div className="border-2 p-3 sm:p-4 mb-4 rounded-xl" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg)' }}>
              <p className="text-xs sm:text-sm italic" style={{ color: 'var(--th-text-secondary)' }}>&ldquo;{today.soapText}&rdquo;</p>
            </div>
            <div className="space-y-4 sm:space-y-5">
              {SOAP_FIELDS.map((field) => {
                const fieldValue = current.soap?.[field.key] || '';
                const wordCount = fieldValue.trim() ? fieldValue.trim().split(/\s+/).length : 0;
                return (
                  <div key={field.key} className="pl-3 sm:pl-6" style={{ borderLeft: '4px solid var(--th-accent)' }}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <label className="text-[10px] sm:text-xs font-bold uppercase" style={{ color: 'var(--th-accent)' }}>{field.label}</label>
                      {wordCount > 0 && (
                        <span className="text-[10px]" style={{ color: 'var(--th-text-muted)' }}>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <textarea
                      value={fieldValue}
                      onChange={(e) => handleSoapChange(today.day, field.key, e.target.value)}
                      onInput={handleTextareaInput}
                      placeholder={`Write your ${field.key}...`}
                      className="w-full p-3 font-mono text-xs sm:text-sm border-2 rounded-lg focus:outline-none resize-none"
                      style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
                      rows={3}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* TASK C: THREE DAILY PRAYERS */}
          <section className="space-y-4 pt-6 sm:pt-8" style={{ borderTop: '2px solid var(--th-border)' }}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-xl uppercase flex items-center gap-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--th-accent)' }} />
                Prayer Prompts
              </h3>
              <button onClick={exportPrayersToPDF} className="p-2 rounded-lg text-xs flex gap-1 items-center flex-shrink-0 transition-colors" style={{ color: 'var(--th-text-secondary)' }} aria-label="Export prayers">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
            <div className="space-y-4">
              {PRAYERS.map((prayer, idx) => {
                const prayerValue = current.prayers?.[idx] || '';
                const wordCount = prayerValue.trim() ? prayerValue.trim().split(/\s+/).length : 0;
                return (
                  <div key={idx} className="border-2 p-3 sm:p-4 rounded-xl" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg)' }}>
                    <p className="text-[10px] sm:text-xs font-bold uppercase mb-2 sm:mb-3" style={{ color: 'var(--th-accent)' }}>{prayer.title}</p>
                    <p className="text-xs sm:text-sm mb-2 sm:mb-3 italic" style={{ color: 'var(--th-text-muted)' }}>&ldquo;{prayer.prompt}&rdquo;</p>
                    <textarea
                      value={prayerValue}
                      onChange={(e) => handlePrayerChange(today.day, idx, e.target.value)}
                      onInput={handleTextareaInput}
                      placeholder={`Write your ${prayer.title.toLowerCase()}...`}
                      className="w-full p-2 font-mono text-xs sm:text-sm border-2 rounded-lg focus:outline-none resize-none"
                      style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border-hover)', color: 'var(--th-text)' }}
                      rows={3}
                    />
                    {wordCount > 0 && (
                      <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--th-text-muted)' }}>{wordCount} word{wordCount !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Memory Verse Reminder */}
          <div className="border-2 p-4 sm:p-6 space-y-3 rounded-xl" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg)' }}>
            <h3 className="text-xs sm:text-sm uppercase flex items-center gap-2" style={{ color: 'var(--th-accent)' }}>
              <Eye className="h-4 w-4" />
              Daily Memory Verse
            </h3>
            <p className="text-base sm:text-lg italic leading-relaxed" style={{ color: 'var(--th-text-secondary)', fontFamily: "'DM Serif Display', serif" }}>&ldquo;{MEMORY_VERSE}&rdquo;</p>
            <p className="text-[10px] sm:text-xs font-mono" style={{ color: 'var(--th-text-muted)' }}>{MEMORY_REFERENCE}</p>
          </div>

          {/* Accountability */}
          <div className="p-3 sm:p-4 border-2 rounded-xl" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)' }}>
            <label className="block text-[10px] sm:text-xs font-bold uppercase mb-2" style={{ color: 'var(--th-text-muted)' }}>Checked by:</label>
            <input type="text" value={checkedBy} onChange={(e) => handleCheckedByChange(e.target.value)} placeholder="Teacher/Leader name" className="w-full px-2 py-2 focus:outline-none uppercase tracking-wider text-xs sm:text-sm rounded-lg" style={{ backgroundColor: 'var(--th-bg)', borderBottom: '2px solid var(--th-accent)', color: 'var(--th-text)' }} />
          </div>
        </div>

        {/* WEEK ACTIONS */}
        <div className="mt-6 sm:mt-12 grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
          {[
            { icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Reflect Back', onClick: () => setShowReflect(true) },
            { icon: <Award className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Badges', onClick: () => setShowBadges(true) },
            { icon: <Zap className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Memory Meter', onClick: () => setShowMeter(true) },
            { icon: <Download className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Export Prayers', onClick: exportPrayersToPDF },
            { icon: <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Clipboard', onClick: () => setShowClipboard(true), badge: clipboardHistory.length > 0 ? clipboardHistory.length : undefined },
          ].map((action) => (
            <button key={action.label} onClick={action.onClick} className="p-3 sm:p-4 border-2 font-bold text-[10px] sm:text-xs uppercase text-center flex flex-col gap-1.5 sm:gap-2 items-center transition-all active:scale-[0.97] rounded-xl hover:shadow-lg hover:shadow-black/10 relative" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
              {action.icon}
              <span>{action.label}</span>
              {action.badge && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black" style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}>
                  {action.badge > 9 ? '9+' : action.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* MEMORY VERSE QUIZ */}
        <section className="mt-6 sm:mt-12 border-2 sm:border-4 p-4 sm:p-8 space-y-4 sm:space-y-6 rounded-2xl" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-bg-card)' }}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-2xl uppercase">Memory Verse Quiz ({MEMORY_REFERENCE})</h2>
            {todayQuizAttempts > 0 && (
              <span className="text-[10px] px-2 py-1 rounded-lg font-bold uppercase flex items-center gap-1" style={{ backgroundColor: 'var(--th-accent-dim)', color: 'var(--th-accent)' }}>
                <CheckCircle2 className="h-3 w-3" /> Attempted
              </span>
            )}
          </div>
          <div className="border-2 sm:border-4 p-4 sm:p-6 rounded-xl" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg)' }}>
            <p className="text-base sm:text-lg italic text-center leading-relaxed" style={{ color: 'var(--th-text-secondary)', fontFamily: "'DM Serif Display', serif" }}>&ldquo;{MEMORY_VERSE}&rdquo;</p>
            <p className="text-[10px] sm:text-xs text-center mt-4 font-mono" style={{ color: 'var(--th-text-muted)' }}>{MEMORY_REFERENCE}</p>
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] sm:text-xs font-bold uppercase mb-2" style={{ color: 'var(--th-accent)' }}>Recite the verse from memory:</label>
            <textarea value={quiz.answer} onChange={(e) => setQuiz((prev) => ({ ...prev, answer: e.target.value }))} onInput={handleTextareaInput} disabled={quiz.submitted} placeholder="Type the entire verse..." className="w-full p-3 sm:p-4 font-mono text-xs sm:text-sm border-2 rounded-lg focus:outline-none disabled:opacity-40 resize-none" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }} rows={4} />
            {!quiz.submitted ? (
              <button onClick={handleQuizSubmit} className="w-full font-bold uppercase py-3 transition-all text-sm rounded-xl active:scale-[0.98]" style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}>Check My Answer</button>
            ) : (
              <div className="p-3 sm:p-6 border-2 sm:border-4 rounded-xl" style={{ borderColor: quiz.correct ? 'var(--th-success)' : 'var(--th-border)', backgroundColor: quiz.correct ? 'var(--th-accent-dim)' : 'var(--th-bg-card)' }}>
                <div className="flex items-center gap-2 mb-2">
                  {quiz.correct ? <Star className="h-4 w-4" style={{ color: 'var(--th-success)' }} fill="var(--th-success)" /> : <AlertCircle className="h-4 w-4" style={{ color: 'var(--th-warning)' }} />}
                  <p className="font-bold uppercase mb-0 text-sm sm:text-base">{quiz.correct ? '\u2713 PERFECT! YOU GOT IT!' : `${quiz.accuracy}% Match`}</p>
                </div>
                <div className="w-full h-2 rounded-full mb-3 overflow-hidden" style={{ backgroundColor: 'var(--th-bg-input)' }}>
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${quiz.accuracy}%`, backgroundColor: quiz.correct ? 'var(--th-success)' : 'var(--th-accent)' }} />
                </div>
                <button onClick={() => setQuiz({ answer: '', submitted: false, correct: false, accuracy: 0 })} className="font-bold uppercase text-xs transition-colors" style={{ color: 'var(--th-accent)' }}>Try Again</button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer with last saved time */}
      <footer className="border-t-2 p-4 sm:p-6 mt-8 sm:mt-12 mb-8" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-bg-elevated)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest" style={{ color: 'var(--th-text-muted)' }}>
            {'\u2713'} All progress saved automatically &middot; Installable as app &middot; Offline support enabled
          </p>
          {lastSavedAt && (
            <p className="text-[10px] mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--th-text-muted)', opacity: 0.6 }}>
              <Clock className="h-3 w-3" /> Last saved: {getRelativeTime(lastSavedAt)}
            </p>
          )}
        </div>
      </footer>

      <ThemeSelector currentTheme={currentTheme} setTheme={setTheme} />
    </div>
  );
}
