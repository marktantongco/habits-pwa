'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
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
} from 'lucide-react';

// ==================== THEME DATA ====================
const THEMES = [
  { id: 'midnight-gold', label: 'Midnight Gold', color: '#FFEA00', bg: '#000000' },
  { id: 'ocean-deep', label: 'Ocean Deep', color: '#00d4ff', bg: '#0a0f1a' },
  { id: 'forest-calm', label: 'Forest Calm', color: '#76ff03', bg: '#0a110a' },
  { id: 'sunset-ember', label: 'Sunset Ember', color: '#ff6d00', bg: '#1a0a0a' },
  { id: 'lavender-dream', label: 'Lavender Dream', color: '#e040fb', bg: '#0f0a1a' },
  { id: 'arctic-light', label: 'Arctic Light', color: '#0ea5e9', bg: '#f8fafc' },
];

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

const MEMORY_VERSE = 'In the beginning was the Word, and the Word was with God, and the Word was God.';
const MEMORY_REFERENCE = 'John 1:1-5';

const ALL_BADGES: Badge[] = [
  { id: 'perfect-week', label: 'Perfect Week!', emoji: '\u2B50' },
  { id: 'streak', label: 'On Fire!', emoji: '\uD83D\uDD25' },
  { id: 'memory-master', label: 'Memory Master', emoji: '\uD83E\uDDE0' },
  { id: 'consistency', label: 'Consistent', emoji: '\uD83D\uDCAA' },
];

const SOAP_FIELDS: { key: keyof SoapData; label: string }[] = [
  { key: 'scripture', label: 'S: Scripture \u2014 What verse stands out?' },
  { key: 'observation', label: 'O: Observation \u2014 What do you notice?' },
  { key: 'application', label: 'A: Application \u2014 How does this apply to YOUR life?' },
  { key: 'prayer', label: 'P: Prayer \u2014 Pray your response to God' },
];

const TEACHER_PASSWORD = '/123';

// ==================== THEME SELECTOR COMPONENT ====================
const ThemeSelector = React.memo(function ThemeSelector({ currentTheme, setTheme }: { currentTheme: string; setTheme: (t: string) => void }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (themeId: string) => {
    setTheme(themeId);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[70]">
      {open && (
        <div
          className="absolute bottom-16 right-0 p-4 rounded-xl shadow-lg shadow-black/30 border-2"
          style={{
            backgroundColor: 'var(--th-bg-card)',
            borderColor: 'var(--th-border)',
          }}
        >
          <p className="text-xs font-bold uppercase mb-3" style={{ color: 'var(--th-text-secondary)' }}>Choose Theme</p>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className="flex items-center gap-2 p-2 rounded-lg transition-all active:scale-[0.97]"
                style={{
                  backgroundColor: t.id === currentTheme ? 'var(--th-accent-dim)' : 'transparent',
                  border: t.id === currentTheme ? '2px solid var(--th-accent)' : '2px solid transparent',
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex-shrink-0 border-2"
                  style={{ backgroundColor: t.color, borderColor: t.bg }}
                />
                <span
                  className="text-xs font-bold text-left leading-tight"
                  style={{ color: 'var(--th-text)' }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-black/30 transition-transform active:scale-[0.95]"
        style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}
        aria-label="Change theme"
      >
        <Palette className="h-5 w-5" />
      </button>
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
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="rounded-xl p-4 sm:p-6 max-w-4xl w-full my-8 shadow-lg shadow-black/30 border-2" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--th-accent)' }}>
            WEEK {currentWeek} REFLECTION
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }}>
            <X className="h-6 w-6" style={{ color: 'var(--th-text)' }} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {DAYS.map((day) => (
            <div key={day} className="rounded-lg p-3 sm:p-4 border-2" style={{ backgroundColor: 'var(--th-bg-elevated)', borderColor: 'var(--th-border)' }}>
              <p className="text-sm font-bold mb-2" style={{ color: 'var(--th-accent)' }}>{day.toUpperCase()}</p>
              <div className="text-xs space-y-2" style={{ color: 'var(--th-text-secondary)' }}>
                <p>
                  <span style={{ color: 'var(--th-accent)' }}>S:</span>{' '}
                  {dailyData[day]?.soap?.scripture?.slice(0, 40)}
                  {dailyData[day]?.soap?.scripture?.length > 40 ? '...' : ''}
                </p>
                <p>
                  <span style={{ color: 'var(--th-accent)' }}>O:</span>{' '}
                  {dailyData[day]?.soap?.observation?.slice(0, 40)}
                  {dailyData[day]?.soap?.observation?.length > 40 ? '...' : ''}
                </p>
                <p>
                  <span style={{ color: 'var(--th-accent)' }}>A:</span>{' '}
                  {dailyData[day]?.soap?.application?.slice(0, 40)}
                  {dailyData[day]?.soap?.application?.length > 40 ? '...' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-lg border-2 text-xs" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>
          <p>Growth Arc: {DAYS.length} days of spiritual reflection across John 3:1-21</p>
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
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="rounded-xl p-4 sm:p-6 max-w-md w-full shadow-lg shadow-black/30 border-2" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--th-accent)' }}>
            YOUR BADGES
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }}>
            <X className="h-6 w-6" style={{ color: 'var(--th-text)' }} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {ALL_BADGES.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className="p-4 border-2 text-center rounded-xl"
                style={{
                  borderColor: isEarned ? 'var(--th-accent)' : 'var(--th-border)',
                  backgroundColor: isEarned ? 'var(--th-accent-dim)' : 'var(--th-bg-card)',
                  opacity: isEarned ? 1 : 0.5,
                }}
              >
                <p className="text-3xl mb-2">{isEarned ? badge.emoji : '?'}</p>
                <p className="text-sm font-bold" style={{ color: isEarned ? 'var(--th-accent)' : 'var(--th-text-muted)' }}>
                  {badge.label}
                </p>
                {isEarned && <p className="text-xs mt-1" style={{ color: 'var(--th-success)' }}>Earned!</p>}
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-3 rounded-lg border text-xs" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>
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
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="rounded-xl p-4 sm:p-6 max-w-md w-full shadow-lg shadow-black/30 border-2" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--th-accent)' }}>
            MEMORIZATION METER
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }}>
            <X className="h-6 w-6" style={{ color: 'var(--th-text)' }} />
          </button>
        </div>
        <div className="text-center mb-6">
          <p className="text-5xl font-black mb-2" style={{ color: 'var(--th-accent)' }}>
            {score}%
          </p>
          <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>Average quiz accuracy across all attempts</p>
        </div>
        <div className="w-full h-4 rounded-lg mb-6 overflow-hidden" style={{ backgroundColor: 'var(--th-bg-input)' }}>
          <div
            className="h-4 rounded-lg transition-all duration-500"
            style={{
              width: `${score}%`,
              backgroundColor: score >= 80 ? 'var(--th-success)' : score >= 50 ? 'var(--th-accent)' : 'var(--th-danger)',
            }}
          />
        </div>
        <div className="space-y-2 text-xs" style={{ color: 'var(--th-text-secondary)' }}>
          <p>
            <span style={{ color: 'var(--th-accent)' }}>0-49%:</span> Keep practicing! Repetition builds memory.
          </p>
          <p>
            <span style={{ color: 'var(--th-accent)' }}>50-79%:</span> Getting there! You&apos;re making progress.
          </p>
          <p>
            <span style={{ color: 'var(--th-accent)' }}>80-100%:</span> Memory Master! You&apos;ve memorized the verse.
          </p>
        </div>
        {attemptCount > 0 && (
          <div className="mt-4 p-3 rounded-lg border text-xs" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>
            <p>Attempts: {attemptCount} days completed</p>
          </div>
        )}
      </div>
    </div>
  );
});

const OnboardingModal = React.memo(function OnboardingModal({
  currentTheme,
  onThemeSelect,
  onComplete,
}: {
  currentTheme: string;
  onThemeSelect: (t: string) => void;
  onComplete: (name: string) => void;
}) {
  const [step, setStep] = useState(0); // 0 = name, 1 = theme
  const [name, setName] = useState('');

  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep(1);
    }
  };

  const handleThemeConfirm = () => {
    onComplete(name.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}>
      <div className="rounded-2xl p-6 sm:p-10 max-w-md w-full shadow-2xl border-2" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        {step === 0 ? (
          /* Step 1: Name Input */
          <div className="space-y-6">
            {/* Decorative accent line */}
            <div className="w-12 h-1 rounded-full" style={{ backgroundColor: 'var(--th-accent)' }} />
            <div>
              <h2 className="text-3xl sm:text-4xl mb-2" style={{ color: 'var(--th-accent)', fontFamily: "'DM Serif Display', serif" }}>
                Welcome
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
                What&apos;s your name? This helps your teacher track your spiritual growth journey.
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSubmit();
                }}
                placeholder="Enter your name"
                className="w-full px-5 py-4 rounded-xl border-2 focus:outline-none text-base"
                style={{
                  backgroundColor: 'var(--th-bg-input)',
                  borderColor: 'var(--th-border)',
                  color: 'var(--th-text)',
                }}
                autoFocus
              />
              <button
                onClick={handleNameSubmit}
                className="w-full font-bold uppercase py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-30 text-sm tracking-wider"
                style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}
                disabled={!name.trim()}
              >
                Next &rarr;
              </button>
            </div>
            <p className="text-[10px] text-center uppercase tracking-widest" style={{ color: 'var(--th-text-muted)' }}>
              Step 1 of 2 &middot; Your Profile
            </p>
          </div>
        ) : (
          /* Step 2: Theme Selection */
          <div className="space-y-6">
            {/* Decorative accent line */}
            <div className="w-12 h-1 rounded-full" style={{ backgroundColor: 'var(--th-accent)' }} />
            <div>
              <h2 className="text-3xl sm:text-4xl mb-2" style={{ color: 'var(--th-accent)', fontFamily: "'DM Serif Display', serif" }}>
                Choose Your Style
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
                Pick a theme that inspires your daily devotionals, {name}. You can always change it later.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onThemeSelect(t.id)}
                  className="p-4 rounded-xl border-2 transition-all active:scale-[0.97] text-left"
                  style={{
                    borderColor: t.id === currentTheme ? 'var(--th-accent)' : 'var(--th-border)',
                    backgroundColor: t.id === currentTheme ? 'var(--th-accent-dim)' : 'var(--th-bg-card)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="w-8 h-8 rounded-full flex-shrink-0 border-2 shadow-md"
                      style={{ backgroundColor: t.color, borderColor: t.id === currentTheme ? t.color : 'var(--th-border)' }}
                    />
                    <span className="text-xs font-bold leading-tight" style={{ color: 'var(--th-text)' }}>
                      {t.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.bg, border: '1px solid var(--th-border)' }} />
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleThemeConfirm}
              className="w-full font-bold uppercase py-4 rounded-xl transition-all active:scale-[0.98] text-sm tracking-wider"
              style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}
            >
              Start My Journey &rarr;
            </button>
            <button
              onClick={() => setStep(0)}
              className="w-full font-bold uppercase py-2 rounded-xl text-xs transition-colors"
              style={{ color: 'var(--th-text-muted)' }}
            >
              &larr; Back
            </button>
            <p className="text-[10px] text-center uppercase tracking-widest" style={{ color: 'var(--th-text-muted)' }}>
              Step 2 of 2 &middot; Theme
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

function TeacherLoginModal({
  onClose,
  onLogin,
}: {
  onClose: () => void;
  onLogin: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <div className="rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-lg shadow-black/30 border-2" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black" style={{ color: 'var(--th-accent)' }}>Teacher Access</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }}>
            <X className="h-6 w-6" style={{ color: 'var(--th-text)' }} />
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
          className="w-full px-4 py-3 mb-4 rounded-lg border-2 focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--th-bg-input)',
            borderColor: error ? 'var(--th-danger)' : 'var(--th-border)',
            color: 'var(--th-text)',
            ['--tw-ring-color' as string]: 'var(--th-accent)',
          }}
          autoFocus
        />
        {error && <p className="text-xs mb-4" style={{ color: 'var(--th-danger)' }}>Incorrect password. Try again.</p>}
        <button
          onClick={() => {
            if (password === TEACHER_PASSWORD) onLogin();
            else setError(true);
          }}
          className="w-full font-bold uppercase py-3 rounded-lg transition-colors active:scale-[0.98]"
          style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

// ==================== TEACHER DASHBOARD COMPONENT ====================
function TeacherDashboardPanel({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [classData, setClassData] = useState<Record<string, StudentInfo>>({});
  const [selectedStudent, setSelectedStudent] = useState<[string, StudentInfo] | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [badgeNotifications, setBadgeNotifications] = useState<Array<BadgeNotification & { studentName: string }>>([]);
  const [parentEmailMode, setParentEmailMode] = useState(false);
  const [selectedStudentForEmail, setSelectedStudentForEmail] = useState<[string, StudentInfo] | null>(null);

  const loadStudentData = () => {
    const students: Record<string, StudentInfo> = {};
    const seenIds = new Set<string>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Extract student ID from keys like: "student_1234_abc_habitsWeek1Daily"
      const match = key.match(/^(student_[^_]+_[^_]+)_habitsWeek\d+Daily$/);
      if (match) {
        const sid = match[1];
        if (seenIds.has(sid)) continue;
        seenIds.add(sid);

        const weekData = JSON.parse(localStorage.getItem(key) || '{}');
        const streak = parseInt(localStorage.getItem(`${sid}_streak`) || '0', 10) || 0;
        const quizHistory = JSON.parse(localStorage.getItem(`${sid}_quizHistory`) || '{}');
        const badges = JSON.parse(localStorage.getItem(`${sid}_badges`) || '[]');
        const name = localStorage.getItem(`${sid}_name`) || `Student ${Object.keys(students).length + 1}`;

        students[sid] = { name, weekData, streak, quizHistory, badges, studentId: sid };
      }
    }

    // Also fall back to old key format for backwards compat
    const oldKey = 'habitsWeek1Daily';
    const oldData = localStorage.getItem(oldKey);
    if (oldData && Object.keys(students).length === 0) {
      const parsed = JSON.parse(oldData) as Record<string, DayData>;
      students['student_legacy'] = {
        name: 'Legacy Student',
        weekData: parsed,
        streak: parseInt(localStorage.getItem('habitsStreak') || '0', 10) || 0,
        quizHistory: JSON.parse(localStorage.getItem('habitsQuizHistory') || '{}'),
        badges: JSON.parse(localStorage.getItem('habitsBadges') || '[]'),
        studentId: 'student_legacy',
      };
    }

    setClassData(students);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      loadStudentData();
    });
  }, [currentWeek]);

  const calculateBadges = (studentData: StudentInfo) => {
    const bdgs: Badge[] = [];
    const completedDays = DAYS.filter(
      (d) => studentData.weekData?.[d]?.readingComplete && Object.values(studentData.weekData?.[d]?.soap || {}).some((v) => v)
    ).length;
    if (completedDays === 7) bdgs.push(ALL_BADGES[0]);
    if (completedDays >= 5) bdgs.push(ALL_BADGES[1]);
    const quizScores = Object.values(studentData.quizHistory || {}).filter((q) => q?.accuracy).map((q) => q.accuracy);
    const avgQuiz = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b) / quizScores.length) : 0;
    if (avgQuiz >= 80) bdgs.push(ALL_BADGES[2]);
    if (studentData.streak >= 2) bdgs.push(ALL_BADGES[3]);
    return bdgs;
  };

  const calculateMetrics = () => {
    const entries = Object.entries(classData);
    const total = entries.length;
    if (total === 0) return { totalStudents: 0, avgCompletion: 0, avgSoapQuality: 0, dailyCompletion: {} as Record<string, number>, behindStudents: [] as [string, StudentInfo][] };

    const dailyCompletion: Record<string, number> = {};
    DAYS.forEach((day) => {
      const completed = entries.filter(([, d]) => d.weekData?.[day]?.readingComplete).length;
      dailyCompletion[day] = Math.round((completed / total) * 100);
    });

    const overallCompletion = entries.map(([, d]) => {
      const completed = DAYS.filter((day) => d.weekData?.[day]?.readingComplete).length;
      return (completed / DAYS.length) * 100;
    });
    const avgCompletion = Math.round(overallCompletion.reduce((a, b) => a + b, 0) / overallCompletion.length);

    const soapQuality = entries.map(([, d]) => {
      const daysWithCompleteSoap = DAYS.filter((day) => {
        const soap = d.weekData?.[day]?.soap;
        return soap?.scripture && soap?.observation && soap?.application && soap?.prayer;
      }).length;
      return (daysWithCompleteSoap / DAYS.length) * 100;
    });
    const avgSoapQuality = Math.round(soapQuality.reduce((a, b) => a + b, 0) / soapQuality.length);

    const behindStudents = entries.filter(([, d]) => {
      const completed = DAYS.filter((day) => d.weekData?.[day]?.readingComplete).length;
      return completed < 4;
    });

    return { totalStudents: total, avgCompletion, avgSoapQuality, dailyCompletion, behindStudents };
  };

  const generateStudentReport = (_studentId: string, studentData: StudentInfo) => {
    const completedDays = DAYS.filter((d) => studentData.weekData?.[d]?.readingComplete).length;
    const completionPct = Math.round((completedDays / DAYS.length) * 100);
    const bdgs = calculateBadges(studentData);
    const quizScores = Object.values(studentData.quizHistory || {}).filter((q) => q?.accuracy).map((q) => q.accuracy);
    const avgQuiz = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b) / quizScores.length) : 0;

    return `HABITS CLASS - STUDENT PROGRESS REPORT
Week ${currentWeek}

Student: ${studentData.name}
Date: ${new Date().toLocaleDateString()}

=== COMPLETION ===
Days Completed: ${completedDays}/7 (${completionPct}%)
Bible: John 1-7

=== ACHIEVEMENTS ===
${bdgs.length > 0 ? bdgs.map((b) => `${b.emoji} ${b.label}`).join('\n') : 'Keep going! Badges unlock as you progress.'}

=== SPIRITUAL REFLECTIONS ===
${DAYS.map((day) => {
      const soap = studentData.weekData?.[day]?.soap;
      if (soap?.scripture) {
        return `${day}:\nScripture: ${soap.scripture.slice(0, 60)}...\nApplication: ${soap.application.slice(0, 60)}...`;
      }
      return `${day}: [Not yet completed]`;
    }).join('\n')}

=== WEEKLY SUMMARY ===
Streak: ${studentData.streak} weeks
Quiz Accuracy: ${avgQuiz}%
Status: ${completionPct === 100 ? 'PERFECT WEEK!' : completionPct >= 75 ? 'On Track' : 'Needs Support'}

---
This report generated by Habits Class`.trim();
  };

  const downloadParentReport = (studentId: string, studentData: StudentInfo) => {
    const report = generateStudentReport(studentId, studentData);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `Habits_Report_${studentData.name.replace(/\s+/g, '_')}_Week${currentWeek}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sendParentEmail = (studentId: string, studentData: StudentInfo) => {
    const report = generateStudentReport(studentId, studentData);
    const mailtoLink = `mailto:?subject=Habits Class Progress Report - ${studentData.name}&body=${encodeURIComponent(`Dear Parent,\n\nHere's ${studentData.name}'s weekly progress:\n\n${report}\n\nBest regards,\nHabits Class Teacher`)}`;
    window.location.href = mailtoLink;
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom)]" style={{ backgroundColor: 'var(--th-bg)', color: 'var(--th-text)' }}>
      {/* Badge Notifications */}
      {badgeNotifications.length > 0 && (
        <div className="fixed top-20 right-4 z-[60] space-y-2 max-w-xs sm:max-w-sm">
          {badgeNotifications.map((notif, idx) => (
            <div key={idx} className="p-3 sm:p-4 rounded-xl border-2 animate-pulse" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-accent-dim)' }}>
              <p className="font-black text-sm sm:text-base" style={{ color: 'var(--th-accent)' }}>{notif.emoji} {notif.label}</p>
              <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>{notif.studentName} just unlocked a badge!</p>
              <button onClick={() => setBadgeNotifications((prev) => prev.filter((_, i) => i !== idx))} className="mt-1 text-xs underline" style={{ color: 'var(--th-accent)' }}>
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Parent Email Modal */}
      {parentEmailMode && selectedStudentForEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-xl p-6 sm:p-8 max-w-md w-full shadow-lg shadow-black/30 border-2" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
            <h2 className="text-xl sm:text-2xl font-black mb-6" style={{ color: 'var(--th-accent)' }}>Send to Parents</h2>
            <div className="rounded-lg p-4 mb-6 border-2" style={{ backgroundColor: 'var(--th-bg-elevated)', borderColor: 'var(--th-border)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--th-text-secondary)' }}>Student: <span className="font-bold" style={{ color: 'var(--th-text)' }}>{selectedStudentForEmail[1].name}</span></p>
              <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>Email: <span className="font-bold" style={{ color: 'var(--th-text)' }}>{selectedStudentForEmail[1].email || 'Not provided'}</span></p>
            </div>
            <div className="space-y-3">
              <button onClick={() => sendParentEmail(selectedStudentForEmail[0], selectedStudentForEmail[1])} className="w-full font-bold uppercase py-3 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-success)', color: '#fff' }}>
                <Mail className="h-4 w-4" /> Open Email Client
              </button>
              <button onClick={() => downloadParentReport(selectedStudentForEmail[0], selectedStudentForEmail[1])} className="w-full font-bold uppercase py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                <Download className="h-4 w-4" /> Download Report
              </button>
              <button onClick={() => { setParentEmailMode(false); setSelectedStudentForEmail(null); }} className="w-full font-bold uppercase py-2 rounded-lg border-2 transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-xl p-4 sm:p-6 max-w-2xl w-full my-8 shadow-lg shadow-black/30 border-2" style={{ backgroundColor: 'var(--th-bg)', borderColor: 'var(--th-accent)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--th-accent)' }}>{selectedStudent[1].name}</h2>
              <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--th-bg-elevated)' }}>
                <X className="h-6 w-6" style={{ color: 'var(--th-text)' }} />
              </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {DAYS.map((day) => {
                const dayData = selectedStudent[1].weekData?.[day];
                const isComplete = dayData?.readingComplete;
                return (
                  <div key={day} className="border-2 p-3 sm:p-4 rounded-lg" style={{ borderColor: isComplete ? 'var(--th-success)' : 'var(--th-border)', backgroundColor: isComplete ? 'var(--th-accent-dim)' : 'var(--th-bg-card)' }}>
                    <p className="font-bold mb-2 text-sm">{day} {isComplete ? '\u2713' : '\u25CB'}</p>
                    <div className="space-y-1 text-xs" style={{ color: 'var(--th-text-secondary)' }}>
                      <p><span style={{ color: 'var(--th-accent)' }}>S:</span> {dayData?.soap?.scripture?.slice(0, 50) || 'Empty'}...</p>
                      <p><span style={{ color: 'var(--th-accent)' }}>O:</span> {dayData?.soap?.observation?.slice(0, 50) || 'Empty'}...</p>
                      <p><span style={{ color: 'var(--th-accent)' }}>A:</span> {dayData?.soap?.application?.slice(0, 50) || 'Empty'}...</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={() => { setSelectedStudentForEmail(selectedStudent); setParentEmailMode(true); setSelectedStudent(null); }} className="w-full font-bold uppercase py-3 rounded-lg transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-info)', color: '#fff' }}>
                Send Parent Report
              </button>
              <button onClick={() => downloadParentReport(selectedStudent[0], selectedStudent[1])} className="w-full font-bold uppercase py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                <Download className="h-4 w-4" /> Download Report
              </button>
              <button onClick={() => setSelectedStudent(null)} className="w-full font-bold uppercase py-2 rounded-lg border-2 transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Header */}
      <header className="border-b-2 p-4 sm:p-6" style={{ borderColor: 'var(--th-accent)', background: 'linear-gradient(135deg, var(--th-bg), var(--th-bg-card))' }}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black" style={{ color: 'var(--th-accent)' }}>TEACHER DASHBOARD</h1>
              <p className="text-xs sm:text-sm uppercase tracking-widest mt-2" style={{ color: 'var(--th-text-muted)' }}>Week {currentWeek} &middot; Real-time Analytics</p>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={currentWeek}
                onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
                className="px-3 sm:px-4 py-2 font-bold uppercase text-sm rounded-lg border-2"
                style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
              >
                {[1, 2, 3, 4].map((w) => <option key={w} value={w}>Week {w}</option>)}
              </select>
              <button onClick={onLogout} className="p-2 sm:p-3 border-2 text-xs font-bold uppercase rounded-lg transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                Exit
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="border-2 p-3 sm:p-4 rounded-xl" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-bg-card)' }}>
              <p className="text-[10px] sm:text-xs uppercase font-bold" style={{ color: 'var(--th-text-muted)' }}>Class Size</p>
              <p className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--th-accent)' }}>{metrics.totalStudents}</p>
            </div>
            <div className="border-2 p-3 sm:p-4 rounded-xl" style={{ borderColor: 'var(--th-success)', backgroundColor: 'var(--th-bg-card)' }}>
              <p className="text-[10px] sm:text-xs uppercase font-bold" style={{ color: 'var(--th-text-muted)' }}>Avg Completion</p>
              <p className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--th-success)' }}>{metrics.avgCompletion}%</p>
            </div>
            <div className="border-2 p-3 sm:p-4 rounded-xl" style={{ borderColor: 'var(--th-info)', backgroundColor: 'var(--th-bg-card)' }}>
              <p className="text-[10px] sm:text-xs uppercase font-bold" style={{ color: 'var(--th-text-muted)' }}>SOAP Quality</p>
              <p className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--th-info)' }}>{metrics.avgSoapQuality}%</p>
            </div>
            <div className="border-2 p-3 sm:p-4 rounded-xl" style={{ borderColor: metrics.behindStudents.length > 0 ? 'var(--th-danger)' : 'var(--th-success)', backgroundColor: 'var(--th-bg-card)' }}>
              <p className="text-[10px] sm:text-xs uppercase font-bold" style={{ color: 'var(--th-text-muted)' }}>At Risk</p>
              <p className="text-2xl sm:text-3xl font-black" style={{ color: metrics.behindStudents.length > 0 ? 'var(--th-danger)' : 'var(--th-success)' }}>
                {metrics.behindStudents.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Daily Completion Chart */}
        <div className="rounded-xl border-2 p-4 sm:p-6" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg-card)' }}>
          <h2 className="text-lg sm:text-xl font-black uppercase mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" style={{ color: 'var(--th-accent)' }} />
            Daily Completion Rate
          </h2>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs sm:text-sm font-bold">{day}</span>
                  <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--th-accent)' }}>{metrics.dailyCompletion[day] || 0}%</span>
                </div>
                <div className="w-full h-3 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--th-bg-input)' }}>
                  <div className="h-full transition-all duration-300" style={{ width: `${metrics.dailyCompletion[day] || 0}%`, backgroundColor: (metrics.dailyCompletion[day] || 0) >= 80 ? 'var(--th-success)' : (metrics.dailyCompletion[day] || 0) >= 50 ? 'var(--th-warning)' : 'var(--th-danger)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Students */}
        {metrics.behindStudents.length > 0 && (
          <div className="rounded-xl border-2 p-4 sm:p-6" style={{ borderColor: 'var(--th-danger)', backgroundColor: 'var(--th-accent-dim)' }}>
            <h2 className="text-lg sm:text-xl font-black uppercase mb-4 flex items-center gap-2" style={{ color: 'var(--th-danger)' }}>
              <AlertCircle className="h-5 w-5" /> Students Behind (&lt; 4 Days)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.behindStudents.map(([sid, data]) => {
                const completed = DAYS.filter((d) => data.weekData?.[d]?.readingComplete).length;
                return (
                  <div key={sid} className="border-2 p-4 rounded-lg" style={{ borderColor: 'var(--th-danger)', backgroundColor: 'var(--th-bg)' }}>
                    <p className="font-bold text-sm" style={{ color: 'var(--th-danger)' }}>{data.name}</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--th-text-secondary)' }}>{completed}/7 days complete</p>
                    <button onClick={() => setSelectedStudent([sid, data])} className="text-xs px-3 py-1 font-bold rounded-lg transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-danger)', color: '#fff' }}>View Details</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Student Leaderboard */}
        <div className="rounded-xl border-2 p-4 sm:p-6" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg-card)' }}>
          <h2 className="text-lg sm:text-xl font-black uppercase mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: 'var(--th-accent)' }} />
            Student Performance + Parent Reports
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--th-border)' }}>
                  <th className="text-left py-2 px-2 font-bold" style={{ color: 'var(--th-accent)' }}>Student</th>
                  <th className="text-center py-2 px-2 font-bold">Days</th>
                  <th className="text-center py-2 px-2 font-bold">%</th>
                  <th className="text-center py-2 px-2 font-bold hidden sm:table-cell">SOAP</th>
                  <th className="text-center py-2 px-2 font-bold">Badges</th>
                  <th className="text-center py-2 px-2 font-bold">Report</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(classData).map(([sid, data]) => {
                  const completed = DAYS.filter((d) => data.weekData?.[d]?.readingComplete).length;
                  const pct = Math.round((completed / DAYS.length) * 100);
                  const soapComplete = DAYS.filter((d) => {
                    const soap = data.weekData?.[d]?.soap;
                    return soap?.scripture && soap?.observation && soap?.application && soap?.prayer;
                  }).length;
                  const soapPct = Math.round((soapComplete / DAYS.length) * 100);
                  const bdgs = calculateBadges(data);
                  return (
                    <tr key={sid} className="cursor-pointer" style={{ borderBottom: '1px solid var(--th-border)' }} onClick={() => setSelectedStudent([sid, data])}>
                      <td className="py-3 px-2 font-bold">{data.name}</td>
                      <td className="py-3 px-2 text-center">{completed}/7</td>
                      <td className="py-3 px-2 text-center">{pct}%</td>
                      <td className="py-3 px-2 text-center hidden sm:table-cell">{soapPct}%</td>
                      <td className="py-3 px-2 text-center">{bdgs.map((b) => b.emoji).join('') || '-'}</td>
                      <td className="py-3 px-2 text-center">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedStudentForEmail([sid, data]); setParentEmailMode(true); }} className="text-xs px-2 py-1 font-bold rounded-lg transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-info)', color: '#fff' }}>
                          Send
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => loadStudentData()} className="font-black uppercase py-3 flex items-center justify-center gap-2 text-sm rounded-lg transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}>
            <RotateCcw className="h-4 w-4" /> Refresh Data
          </button>
          <button onClick={() => window.location.reload()} className="font-black uppercase py-3 text-sm rounded-lg border-2 transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
            Hard Refresh
          </button>
          <button onClick={onLogout} className="font-black uppercase py-3 text-sm rounded-lg border-2 transition-colors active:scale-[0.98]" style={{ backgroundColor: 'var(--th-bg-input)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
            Back to Student View
          </button>
        </div>

        <div className="rounded-lg border-2 p-3 text-center text-[10px] sm:text-xs" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}>
          <p>Student data is stored locally on each device. Teacher dashboard aggregates data from the same device.</p>
        </div>
      </main>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function HabitsTracker() {
  const [currentDay, setCurrentDay] = useState(0);
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

  // Student ID system
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [badgeUnlocked, setBadgeUnlocked] = useState<BadgeNotification | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  // Teacher mode
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [showTeacherLogin, setShowTeacherLogin] = useState(false);

  // Theme state
  const [currentTheme, setCurrentTheme] = useState('midnight-gold');

  const setTheme = useCallback((themeId: string) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('habitsTheme', themeId);
  }, []);

  // ==================== INITIALIZATION ====================
  const [savedQuizHistory] = useState<Record<string, QuizHistoryEntry>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem('habitsQuizHistory') || '{}');
    } catch { return {}; }
  });

  const [savedStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      return parseInt(localStorage.getItem('habitsStreak') || '0', 10) || 0;
    } catch { return 0; }
  });

  const [savedBadges] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('habitsBadges') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('habitsTheme') || 'midnight-gold';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch((err) => console.log('SW registration failed:', err));
    }

    // Initialize or load student ID
    let id = localStorage.getItem('habitsStudentId');
    let name = '';

    if (!id) {
      // Create new student ID
      id = `student_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('habitsStudentId', id);
      // Will show name modal
    } else {
      name = localStorage.getItem(`${id}_name`) || '';
    }

    if (!name && id) {
      requestAnimationFrame(() => {
        setShowNameModal(true);
      });
    }

    // Load daily data
    const storageKey = id ? `${id}_habitsWeek1Daily` : 'habitsWeek1Daily';
    const saved = localStorage.getItem(storageKey) || localStorage.getItem('habitsWeek1Daily');
    let parsed: Record<string, DayData> | null = null;

    if (saved) {
      try { parsed = JSON.parse(saved); } catch { parsed = null; }
    }

    if (!parsed || Object.keys(parsed).length === 0) {
      parsed = {};
      DAYS.forEach((day) => {
        parsed[day] = {
          readingComplete: false,
          soap: { scripture: '', observation: '', application: '', prayer: '' },
          prayers: { 0: '', 1: '', 2: '' },
          checkedBy: '',
        };
      });
    }

    requestAnimationFrame(() => {
      setStudentId(id);
      setStudentName(name);
      setCurrentTheme(savedTheme);
      setEarnedBadges(savedBadges);
      setDailyData(parsed!);
      setStreakCount(savedStreak);
      setQuizHistory(savedQuizHistory);
    });
  }, []);

  // ==================== AUTO-SAVE WITH STUDENT ID ====================
  useEffect(() => {
    if (Object.keys(dailyData).length === 0) return;

    const timer = setTimeout(() => {
      // Save with student ID prefix
      if (studentId) {
        localStorage.setItem(`${studentId}_habitsWeek${currentWeek}Daily`, JSON.stringify(dailyData));
      }
      // Also save to legacy key for backwards compatibility
      localStorage.setItem('habitsWeek1Daily', JSON.stringify(dailyData));

      setHistory((prev) => [...prev.slice(-9), { timestamp: new Date().toISOString(), data: dailyData }]);

      setSaveStatus('Saved \u2713');
      const clearTimer = setTimeout(() => setSaveStatus(''), 2000);
      return () => clearTimeout(clearTimer);
    }, 300);
    return () => clearTimeout(timer);
  }, [dailyData, studentId, currentWeek]);

  // ==================== BADGE FUNCTIONS ====================
  const checkAndUnlockBadge = (badgeId: string, badgeLabel: string, badgeEmoji: string) => {
    if (!studentId) return;
    const savedB = JSON.parse(localStorage.getItem(`${studentId}_badges`) || '[]') as string[];
    if (!savedB.includes(badgeId)) {
      savedB.push(badgeId);
      localStorage.setItem(`${studentId}_badges`, JSON.stringify(savedB));
      localStorage.setItem('habitsBadges', JSON.stringify(savedB));
      setEarnedBadges(savedB);
      setBadgeUnlocked({ id: badgeId, label: badgeLabel, emoji: badgeEmoji });
      setTimeout(() => setBadgeUnlocked(null), 5000);
    }
  };

  const getMemorizationScore = (): number => {
    const scores = Object.values(quizHistory).filter((q) => q?.accuracy).map((q) => q.accuracy);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  };

  const getEarnedBadges = (): Badge[] => {
    const bdgs: Badge[] = [];
    const completedDaysCount = Object.keys(dailyData).filter(
      (day) => dailyData[day]?.readingComplete && Object.values(dailyData[day]?.soap || {}).some((v) => v)
    ).length;
    if (completedDaysCount === 7) bdgs.push(ALL_BADGES[0]);
    if (completedDaysCount >= 5) bdgs.push(ALL_BADGES[1]);
    if (getMemorizationScore() >= 80) bdgs.push(ALL_BADGES[2]);
    if (streakCount >= 2) bdgs.push(ALL_BADGES[3]);
    return bdgs;
  };

  // ==================== BADGE CHECK ON DATA CHANGE ====================
  useEffect(() => {
    if (!studentId || Object.keys(dailyData).length === 0) return;
    const bdgs = getEarnedBadges();
    bdgs.forEach((badge) => {
      if (!earnedBadges.includes(badge.id)) {
        checkAndUnlockBadge(badge.id, badge.label, badge.emoji);
      }
    });
  }, [dailyData, studentId, earnedBadges]);

  // ==================== UTILITY FUNCTIONS ====================
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 400) + 'px';
  };

  const handleSoapChange = useCallback((day: string, field: keyof SoapData, value: string) => {
    setDailyData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        soap: { ...prev[day]?.soap, [field]: value },
      },
    }));
  }, []);

  const handlePrayerChange = useCallback((day: string, index: number, value: string) => {
    setDailyData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        prayers: { ...prev[day]?.prayers, [index]: value },
      },
    }));
  }, []);

  const toggleReading = useCallback((day: string) => {
    setDailyData((prev) => {
      const updated = {
        ...prev,
        [day]: { ...prev[day], readingComplete: !prev[day]?.readingComplete },
      };

      // Check streak when completing a day
      if (!prev[day]?.readingComplete) {
        const allDone = DAYS.filter((d) => updated[d]?.readingComplete).length;
        if (allDone === 7) {
          const newStreak = streakCount + 1;
          setStreakCount(newStreak);
          if (studentId) {
            localStorage.setItem(`${studentId}_streak`, JSON.stringify(newStreak));
          }
          localStorage.setItem('habitsStreak', JSON.stringify(newStreak));
          checkAndUnlockBadge('consistency', 'Consistent', '\uD83D\uDCAA');
        }
      }

      return updated;
    });
  }, [streakCount, studentId, checkAndUnlockBadge]);

  // ==================== UNDO FUNCTION ====================
  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1].data;
      setDailyData(previousState);
      setHistory((prev) => prev.slice(0, -1));
      setSaveStatus('Undone \u21B6');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // ==================== CLIPBOARD ====================
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSaveStatus(`Copied ${label}!`);
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const copySoapEntry = () => {
    const todayEntry = SCHEDULE[currentDay];
    const current = dailyData[todayEntry.day] || { soap: {} };
    const soapText = `S.O.A.P. - ${todayEntry.soapRange}\nScripture: ${current.soap?.scripture}\nObservation: ${current.soap?.observation}\nApplication: ${current.soap?.application}\nPrayer: ${current.soap?.prayer}`.trim();
    copyToClipboard(soapText, 'SOAP Entry');
  };

  // ==================== QUIZ ====================
  const handleQuizSubmit = () => {
    const answer = quiz.answer.toLowerCase();
    const correctWords = ['beginning', 'word', 'god'];
    const matchedWords = correctWords.filter((w) => answer.includes(w)).length;
    const accuracy = Math.round((matchedWords / correctWords.length) * 100);
    const isCorrect = matchedWords >= 2;
    const day = SCHEDULE[currentDay].day;

    setQuiz((prev) => ({ ...prev, submitted: true, correct: isCorrect, accuracy }));

    const updatedHistory = { ...quizHistory, [day]: { accuracy, timestamp: new Date().toISOString() } };
    setQuizHistory(updatedHistory);
    if (studentId) {
      localStorage.setItem(`${studentId}_quizHistory`, JSON.stringify(updatedHistory));
    }
    localStorage.setItem('habitsQuizHistory', JSON.stringify(updatedHistory));

    if (accuracy >= 80) {
      checkAndUnlockBadge('memory-master', 'Memory Master', '\uD83E\uDDE0');
    }
  };

  // ==================== PDF EXPORT ====================
  const exportPrayersToPDF = () => {
    const day = SCHEDULE[currentDay].day;
    let prayerText = `\nHABITS CLASS - WEEK ${currentWeek} PRAYERS\n${new Date().toLocaleDateString()}\n\n`;
    PRAYERS.forEach((p, idx) => {
      prayerText += `${p.title.toUpperCase()}\n${dailyData[day]?.prayers?.[idx] || '[No entry]'}\n\n---\n`;
    });
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
  };

  // ==================== NAME MODAL HANDLER ====================
  const handleNameSubmit = (name: string) => {
    setStudentName(name);
    if (studentId) {
      localStorage.setItem(`${studentId}_name`, name);
    }
    setShowNameModal(false);
  };

  // ==================== COMPUTED VALUES ====================
  const today = SCHEDULE[currentDay];
  const current = dailyData[today.day] || {
    readingComplete: false,
    soap: {},
    prayers: {},
    checkedBy: '',
  };
  const completedDays = Object.keys(dailyData).filter(
    (day) => dailyData[day]?.readingComplete && Object.values(dailyData[day]?.soap || {}).some((v) => v)
  ).length;
  const badges = getEarnedBadges();
  const memScore = getMemorizationScore();

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
        <div className="shimmer rounded-xl p-8 w-64 h-16" />
      </div>
    );
  }

  // ==================== STUDENT VIEW ====================
  return (
    <div className="min-h-screen overflow-x-hidden pb-[env(safe-area-inset-bottom)]" style={{ backgroundColor: 'var(--th-bg)', color: 'var(--th-text)' }}>
      {/* Modals wrapped in Suspense */}
      <Suspense fallback={<div className="shimmer rounded-xl" style={{ width: 400, height: 300, margin: '20vh auto' }} />}>
        {showReflect && <ReflectBackModal show={showReflect} onClose={() => setShowReflect(false)} dailyData={dailyData} currentWeek={currentWeek} />}
        {showBadges && <BadgesModal show={showBadges} onClose={() => setShowBadges(false)} earnedBadges={earnedBadges} />}
        {showMeter && <MemorizationMeterModal show={showMeter} onClose={() => setShowMeter(false)} score={memScore} attemptCount={Object.keys(quizHistory).length} />}
      </Suspense>
      {showNameModal && studentId && <OnboardingModal currentTheme={currentTheme} onThemeSelect={setTheme} onComplete={handleNameSubmit} />}
      {showTeacherLogin && <TeacherLoginModal onClose={() => setShowTeacherLogin(false)} onLogin={() => { setIsTeacherMode(true); setShowTeacherLogin(false); }} />}

      {/* Badge Unlock Notification */}
      {badgeUnlocked && (
        <div className="fixed top-20 right-4 z-[60] p-4 sm:p-6 rounded-xl border-2 animate-pulse max-w-xs shadow-lg shadow-black/30" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-accent-dim)' }}>
          <div className="text-center">
            <p className="text-4xl sm:text-5xl mb-2">{badgeUnlocked.emoji}</p>
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-1" style={{ color: 'var(--th-accent)' }}>
                HABITS CLASS: WEEK {currentWeek}
              </h1>
              {studentName && <p className="text-sm font-bold" style={{ color: 'var(--th-accent)', opacity: 0.8 }}>{studentName}</p>}
            </div>
            <button
              onClick={() => setShowTeacherLogin(true)}
              className="text-xs px-3 py-2 font-bold uppercase rounded-lg border-2 transition-colors active:scale-[0.98]"
              style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text-muted)' }}
            >
              Teacher?
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap">
            <span className="text-xs px-2 py-1 font-bold rounded-lg" style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}>
              {'\uD83D\uDD25'} {streakCount} week streak
            </span>
            {badges.map((b) => (
              <span key={b.id} className="text-xs px-2 py-1 font-bold rounded-lg" style={{ backgroundColor: 'var(--th-bg-input)', color: 'var(--th-accent)' }}>
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Sticky Minimal Header */}
      <div className="sticky top-0 z-50 border-b-2 px-3 sm:px-6 py-2 sm:py-3" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-bg)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest truncate" style={{ color: 'var(--th-text-secondary)' }}>
              Daily Devotional &middot; John 1-7 &middot; Knowing God
            </p>
            <p className="text-[10px] sm:text-xs" style={{ color: 'var(--th-text-muted)' }}>{completedDays}/7 days progressing</p>
          </div>
          <div className="flex gap-2 text-xs items-center">
            <button onClick={handleUndo} className="p-1 rounded-lg transition-colors" title="Undo" style={{ color: 'var(--th-text)' }}>{'\u21B6'}</button>
            <button onClick={() => setShowMeter(true)} className="p-1 rounded-lg transition-colors" title="Memorization" style={{ color: 'var(--th-text)' }}>{'\uD83D\uDCCA'} {memScore}%</button>
            <p className="font-bold text-[10px] sm:text-xs" style={{ color: saveStatus === 'Saved \u2713' ? 'var(--th-success)' : 'var(--th-text-muted)' }}>{saveStatus}</p>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <nav className="border-b-2 sticky top-[44px] sm:top-[52px] z-40" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg-elevated)' }}>
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => currentDay > 0 && setCurrentDay(currentDay - 1)} disabled={currentDay === 0} className="p-2 disabled:opacity-30 flex-shrink-0 rounded-lg transition-colors" style={{ color: 'var(--th-text)' }}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1 sm:gap-2 justify-center flex-1 min-w-0">
            {DAYS.map((day, idx) => {
              const isComplete = dailyData[day]?.readingComplete && Object.values(dailyData[day]?.soap || {}).some((v) => v);
              const isActive = currentDay === idx;
              return (
                <button
                  key={day}
                  onClick={() => setCurrentDay(idx)}
                  className="px-2 sm:px-3 py-2 font-bold uppercase text-[10px] sm:text-xs border-2 transition-all flex-shrink-0 rounded-lg active:scale-[0.97]"
                  style={{
                    borderColor: isActive ? 'var(--th-accent)' : isComplete ? 'var(--th-success)' : 'var(--th-border)',
                    backgroundColor: isActive ? 'var(--th-accent)' : isComplete ? 'var(--th-accent-dim)' : 'var(--th-bg-card)',
                    color: isActive ? 'var(--th-bg)' : isComplete ? 'var(--th-success)' : 'var(--th-text-muted)',
                  }}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <button onClick={() => currentDay < 6 && setCurrentDay(currentDay + 1)} disabled={currentDay === 6} className="p-2 disabled:opacity-30 flex-shrink-0 rounded-lg transition-colors" style={{ color: 'var(--th-text)' }}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="w-full max-w-5xl mx-auto px-2 sm:px-6 py-4 sm:py-6">
        {/* Daily Devotional Card */}
        <div className="border-2 sm:border-4 p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-hidden rounded-xl" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-bg-card)' }}>
          {/* Day Header */}
          <div className="flex items-start justify-between pb-4 sm:pb-6 gap-4" style={{ borderBottom: '2px solid var(--th-border)' }}>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-3xl font-black mb-1 sm:mb-2">{today.day.toUpperCase()}</h2>
              <p className="uppercase tracking-widest text-xs sm:text-sm" style={{ color: 'var(--th-text-secondary)' }}>{today.chapter}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] sm:text-xs uppercase mb-1" style={{ color: 'var(--th-text-muted)' }}>Memory Verse</p>
              <p className="text-[10px] sm:text-xs font-mono" style={{ color: 'var(--th-accent)' }}>{MEMORY_REFERENCE}</p>
            </div>
          </div>

          {/* TASK A: BIBLE READING */}
          <section className="space-y-4">
            <h3 className="text-base sm:text-xl font-black uppercase flex items-center gap-2">
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
                  <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                  Reading Complete {'\u2713'}
                </span>
              ) : (
                'Mark Reading Complete'
              )}
            </button>
          </section>

          {/* TASK B: DAILY S.O.A.P. */}
          <section className="space-y-4 pt-6 sm:pt-8" style={{ borderTop: '2px solid var(--th-border)' }}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-xl font-black uppercase flex items-center gap-2 mb-1 sm:mb-2">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--th-accent)' }} />
                  Daily S.O.A.P.
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--th-text-secondary)' }}>{today.soapRange}</p>
              </div>
              <button onClick={copySoapEntry} className="p-2 rounded-lg flex-shrink-0 transition-colors" title="Copy SOAP" style={{ color: 'var(--th-text-secondary)' }}>
                <Copy className="h-5 w-5" />
              </button>
            </div>

            <div className="border-2 p-3 sm:p-4 mb-4 rounded-lg" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg)' }}>
              <p className="text-xs sm:text-sm italic" style={{ color: 'var(--th-text-secondary)' }}>&ldquo;{today.soapText}&rdquo;</p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {SOAP_FIELDS.map((field) => (
                <div key={field.key} className="pl-3 sm:pl-6" style={{ borderLeft: '4px solid var(--th-accent)' }}>
                  <label className="block text-[10px] sm:text-xs font-bold uppercase mb-2" style={{ color: 'var(--th-accent)' }}>{field.label}</label>
                  <textarea
                    value={current.soap?.[field.key] || ''}
                    onChange={(e) => handleSoapChange(today.day, field.key, e.target.value)}
                    onInput={handleTextareaInput}
                    placeholder={`Write your ${field.key}...`}
                    className="w-full p-3 font-mono text-xs sm:text-sm border-2 rounded-lg focus:outline-none focus:ring-2 resize-none"
                    style={{
                      backgroundColor: 'var(--th-bg)',
                      borderColor: 'var(--th-border)',
                      color: 'var(--th-text)',
                      ['--tw-ring-color' as string]: 'var(--th-accent)',
                    }}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* TASK C: THREE DAILY PRAYERS */}
          <section className="space-y-4 pt-6 sm:pt-8" style={{ borderTop: '2px solid var(--th-border)' }}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-xl font-black uppercase flex items-center gap-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--th-accent)' }} />
                Prayer Prompts
              </h3>
              <button onClick={exportPrayersToPDF} className="p-2 rounded-lg text-xs flex gap-1 items-center flex-shrink-0 transition-colors" style={{ color: 'var(--th-text-secondary)' }}>
                <Download className="h-4 w-4" /> Export
              </button>
            </div>

            <div className="space-y-4">
              {PRAYERS.map((prayer, idx) => (
                <div key={idx} className="border-2 p-3 sm:p-4 rounded-lg" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg)' }}>
                  <p className="text-[10px] sm:text-xs font-bold uppercase mb-2 sm:mb-3" style={{ color: 'var(--th-accent)' }}>{prayer.title}</p>
                  <p className="text-xs sm:text-sm mb-2 sm:mb-3 italic" style={{ color: 'var(--th-text-muted)' }}>&ldquo;{prayer.prompt}&rdquo;</p>
                  <textarea
                    value={current.prayers?.[idx] || ''}
                    onChange={(e) => handlePrayerChange(today.day, idx, e.target.value)}
                    onInput={handleTextareaInput}
                    placeholder={`Write your ${prayer.title.toLowerCase()}...`}
                    className="w-full p-2 font-mono text-xs sm:text-sm border-2 rounded-lg focus:outline-none focus:ring-2 resize-none"
                    style={{
                      backgroundColor: 'var(--th-bg-card)',
                      borderColor: 'var(--th-border-hover)',
                      color: 'var(--th-text)',
                      ['--tw-ring-color' as string]: 'var(--th-accent)',
                    }}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Memory Verse Reminder */}
          <div className="border-2 p-4 sm:p-6 space-y-3 rounded-xl" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg)' }}>
            <h3 className="text-xs sm:text-sm font-black uppercase flex items-center gap-2" style={{ color: 'var(--th-accent)' }}>
              <Eye className="h-4 w-4" />
              Daily Memory Verse
            </h3>
            <p className="text-base sm:text-lg italic font-serif leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>&ldquo;{MEMORY_VERSE}&rdquo;</p>
            <p className="text-[10px] sm:text-xs font-mono" style={{ color: 'var(--th-text-muted)' }}>{MEMORY_REFERENCE}</p>
          </div>

          {/* Accountability */}
          <div className="p-3 sm:p-4 border-2 rounded-lg" style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)' }}>
            <label className="block text-[10px] sm:text-xs font-bold uppercase mb-2" style={{ color: 'var(--th-text-muted)' }}>Checked by:</label>
            <input
              type="text"
              placeholder="Teacher/Leader name"
              className="w-full px-2 py-2 focus:outline-none uppercase tracking-wider text-xs sm:text-sm rounded-lg"
              style={{ backgroundColor: 'var(--th-bg)', borderBottom: '2px solid var(--th-accent)', color: 'var(--th-text)' }}
            />
          </div>
        </div>

        {/* WEEK ACTIONS */}
        <div className="mt-6 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Reflect Back', onClick: () => setShowReflect(true) },
            { icon: <Award className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Badges', onClick: () => setShowBadges(true) },
            { icon: <Eye className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Memory Meter', onClick: () => setShowMeter(true) },
            { icon: <Download className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Export Prayers', onClick: exportPrayersToPDF },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="p-3 sm:p-4 border-2 font-bold text-[10px] sm:text-xs uppercase text-center flex flex-col gap-1.5 sm:gap-2 items-center transition-colors active:scale-[0.97] rounded-xl hover:shadow-lg hover:shadow-black/10"
              style={{ backgroundColor: 'var(--th-bg-card)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* MEMORY VERSE QUIZ */}
        <section className="mt-6 sm:mt-12 border-2 sm:border-4 p-4 sm:p-8 space-y-4 sm:space-y-6 rounded-xl" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-bg-card)' }}>
          <h2 className="text-lg sm:text-2xl font-black uppercase">Memory Verse Quiz (John 1:1-5)</h2>
          <div className="border-2 sm:border-4 p-4 sm:p-6 rounded-lg" style={{ borderColor: 'var(--th-border)', backgroundColor: 'var(--th-bg)' }}>
            <p className="text-base sm:text-lg italic font-serif text-center leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>&ldquo;{MEMORY_VERSE}&rdquo;</p>
            <p className="text-[10px] sm:text-xs text-center mt-4 font-mono" style={{ color: 'var(--th-text-muted)' }}>{MEMORY_REFERENCE}</p>
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] sm:text-xs font-bold uppercase mb-2" style={{ color: 'var(--th-accent)' }}>Recite John 1:1-5 from memory:</label>
            <textarea
              value={quiz.answer}
              onChange={(e) => setQuiz((prev) => ({ ...prev, answer: e.target.value }))}
              onInput={handleTextareaInput}
              disabled={quiz.submitted}
              placeholder="Type the entire verse..."
              className="w-full p-3 sm:p-4 font-mono text-xs sm:text-sm border-2 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-40 resize-none"
              style={{
                backgroundColor: 'var(--th-bg)',
                borderColor: 'var(--th-border)',
                color: 'var(--th-text)',
                ['--tw-ring-color' as string]: 'var(--th-accent)',
              }}
              rows={4}
            />
            {!quiz.submitted ? (
              <button onClick={handleQuizSubmit} className="w-full font-black uppercase py-3 transition-all text-sm rounded-lg active:scale-[0.98]" style={{ backgroundColor: 'var(--th-accent)', color: 'var(--th-bg)' }}>
                Check My Answer
              </button>
            ) : (
              <div className="p-3 sm:p-6 border-2 sm:border-4 rounded-xl" style={{ borderColor: quiz.correct ? 'var(--th-success)' : 'var(--th-border)', backgroundColor: quiz.correct ? 'var(--th-accent-dim)' : 'var(--th-bg-card)' }}>
                <p className="font-black uppercase mb-2 text-sm sm:text-base">{quiz.correct ? '\u2713 PERFECT! YOU GOT IT!' : `${quiz.accuracy}% Match`}</p>
                <div className="w-full h-2 rounded-lg mb-3 overflow-hidden" style={{ backgroundColor: 'var(--th-bg-input)' }}>
                  <div className="h-2 transition-all duration-500 rounded-lg" style={{ width: `${quiz.accuracy}%`, backgroundColor: 'var(--th-accent)' }} />
                </div>
                <button onClick={() => setQuiz({ answer: '', submitted: false, correct: false, accuracy: 0 })} className="font-bold uppercase text-xs transition-colors" style={{ color: 'var(--th-accent)' }}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 p-4 sm:p-6 mt-8 sm:mt-12 mb-8" style={{ borderColor: 'var(--th-accent)', backgroundColor: 'var(--th-bg-elevated)' }}>
        <div className="max-w-5xl mx-auto text-center text-[10px] sm:text-xs uppercase tracking-widest" style={{ color: 'var(--th-text-muted)' }}>
          {'\u2713'} All progress saved automatically &middot; Installable as app &middot; Offline support enabled
        </div>
      </footer>

      {/* Theme Selector */}
      <ThemeSelector currentTheme={currentTheme} setTheme={setTheme} />
    </div>
  );
}
