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
  RotateCcw,
  Mail,
  AlertCircle,
  Users,
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

const TEACHER_PASSWORD = 'habits2024';

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
      <div className="bg-black border-4 border-yellow-300 p-4 sm:p-6 max-w-4xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: '#FFEA00' }}>
            WEEK {currentWeek} REFLECTION
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-900 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {DAYS.map((day) => (
            <div key={day} className="bg-gray-900 border-2 border-gray-700 p-3 sm:p-4">
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
      <div className="bg-black border-4 border-yellow-300 p-4 sm:p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: '#FFEA00' }}>
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
      <div className="bg-black border-4 border-yellow-300 p-4 sm:p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: '#FFEA00' }}>
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

function StudentNameModal({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: (name: string) => void;
}) {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-black border-4 border-yellow-300 p-6 sm:p-8 max-w-sm w-full">
        <h2 className="text-2xl font-black mb-2" style={{ color: '#FFEA00' }}>Welcome!</h2>
        <p className="text-gray-400 mb-6 text-sm">What&apos;s your name? This helps your teacher track your progress.</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              onClose(name.trim());
            }
          }}
          placeholder="Enter your name"
          className="w-full bg-gray-900 border-2 border-gray-700 text-white px-4 py-3 mb-4 focus:border-yellow-300 focus:outline-none"
          autoFocus
        />
        <button
          onClick={() => name.trim() && onClose(name.trim())}
          className="w-full bg-yellow-300 text-black font-bold uppercase py-3 hover:bg-yellow-200 transition-colors disabled:opacity-40"
          disabled={!name.trim()}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-black border-4 border-yellow-300 p-6 sm:p-8 max-w-sm w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black" style={{ color: '#FFEA00' }}>Teacher Access</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-900 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-400 mb-4 text-sm">Enter the teacher password to view the dashboard.</p>
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
          className={`w-full bg-gray-900 border-2 ${error ? 'border-red-500' : 'border-gray-700'} text-white px-4 py-3 mb-4 focus:border-yellow-300 focus:outline-none`}
          autoFocus
        />
        {error && <p className="text-red-400 text-xs mb-4">Incorrect password. Try again.</p>}
        <button
          onClick={() => {
            if (password === TEACHER_PASSWORD) onLogin();
            else setError(true);
          }}
          className="w-full bg-yellow-300 text-black font-bold uppercase py-3 hover:bg-yellow-200 transition-colors"
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
    const badges: Badge[] = [];
    const completedDays = DAYS.filter(
      (d) => studentData.weekData?.[d]?.readingComplete && Object.values(studentData.weekData?.[d]?.soap || {}).some((v) => v)
    ).length;
    if (completedDays === 7) badges.push(ALL_BADGES[0]);
    if (completedDays >= 5) badges.push(ALL_BADGES[1]);
    const quizScores = Object.values(studentData.quizHistory || {}).filter((q) => q?.accuracy).map((q) => q.accuracy);
    const avgQuiz = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b) / quizScores.length) : 0;
    if (avgQuiz >= 80) badges.push(ALL_BADGES[2]);
    if (studentData.streak >= 2) badges.push(ALL_BADGES[3]);
    return badges;
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
    const badges = calculateBadges(studentData);
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
${badges.length > 0 ? badges.map((b) => `${b.emoji} ${b.label}`).join('\n') : 'Keep going! Badges unlock as you progress.'}

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
    <div className="min-h-screen bg-black text-white pb-[env(safe-area-inset-bottom)]" style={{ fontFamily: "'Syne', sans-serif" }}>
      {/* Badge Notifications */}
      {badgeNotifications.length > 0 && (
        <div className="fixed top-20 right-4 z-[60] space-y-2 max-w-xs sm:max-w-sm">
          {badgeNotifications.map((notif, idx) => (
            <div key={idx} className="bg-yellow-900 border-4 border-yellow-300 p-3 sm:p-4 rounded animate-pulse">
              <p className="font-black text-yellow-300 text-sm sm:text-base">{notif.emoji} {notif.label}</p>
              <p className="text-xs text-gray-300">{notif.studentName} just unlocked a badge!</p>
              <button onClick={() => setBadgeNotifications((prev) => prev.filter((_, i) => i !== idx))} className="mt-1 text-xs underline text-yellow-400 hover:text-yellow-300">
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Parent Email Modal */}
      {parentEmailMode && selectedStudentForEmail && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-black border-4 border-yellow-300 p-6 sm:p-8 max-w-md w-full">
            <h2 className="text-xl sm:text-2xl font-black mb-6" style={{ color: '#FFEA00' }}>Send to Parents</h2>
            <div className="bg-gray-900 border-2 border-gray-700 p-4 mb-6 rounded">
              <p className="text-sm text-gray-400 mb-2">Student: <span className="font-bold text-white">{selectedStudentForEmail[1].name}</span></p>
              <p className="text-sm text-gray-400">Email: <span className="font-bold text-white">{selectedStudentForEmail[1].email || 'Not provided'}</span></p>
            </div>
            <div className="space-y-3">
              <button onClick={() => sendParentEmail(selectedStudentForEmail[0], selectedStudentForEmail[1])} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold uppercase py-3 flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" /> Open Email Client
              </button>
              <button onClick={() => downloadParentReport(selectedStudentForEmail[0], selectedStudentForEmail[1])} className="w-full bg-gray-800 border-2 border-gray-700 hover:border-yellow-300 text-white font-bold uppercase py-3 flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Download Report
              </button>
              <button onClick={() => { setParentEmailMode(false); setSelectedStudentForEmail(null); }} className="w-full bg-gray-950 border-2 border-gray-700 text-gray-400 font-bold uppercase py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-black border-4 border-yellow-300 p-4 sm:p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black" style={{ color: '#FFEA00' }}>{selectedStudent[1].name}</h2>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-gray-900 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {DAYS.map((day) => {
                const dayData = selectedStudent[1].weekData?.[day];
                const isComplete = dayData?.readingComplete;
                return (
                  <div key={day} className={`border-2 p-3 sm:p-4 ${isComplete ? 'border-green-500 bg-green-950' : 'border-gray-700 bg-gray-950'}`}>
                    <p className="font-bold mb-2 text-sm">{day} {isComplete ? '\u2713' : '\u25CB'}</p>
                    <div className="space-y-1 text-xs text-gray-300">
                      <p><span className="text-yellow-300">S:</span> {dayData?.soap?.scripture?.slice(0, 50) || 'Empty'}...</p>
                      <p><span className="text-yellow-300">O:</span> {dayData?.soap?.observation?.slice(0, 50) || 'Empty'}...</p>
                      <p><span className="text-yellow-300">A:</span> {dayData?.soap?.application?.slice(0, 50) || 'Empty'}...</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={() => { setSelectedStudentForEmail(selectedStudent); setParentEmailMode(true); setSelectedStudent(null); }} className="w-full bg-blue-600 text-white font-bold uppercase py-3">
                Send Parent Report
              </button>
              <button onClick={() => downloadParentReport(selectedStudent[0], selectedStudent[1])} className="w-full bg-gray-800 border-2 border-gray-700 hover:border-yellow-300 text-white font-bold uppercase py-3 flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Download Report
              </button>
              <button onClick={() => setSelectedStudent(null)} className="w-full bg-gray-950 border-2 border-gray-700 text-gray-400 font-bold uppercase py-2">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Header */}
      <header className="border-b-4 border-yellow-300 bg-black p-4 sm:p-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black" style={{ color: '#FFEA00' }}>TEACHER DASHBOARD</h1>
              <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-widest mt-2">Week {currentWeek} &middot; Real-time Analytics</p>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={currentWeek}
                onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
                className="bg-gray-900 border-2 border-gray-700 text-white px-3 sm:px-4 py-2 font-bold uppercase text-sm"
              >
                {[1, 2, 3, 4].map((w) => <option key={w} value={w}>Week {w}</option>)}
              </select>
              <button onClick={onLogout} className="p-2 sm:p-3 bg-gray-900 border-2 border-gray-700 hover:border-yellow-300 text-xs font-bold uppercase">
                Exit
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gray-900 border-4 border-yellow-300 p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Class Size</p>
              <p className="text-2xl sm:text-3xl font-black" style={{ color: '#FFEA00' }}>{metrics.totalStudents}</p>
            </div>
            <div className="bg-gray-900 border-4 border-green-500 p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Avg Completion</p>
              <p className="text-2xl sm:text-3xl font-black text-green-400">{metrics.avgCompletion}%</p>
            </div>
            <div className="bg-gray-900 border-4 border-blue-500 p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">SOAP Quality</p>
              <p className="text-2xl sm:text-3xl font-black text-blue-400">{metrics.avgSoapQuality}%</p>
            </div>
            <div className={`bg-gray-900 border-4 p-3 sm:p-4 ${metrics.behindStudents.length > 0 ? 'border-red-500' : 'border-green-500'}`}>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">At Risk</p>
              <p className={`text-2xl sm:text-3xl font-black ${metrics.behindStudents.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {metrics.behindStudents.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Daily Completion Chart */}
        <div className="bg-gray-900 border-4 border-gray-800 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-black uppercase mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" style={{ color: '#FFEA00' }} />
            Daily Completion Rate
          </h2>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs sm:text-sm font-bold">{day}</span>
                  <span className="text-xs sm:text-sm font-bold" style={{ color: '#FFEA00' }}>{metrics.dailyCompletion[day] || 0}%</span>
                </div>
                <div className="w-full bg-gray-800 h-3 rounded overflow-hidden">
                  <div className="h-full transition-all duration-300" style={{ width: `${metrics.dailyCompletion[day] || 0}%`, backgroundColor: (metrics.dailyCompletion[day] || 0) >= 80 ? '#22c55e' : (metrics.dailyCompletion[day] || 0) >= 50 ? '#eab308' : '#ef4444' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Students */}
        {metrics.behindStudents.length > 0 && (
          <div className="bg-red-950 border-4 border-red-500 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-black uppercase mb-4 flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" /> Students Behind (&lt; 4 Days)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.behindStudents.map(([sid, data]) => {
                const completed = DAYS.filter((d) => data.weekData?.[d]?.readingComplete).length;
                return (
                  <div key={sid} className="bg-black border-2 border-red-500 p-4">
                    <p className="font-bold text-red-400 text-sm">{data.name}</p>
                    <p className="text-xs text-gray-400 mb-3">{completed}/7 days complete</p>
                    <button onClick={() => setSelectedStudent([sid, data])} className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1 font-bold">View Details</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Student Leaderboard */}
        <div className="bg-gray-900 border-4 border-gray-800 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-black uppercase mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: '#FFEA00' }} />
            Student Performance + Parent Reports
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="text-left py-2 px-2 font-bold text-yellow-300">Student</th>
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
                  const badges = calculateBadges(data);
                  return (
                    <tr key={sid} className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedStudent([sid, data])}>
                      <td className="py-3 px-2 font-bold">{data.name}</td>
                      <td className="py-3 px-2 text-center">{completed}/7</td>
                      <td className="py-3 px-2 text-center">{pct}%</td>
                      <td className="py-3 px-2 text-center hidden sm:table-cell">{soapPct}%</td>
                      <td className="py-3 px-2 text-center">{badges.map((b) => b.emoji).join('') || '-'}</td>
                      <td className="py-3 px-2 text-center">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedStudentForEmail([sid, data]); setParentEmailMode(true); }} className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 font-bold text-white">
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
          <button onClick={() => loadStudentData()} className="bg-yellow-300 text-black font-black uppercase py-3 hover:bg-yellow-200 flex items-center justify-center gap-2 text-sm">
            <RotateCcw className="h-4 w-4" /> Refresh Data
          </button>
          <button onClick={() => window.location.reload()} className="bg-gray-900 border-2 border-gray-700 hover:border-yellow-300 font-black uppercase py-3 text-sm">
            Hard Refresh
          </button>
          <button onClick={onLogout} className="bg-gray-900 border-2 border-gray-700 hover:border-yellow-300 font-black uppercase py-3 text-sm">
            Back to Student View
          </button>
        </div>

        <div className="bg-gray-950 border-2 border-gray-700 p-3 text-center text-[10px] sm:text-xs text-gray-500">
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

  // ==================== BADGE FUNCTIONS (declared before useEffect that uses them) ====================
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

  // ==================== BADGE CHECK ON DATA CHANGE ====================
  useEffect(() => {
    if (!studentId || Object.keys(dailyData).length === 0) return;
    const badges = getEarnedBadges();
    badges.forEach((badge) => {
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
  // getMemorizationScore and getEarnedBadges are declared above
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
    return <TeacherDashboardPanel onLogout={() => setIsTeacherMode(false)} />;
  }

  // ==================== LOADING STATE ====================
  if (Object.keys(dailyData).length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-yellow-300 font-bold text-xl animate-pulse">Loading...</p>
      </div>
    );
  }

  // ==================== STUDENT VIEW ====================
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pb-[env(safe-area-inset-bottom)]" style={{ fontFamily: "'Syne', sans-serif" }}>
      {/* Modals */}
      <ReflectBackModal show={showReflect} onClose={() => setShowReflect(false)} dailyData={dailyData} currentWeek={currentWeek} />
      <BadgesModal show={showBadges} onClose={() => setShowBadges(false)} earnedBadges={earnedBadges} />
      <MemorizationMeterModal show={showMeter} onClose={() => setShowMeter(false)} score={memScore} attemptCount={Object.keys(quizHistory).length} />
      {showNameModal && studentId && <StudentNameModal studentId={studentId} onClose={handleNameSubmit} />}
      {showTeacherLogin && <TeacherLoginModal onClose={() => setShowTeacherLogin(false)} onLogin={() => { setIsTeacherMode(true); setShowTeacherLogin(false); }} />}

      {/* Badge Unlock Notification */}
      {badgeUnlocked && (
        <div className="fixed top-20 right-4 z-[60] bg-yellow-900 border-4 border-yellow-300 p-4 sm:p-6 rounded animate-pulse max-w-xs">
          <div className="text-center">
            <p className="text-4xl sm:text-5xl mb-2">{badgeUnlocked.emoji}</p>
            <p className="font-black text-yellow-300 uppercase text-sm sm:text-base">{badgeUnlocked.label}</p>
            <p className="text-xs text-gray-300 mt-2">You unlocked a badge!</p>
          </div>
        </div>
      )}

      {/* Full Header */}
      <header className="border-b-4 border-yellow-300 bg-black p-4 sm:p-6">
        <div className="max-w-5xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-1" style={{ color: '#FFEA00' }}>
                HABITS CLASS: WEEK {currentWeek}
              </h1>
              {studentName && <p className="text-sm text-yellow-400 font-bold">{studentName}</p>}
            </div>
            <button
              onClick={() => setShowTeacherLogin(true)}
              className="text-xs bg-gray-900 border-2 border-gray-700 text-gray-400 px-3 py-2 font-bold uppercase hover:border-yellow-300 hover:text-yellow-300 transition-colors"
            >
              Teacher?
            </button>
          </div>
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
            <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest truncate">
              Daily Devotional &middot; John 1-7 &middot; Knowing God
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500">{completedDays}/7 days progressing</p>
          </div>
          <div className="flex gap-2 text-xs items-center">
            <button onClick={handleUndo} className="p-1 hover:bg-gray-900 rounded" title="Undo">{'\u21B6'}</button>
            <button onClick={() => setShowMeter(true)} className="p-1 hover:bg-gray-900 rounded" title="Memorization">{'\uD83D\uDCCA'} {memScore}%</button>
            <p className={`font-bold text-[10px] sm:text-xs ${saveStatus === 'Saved \u2713' ? 'text-green-400' : 'text-gray-500'}`}>{saveStatus}</p>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <nav className="bg-gray-900 border-b-4 border-gray-800 sticky top-[44px] sm:top-[52px] z-40">
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => currentDay > 0 && setCurrentDay(currentDay - 1)} disabled={currentDay === 0} className="p-2 disabled:opacity-30 flex-shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1 sm:gap-2 justify-center flex-1 min-w-0">
            {DAYS.map((day, idx) => (
              <button
                key={day}
                onClick={() => setCurrentDay(idx)}
                className={`px-2 sm:px-3 py-2 font-bold uppercase text-[10px] sm:text-xs border-2 transition-all flex-shrink-0 ${
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
          <div className="flex items-start justify-between pb-4 sm:pb-6 border-b-2 border-gray-800 gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-3xl font-black mb-1 sm:mb-2">{today.day.toUpperCase()}</h2>
              <p className="text-gray-400 uppercase tracking-widest text-xs sm:text-sm">{today.chapter}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase mb-1">Memory Verse</p>
              <p className="text-[10px] sm:text-xs font-mono text-yellow-300">{MEMORY_REFERENCE}</p>
            </div>
          </div>

          {/* TASK A: BIBLE READING */}
          <section className="space-y-4">
            <h3 className="text-base sm:text-xl font-black uppercase flex items-center gap-2">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FFEA00' }} />
              Read {today.chapter}
            </h3>
            <button
              onClick={() => toggleReading(today.day)}
              className={`w-full p-4 sm:p-6 border-2 sm:border-4 font-bold uppercase transition-all text-sm sm:text-lg ${
                current.readingComplete
                  ? 'border-yellow-300 bg-yellow-300 text-black'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-yellow-300'
              }`}
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
          <section className="space-y-4 border-t-2 border-gray-800 pt-6 sm:pt-8">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-xl font-black uppercase flex items-center gap-2 mb-1 sm:mb-2">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FFEA00' }} />
                  Daily S.O.A.P.
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">{today.soapRange}</p>
              </div>
              <button onClick={copySoapEntry} className="p-2 hover:bg-gray-800 rounded flex-shrink-0" title="Copy SOAP">
                <Copy className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-black border-2 border-gray-700 p-3 sm:p-4 mb-4">
              <p className="text-xs sm:text-sm italic text-gray-300">&ldquo;{today.soapText}&rdquo;</p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {SOAP_FIELDS.map((field) => (
                <div key={field.key} className="border-l-4 border-yellow-300 pl-3 sm:pl-6">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase text-yellow-300 mb-2">{field.label}</label>
                  <textarea
                    value={current.soap?.[field.key] || ''}
                    onChange={(e) => handleSoapChange(today.day, field.key, e.target.value)}
                    onInput={handleTextareaInput}
                    placeholder={`Write your ${field.key}...`}
                    className="w-full bg-black border-2 border-gray-700 text-white p-3 font-mono text-xs sm:text-sm focus:border-yellow-300 focus:outline-none resize-none"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* TASK C: THREE DAILY PRAYERS */}
          <section className="space-y-4 border-t-2 border-gray-800 pt-6 sm:pt-8">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-xl font-black uppercase flex items-center gap-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FFEA00' }} />
                Prayer Prompts
              </h3>
              <button onClick={exportPrayersToPDF} className="p-2 hover:bg-gray-800 rounded text-xs flex gap-1 items-center flex-shrink-0">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>

            <div className="space-y-4">
              {PRAYERS.map((prayer, idx) => (
                <div key={idx} className="bg-black border-2 border-gray-700 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-bold uppercase text-yellow-300 mb-2 sm:mb-3">{prayer.title}</p>
                  <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 italic">&ldquo;{prayer.prompt}&rdquo;</p>
                  <textarea
                    value={current.prayers?.[idx] || ''}
                    onChange={(e) => handlePrayerChange(today.day, idx, e.target.value)}
                    onInput={handleTextareaInput}
                    placeholder={`Write your ${prayer.title.toLowerCase()}...`}
                    className="w-full bg-gray-950 border-2 border-gray-600 text-white p-2 font-mono text-xs sm:text-sm focus:border-yellow-300 focus:outline-none resize-none"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Memory Verse Reminder */}
          <div className="bg-black border-4 border-gray-700 p-4 sm:p-6 space-y-3">
            <h3 className="text-xs sm:text-sm font-black uppercase flex items-center gap-2 text-yellow-300">
              <Eye className="h-4 w-4" />
              Daily Memory Verse
            </h3>
            <p className="text-base sm:text-lg italic font-serif text-gray-300 leading-relaxed">&ldquo;{MEMORY_VERSE}&rdquo;</p>
            <p className="text-[10px] sm:text-xs text-gray-500 font-mono">{MEMORY_REFERENCE}</p>
          </div>

          {/* Accountability */}
          <div className="p-3 sm:p-4 bg-gray-950 border-2 border-gray-700">
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-gray-400 mb-2">Checked by:</label>
            <input
              type="text"
              placeholder="Teacher/Leader name"
              className="w-full bg-black border-b-2 border-yellow-300 text-white px-2 py-2 focus:outline-none uppercase tracking-wider text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* WEEK ACTIONS */}
        <div className="mt-6 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <button onClick={() => setShowReflect(true)} className="p-3 sm:p-4 bg-gray-900 border-2 border-gray-700 font-bold text-[10px] sm:text-xs uppercase hover:border-yellow-300 active:bg-gray-800 text-center flex flex-col gap-1.5 sm:gap-2 items-center transition-colors">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" /><span>Reflect Back</span>
          </button>
          <button onClick={() => setShowBadges(true)} className="p-3 sm:p-4 bg-gray-900 border-2 border-gray-700 font-bold text-[10px] sm:text-xs uppercase hover:border-yellow-300 active:bg-gray-800 text-center flex flex-col gap-1.5 sm:gap-2 items-center transition-colors">
            <Award className="h-4 w-4 sm:h-5 sm:w-5" /><span>Badges</span>
          </button>
          <button onClick={() => setShowMeter(true)} className="p-3 sm:p-4 bg-gray-900 border-2 border-gray-700 font-bold text-[10px] sm:text-xs uppercase hover:border-yellow-300 active:bg-gray-800 text-center flex flex-col gap-1.5 sm:gap-2 items-center transition-colors">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" /><span>Memory Meter</span>
          </button>
          <button onClick={exportPrayersToPDF} className="p-3 sm:p-4 bg-gray-900 border-2 border-gray-700 font-bold text-[10px] sm:text-xs uppercase hover:border-yellow-300 active:bg-gray-800 text-center flex flex-col gap-1.5 sm:gap-2 items-center transition-colors">
            <Download className="h-4 w-4 sm:h-5 sm:w-5" /><span>Export Prayers</span>
          </button>
        </div>

        {/* MEMORY VERSE QUIZ */}
        <section className="mt-6 sm:mt-12 bg-gray-900 border-2 sm:border-4 border-yellow-300 p-4 sm:p-8 space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-2xl font-black uppercase">Memory Verse Quiz (John 1:1-5)</h2>
          <div className="bg-black border-2 sm:border-4 border-gray-800 p-4 sm:p-6">
            <p className="text-base sm:text-lg italic font-serif text-gray-300 text-center leading-relaxed">&ldquo;{MEMORY_VERSE}&rdquo;</p>
            <p className="text-[10px] sm:text-xs text-gray-600 text-center mt-4 font-mono">{MEMORY_REFERENCE}</p>
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-yellow-300 mb-2">Recite John 1:1-5 from memory:</label>
            <textarea
              value={quiz.answer}
              onChange={(e) => setQuiz((prev) => ({ ...prev, answer: e.target.value }))}
              onInput={handleTextareaInput}
              disabled={quiz.submitted}
              placeholder="Type the entire verse..."
              className="w-full bg-black border-2 border-gray-700 text-white p-3 sm:p-4 font-mono text-xs sm:text-sm focus:border-yellow-300 focus:outline-none disabled:opacity-40 resize-none"
              rows={4}
            />
            {!quiz.submitted ? (
              <button onClick={handleQuizSubmit} className="w-full bg-yellow-300 text-black font-black uppercase py-3 hover:bg-yellow-200 transition-all text-sm">
                Check My Answer
              </button>
            ) : (
              <div className={`p-3 sm:p-6 border-2 sm:border-4 ${quiz.correct ? 'border-green-500 bg-green-950' : 'border-gray-600 bg-gray-950'}`}>
                <p className="font-black uppercase mb-2 text-sm sm:text-base">{quiz.correct ? '\u2713 PERFECT! YOU GOT IT!' : `${quiz.accuracy}% Match`}</p>
                <div className="w-full bg-gray-800 h-2 rounded mb-3">
                  <div className="bg-yellow-300 h-2 transition-all duration-500" style={{ width: `${quiz.accuracy}%` }} />
                </div>
                <button onClick={() => setQuiz({ answer: '', submitted: false, correct: false, accuracy: 0 })} className="text-yellow-300 font-bold uppercase text-xs hover:text-yellow-200">
                  Try Again
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t-4 border-yellow-300 p-4 sm:p-6 mt-8 sm:mt-12 mb-8">
        <div className="max-w-5xl mx-auto text-center text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">
          {'\u2713'} All progress saved automatically &middot; Installable as app &middot; Offline support enabled
        </div>
      </footer>
    </div>
  );
}
