'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

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

// ==================== MODAL COMPONENTS ====================
function ReflectBackModal({
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
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-black border-4 border-yellow-300 p-6 max-w-4xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black" style={{ color: '#FFEA00' }}>
            WEEK {currentWeek} REFLECTION
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-900 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {DAYS.map((day) => (
            <div key={day} className="bg-gray-900 border-2 border-gray-700 p-4">
              <p className="text-sm font-bold text-yellow-300 mb-2">{day.toUpperCase()}</p>
              <div className="text-xs space-y-2 text-gray-300">
                <p>
                  <span className="text-yellow-300">S:</span>{' '}
                  {dailyData[day]?.soap?.scripture?.slice(0, 40)}
                  {dailyData[day]?.soap?.scripture?.length > 40 ? '...' : ''}
                </p>
                <p>
                  <span className="text-yellow-300">O:</span>{' '}
                  {dailyData[day]?.soap?.observation?.slice(0, 40)}
                  {dailyData[day]?.soap?.observation?.length > 40 ? '...' : ''}
                </p>
                <p>
                  <span className="text-yellow-300">A:</span>{' '}
                  {dailyData[day]?.soap?.application?.slice(0, 40)}
                  {dailyData[day]?.soap?.application?.length > 40 ? '...' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-gray-950 border-2 border-gray-700 text-xs text-gray-400">
          <p>Growth Arc: {DAYS.length} days of spiritual reflection across John 3:1-21</p>
        </div>
      </div>
    </div>
  );
}

function BadgesModal({
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
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-black border-4 border-yellow-300 p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black" style={{ color: '#FFEA00' }}>
            YOUR BADGES
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-900 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {ALL_BADGES.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 border-2 text-center ${
                  isEarned ? 'border-yellow-300 bg-yellow-300/10' : 'border-gray-700 bg-gray-950 opacity-50'
                }`}
              >
                <p className="text-3xl mb-2">{isEarned ? badge.emoji : '?'}</p>
                <p className={`text-sm font-bold ${isEarned ? 'text-yellow-300' : 'text-gray-500'}`}>
                  {badge.label}
                </p>
                {isEarned && <p className="text-xs text-green-400 mt-1">Earned!</p>}
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-3 bg-gray-950 border border-gray-700 text-xs text-gray-400">
          <p>Complete activities to unlock badges. Each badge represents a milestone in your spiritual journey!</p>
        </div>
      </div>
    </div>
  );
}

function MemorizationMeterModal({
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
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-black border-4 border-yellow-300 p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black" style={{ color: '#FFEA00' }}>
            MEMORIZATION METER
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-900 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="text-center mb-6">
          <p className="text-5xl font-black mb-2" style={{ color: '#FFEA00' }}>
            {score}%
          </p>
          <p className="text-sm text-gray-400">Average quiz accuracy across all attempts</p>
        </div>
        <div className="w-full bg-gray-800 h-4 rounded mb-6">
          <div
            className="h-4 rounded transition-all duration-500"
            style={{
              width: `${score}%`,
              backgroundColor: score >= 80 ? '#22c55e' : score >= 50 ? '#FFEA00' : '#ef4444',
            }}
          />
        </div>
        <div className="space-y-2 text-xs text-gray-400">
          <p>
            <span className="text-yellow-300">0-49%:</span> Keep practicing! Repetition builds memory.
          </p>
          <p>
            <span className="text-yellow-300">50-79%:</span> Getting there! You&apos;re making progress.
          </p>
          <p>
            <span className="text-yellow-300">80-100%:</span> Memory Master! You&apos;ve memorized the verse.
          </p>
        </div>
        {attemptCount > 0 && (
          <div className="mt-4 p-3 bg-gray-950 border border-gray-700 text-xs text-gray-500">
            <p>Attempts: {attemptCount} days completed</p>
          </div>
        )}
      </div>
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
  // These are initialized via lazy state above but we keep setters for updates
  const [currentWeek] = useState(1);

  // ==================== INITIALIZATION ====================
  // Load quiz history from localStorage (safe to read during init)
  const [savedQuizHistory] = useState<Record<string, QuizHistoryEntry>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem('habitsQuizHistory');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [savedStreak] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = localStorage.getItem('habitsStreak');
      return raw ? JSON.parse(raw) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .catch((err) => console.log('SW registration failed:', err));
    }

    // Load daily data from localStorage
    const saved = localStorage.getItem('habitsWeek1Daily');
    let parsed: Record<string, DayData> | null = null;

    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch {
        parsed = null;
      }
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

    // Use a microtask to avoid cascading render warning
    void parsed;
    requestAnimationFrame(() => {
      setDailyData(parsed!);
      setStreakCount(savedStreak);
      setQuizHistory(savedQuizHistory);
    });
  }, []);

  // ==================== AUTO-SAVE WITH HISTORY ====================
  useEffect(() => {
    if (Object.keys(dailyData).length === 0) return;

    const timer = setTimeout(() => {
      localStorage.setItem('habitsWeek1Daily', JSON.stringify(dailyData));

      setHistory((prev) => [...prev.slice(-9), { timestamp: new Date().toISOString(), data: dailyData }]);

      setSaveStatus('Saved \u2713');
      const clearTimer = setTimeout(() => setSaveStatus(''), 2000);
      return () => clearTimeout(clearTimer);
    }, 300);
    return () => clearTimeout(timer);
  }, [dailyData]);

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

  const toggleReading = useCallback(
    (day: string) => {
      setDailyData((prev) => ({
        ...prev,
        [day]: { ...prev[day], readingComplete: !prev[day]?.readingComplete },
      }));
    },
    []
  );

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
    const soapText = `
S.O.A.P. - ${todayEntry.soapRange}
Scripture: ${current.soap?.scripture}
Observation: ${current.soap?.observation}
Application: ${current.soap?.application}
Prayer: ${current.soap?.prayer}
    `.trim();
    copyToClipboard(soapText, 'SOAP Entry');
  };

  // ==================== QUIZ & MEMORIZATION METER ====================
  const handleQuizSubmit = () => {
    const answer = quiz.answer.toLowerCase();
    const correctWords = ['beginning', 'word', 'god'];
    const matchedWords = correctWords.filter((w) => answer.includes(w)).length;
    const accuracy = Math.round((matchedWords / correctWords.length) * 100);
    const isCorrect = matchedWords >= 2;
    const day = SCHEDULE[currentDay].day;

    setQuiz((prev) => ({ ...prev, submitted: true, correct: isCorrect, accuracy }));

    setQuizHistory((prev) => ({
      ...prev,
      [day]: { ...prev[day], accuracy, timestamp: new Date().toISOString() },
    }));
    localStorage.setItem('habitsQuizHistory', JSON.stringify(quizHistory));
  };

  const getMemorizationScore = (): number => {
    const scores = Object.values(quizHistory)
      .filter((q) => q?.accuracy)
      .map((q) => q.accuracy);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  };

  // ==================== BADGES & GAMIFICATION ====================
  const getEarnedBadges = (): Badge[] => {
    const badges: Badge[] = [];
    const completedDaysCount = Object.keys(dailyData).filter(
      (day) => dailyData[day]?.readingComplete && Object.values(dailyData[day]?.soap || {}).some((v) => v)
    ).length;

    if (completedDaysCount === 7) badges.push(ALL_BADGES[0]);
    if (completedDaysCount >= 5) badges.push(ALL_BADGES[1]);
    if (getMemorizationScore() >= 80) badges.push(ALL_BADGES[2]);
    if (streakCount >= 2) badges.push(ALL_BADGES[3]);

    return badges;
  };

  // ==================== PDF EXPORT ====================
  const exportPrayersToPDF = () => {
    const day = SCHEDULE[currentDay].day;
    let prayerText = `
HABITS CLASS - WEEK ${currentWeek} PRAYERS
${new Date().toLocaleDateString()}

`;

    PRAYERS.forEach((p, idx) => {
      prayerText += `
${p.title.toUpperCase()}
${dailyData[day]?.prayers?.[idx] || '[No entry]'}

---
`;
    });

    prayerText += `
Keep these close to your heart.
May God guide your path.
    `.trim();

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
  const earnedBadgeIds = badges.map((b) => b.id);

  if (Object.keys(dailyData).length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-yellow-300 font-bold text-xl animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pb-[env(safe-area-inset-bottom)]" style={{ fontFamily: "'Syne', sans-serif" }}>
      <ReflectBackModal show={showReflect} onClose={() => setShowReflect(false)} dailyData={dailyData} currentWeek={currentWeek} />
      <BadgesModal show={showBadges} onClose={() => setShowBadges(false)} earnedBadges={earnedBadgeIds} />
      <MemorizationMeterModal show={showMeter} onClose={() => setShowMeter(false)} score={memScore} attemptCount={Object.keys(quizHistory).length} />

      {/* Full Header */}
      <header className="border-b-4 border-yellow-300 bg-black p-4 sm:p-6">
        <div className="max-w-5xl mx-auto px-2 sm:px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2" style={{ color: '#FFEA00' }}>
            HABITS CLASS: WEEK {currentWeek}
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap">
            <span className="text-xs bg-yellow-300 text-black px-2 py-1 font-bold">
              {'\uD83D\uDD25'} {streakCount} week streak
            </span>
            {badges.map((b) => (
              <span key={b.id} className="text-xs bg-gray-800 text-yellow-300 px-2 py-1 font-bold">
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Sticky Minimal Header */}
      <div className="sticky top-0 z-50 bg-black border-b-4 border-yellow-300 px-3 sm:px-6 py-2 sm:py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-widest truncate">
              Daily Devotional &middot; John 1-7 &middot; Knowing God
            </p>
            <p className="text-xs text-gray-500">{completedDays}/7 days progressing</p>
          </div>
          <div className="flex gap-2 text-xs items-center">
            <button onClick={handleUndo} className="p-1 hover:bg-gray-900 rounded" title="Undo">
              {'\u21B6'}
            </button>
            <button onClick={() => setShowMeter(true)} className="p-1 hover:bg-gray-900 rounded" title="Memorization">
              {'\uD83D\uDCCA'} {memScore}%
            </button>
            <p className={`font-bold ${saveStatus === 'Saved \u2713' ? 'text-green-400' : 'text-gray-500'}`}>
              {saveStatus}
            </p>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <nav className="bg-gray-900 border-b-4 border-gray-800 sticky top-[52px] sm:top-16 z-40">
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => currentDay > 0 && setCurrentDay(currentDay - 1)} disabled={currentDay === 0} className="p-2 disabled:opacity-30 flex-shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2 justify-center flex-1 min-w-0">
            {DAYS.map((day, idx) => (
              <button
                key={day}
                onClick={() => setCurrentDay(idx)}
                className={`px-2.5 py-2 font-bold uppercase text-xs border-2 transition-all flex-shrink-0 ${
                  currentDay === idx
                    ? 'border-yellow-300 bg-yellow-300 text-black'
                    : dailyData[day]?.readingComplete && Object.values(dailyData[day]?.soap || {}).some((v) => v)
                    ? 'border-green-500 bg-green-950 text-green-300'
                    : 'border-gray-700 bg-gray-950 text-gray-400'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          <button onClick={() => currentDay < 6 && setCurrentDay(currentDay + 1)} disabled={currentDay === 6} className="p-2 disabled:opacity-30 flex-shrink-0">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="w-full max-w-5xl mx-auto px-2 sm:px-6 py-4 sm:py-6">
        {/* Daily Devotional Card */}
        <div className="bg-gray-900 border-2 sm:border-4 border-yellow-300 p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-hidden rounded-sm">
          {/* Day Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-gray-800">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">{today.day.toUpperCase()}</h2>
              <p className="text-gray-400 uppercase tracking-widest text-sm">{today.chapter}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase mb-2">Memory Verse</p>
              <p className="text-xs font-mono text-yellow-300">{MEMORY_REFERENCE}</p>
            </div>
          </div>

          {/* TASK A: BIBLE READING */}
          <section className="space-y-4">
            <h3 className="text-lg sm:text-xl font-black uppercase flex items-center gap-2">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FFEA00' }} />
              Read {today.chapter}
            </h3>
            <button
              onClick={() => toggleReading(today.day)}
              className={`w-full p-4 sm:p-6 border-2 sm:border-4 font-bold uppercase transition-all text-base sm:text-lg ${
                current.readingComplete
                  ? 'border-yellow-300 bg-yellow-300 text-black'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-yellow-300'
              }`}
            >
              {current.readingComplete ? (
                <span className="flex items-center justify-center gap-3">
                  <Check className="h-6 w-6" />
                  Reading Complete {'\u2713'}
                </span>
              ) : (
                'Mark Reading Complete'
              )}
            </button>
          </section>

          {/* TASK B: DAILY S.O.A.P. */}
          <section className="space-y-4 border-t-2 border-gray-800 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FFEA00' }} />
                  Daily S.O.A.P.
                </h3>
                <p className="text-gray-400 text-sm">{today.soapRange}</p>
              </div>
              <button onClick={copySoapEntry} className="p-2 hover:bg-gray-800 rounded" title="Copy SOAP">
                <Copy className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-black border-2 border-gray-700 p-4 mb-4">
              <p className="text-sm italic text-gray-300">&ldquo;{today.soapText}&rdquo;</p>
            </div>

            <div className="space-y-5">
              {SOAP_FIELDS.map((field) => (
                <div key={field.key} className="border-l-4 border-yellow-300 pl-4 sm:pl-6">
                  <label className="block text-xs font-bold uppercase text-yellow-300 mb-2">{field.label}</label>
                  <textarea
                    value={current.soap?.[field.key] || ''}
                    onChange={(e) => handleSoapChange(today.day, field.key, e.target.value)}
                    onInput={handleTextareaInput}
                    placeholder={`Write your ${field.key}...`}
                    className="w-full bg-black border-2 border-gray-700 text-white p-3 font-mono text-sm focus:border-yellow-300 focus:outline-none resize-none"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* TASK C: THREE DAILY PRAYERS */}
          <section className="space-y-4 border-t-2 border-gray-800 pt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase flex items-center gap-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FFEA00' }} />
                Prayer Prompts
              </h3>
              <button onClick={exportPrayersToPDF} className="p-2 hover:bg-gray-800 rounded text-xs flex gap-1 items-center">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>

            <div className="space-y-4">
              {PRAYERS.map((prayer, idx) => (
                <div key={idx} className="bg-black border-2 border-gray-700 p-4">
                  <p className="text-xs font-bold uppercase text-yellow-300 mb-3">{prayer.title}</p>
                  <p className="text-sm text-gray-400 mb-3 italic">&ldquo;{prayer.prompt}&rdquo;</p>
                  <textarea
                    value={current.prayers?.[idx] || ''}
                    onChange={(e) => handlePrayerChange(today.day, idx, e.target.value)}
                    onInput={handleTextareaInput}
                    placeholder={`Write your ${prayer.title.toLowerCase()}...`}
                    className="w-full bg-gray-950 border-2 border-gray-600 text-white p-2 font-mono text-sm focus:border-yellow-300 focus:outline-none resize-none"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Memory Verse Reminder */}
          <div className="bg-black border-4 border-gray-700 p-6 space-y-3 border-t-2 border-gray-800 pt-8">
            <h3 className="text-sm font-black uppercase flex items-center gap-2 text-yellow-300">
              <Eye className="h-4 w-4" />
              Daily Memory Verse
            </h3>
            <p className="text-lg italic font-serif text-gray-300 leading-relaxed">&ldquo;{MEMORY_VERSE}&rdquo;</p>
            <p className="text-xs text-gray-500 font-mono">{MEMORY_REFERENCE}</p>
          </div>

          {/* Accountability */}
          <div className="p-4 bg-gray-950 border-2 border-gray-700">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Checked by:</label>
            <input
              type="text"
              placeholder="Teacher/Leader name"
              className="w-full bg-black border-b-2 border-yellow-300 text-white px-2 py-2 focus:outline-none uppercase tracking-wider text-sm"
            />
          </div>
        </div>

        {/* WEEK ACTIONS */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <button
            onClick={() => setShowReflect(true)}
            className="p-3 sm:p-4 bg-gray-900 border-2 border-gray-700 font-bold text-[10px] sm:text-xs uppercase hover:border-yellow-300 active:bg-gray-800 text-center flex flex-col gap-1.5 sm:gap-2 items-center transition-colors"
          >
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Reflect Back</span>
          </button>
          <button
            onClick={() => setShowBadges(true)}
            className="p-3 sm:p-4 bg-gray-900 border-2 border-gray-700 font-bold text-[10px] sm:text-xs uppercase hover:border-yellow-300 active:bg-gray-800 text-center flex flex-col gap-1.5 sm:gap-2 items-center transition-colors"
          >
            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Badges</span>
          </button>
          <button
            onClick={() => setShowMeter(true)}
            className="p-3 sm:p-4 bg-gray-900 border-2 border-gray-700 font-bold text-[10px] sm:text-xs uppercase hover:border-yellow-300 active:bg-gray-800 text-center flex flex-col gap-1.5 sm:gap-2 items-center transition-colors"
          >
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Memory Meter</span>
          </button>
          <button
            onClick={exportPrayersToPDF}
            className="p-3 sm:p-4 bg-gray-900 border-2 border-gray-700 font-bold text-[10px] sm:text-xs uppercase hover:border-yellow-300 active:bg-gray-800 text-center flex flex-col gap-1.5 sm:gap-2 items-center transition-colors"
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Export Prayers</span>
          </button>
        </div>

        {/* MEMORY VERSE QUIZ */}
        <section className="mt-8 sm:mt-12 bg-gray-900 border-2 sm:border-4 border-yellow-300 p-4 sm:p-8 space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-black uppercase">Memory Verse Quiz (John 1:1-5)</h2>

          <div className="bg-black border-2 sm:border-4 border-gray-800 p-4 sm:p-6">
            <p className="text-lg italic font-serif text-gray-300 text-center leading-relaxed">
              &ldquo;{MEMORY_VERSE}&rdquo;
            </p>
            <p className="text-xs text-gray-600 text-center mt-4 font-mono">{MEMORY_REFERENCE}</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-yellow-300 mb-2">
              Recite John 1:1-5 from memory:
            </label>
            <textarea
              value={quiz.answer}
              onChange={(e) => setQuiz((prev) => ({ ...prev, answer: e.target.value }))}
              onInput={handleTextareaInput}
              disabled={quiz.submitted}
              placeholder="Type the entire verse..."
              className="w-full bg-black border-2 border-gray-700 text-white p-4 font-mono text-sm focus:border-yellow-300 focus:outline-none disabled:opacity-40 resize-none"
              rows={4}
            />

            {!quiz.submitted ? (
              <button
                onClick={handleQuizSubmit}
                className="w-full bg-yellow-300 text-black font-black uppercase py-3 hover:bg-yellow-200 transition-all text-sm"
              >
                Check My Answer
              </button>
            ) : (
              <div
                className={`p-4 sm:p-6 border-2 sm:border-4 ${quiz.correct ? 'border-green-500 bg-green-950' : 'border-gray-600 bg-gray-950'}`}
              >
                <p className="font-black uppercase mb-2">
                  {quiz.correct ? '\u2713 PERFECT! YOU GOT IT!' : `${quiz.accuracy}% Match`}
                </p>
                <div className="w-full bg-gray-800 h-2 rounded mb-3">
                  <div
                    className="bg-yellow-300 h-2 transition-all duration-500"
                    style={{ width: `${quiz.accuracy}%` }}
                  />
                </div>
                <button
                  onClick={() => setQuiz({ answer: '', submitted: false, correct: false, accuracy: 0 })}
                  className="text-yellow-300 font-bold uppercase text-xs hover:text-yellow-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t-4 border-yellow-300 p-6 mt-12 mb-8">
        <div className="max-w-5xl mx-auto text-center text-xs text-gray-500 uppercase tracking-widest">
          {'\u2713'} All progress saved automatically &middot; Installable as app &middot; Offline support enabled
        </div>
      </footer>
    </div>
  );
}
