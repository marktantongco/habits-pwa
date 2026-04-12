import React, { useState, useEffect, useRef } from 'react';
import { Check, BookOpen, Lightbulb, MessageSquare, Eye, ChevronLeft, ChevronRight, Copy, RotateCcw, Award, BarChart3, Download, Calendar, X } from 'lucide-react';

export default function HabitsTracker() {
  // ==================== STATE ====================
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [currentDay, setCurrentDay] = useState(0);
  const [dailyData, setDailyData] = useState({});
  const [quiz, setQuiz] = useState({ answer: '', submitted: false, correct: false });
  const [saveStatus, setSaveStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [allWeeks, setAllWeeks] = useState({});
  const [showReflect, setShowReflect] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showMeter, setShowMeter] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [quizHistory, setQuizHistory] = useState({});
  const clipboardRef = useRef(null);

  // ==================== SCHEDULE ====================
  const schedule = [
    { day: 'Monday', chapter: 'John 1', soapRange: 'John 3:1-3', soapText: 'Nicodemus came to Jesus at night...' },
    { day: 'Tuesday', chapter: 'John 2', soapRange: 'John 3:4-6', soapText: 'How can someone be born when they are old?...' },
    { day: 'Wednesday', chapter: 'John 3', soapRange: 'John 3:7-9', soapText: 'The wind blows wherever it pleases...' },
    { day: 'Thursday', chapter: 'John 4', soapRange: 'John 3:10-12', soapText: 'You are Israel\'s teacher...we speak of what we know...' },
    { day: 'Friday', chapter: 'John 5', soapRange: 'John 3:13-15', soapText: 'No one has ever gone into heaven except the one who came from heaven...' },
    { day: 'Saturday', chapter: 'John 6', soapRange: 'John 3:16-18', soapText: 'For God so loved the world that he gave his one and only Son...' },
    { day: 'Sunday', chapter: 'John 7', soapRange: 'John 3:19-21', soapText: 'This is the verdict: Light has come into the world...' }
  ];

  const prayers = [
    { title: 'See Prayer', prompt: 'What is God showing you in today\'s reading? What does He want you to see?' },
    { title: 'Surrender Prayer', prompt: 'How will you surrender to what God is teaching you today?' },
    { title: 'Send Prayer', prompt: 'How will you live out this truth? Who needs to see Jesus in you this week?' }
  ];

  const memoryVerse = 'In the beginning was the Word, and the Word was with God, and the Word was God.';
  const memoryReference = 'John 1:1-5';

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(err => console.log('SW registration failed:', err));
    }

    // Load all data from localStorage
    const saved = localStorage.getItem('habitsWeek1Daily');
    const savedWeeks = localStorage.getItem('habitsAllWeeks');
    const savedStreak = localStorage.getItem('habitsStreak');
    const savedQuizHistory = localStorage.getItem('habitsQuizHistory');

    if (saved) setDailyData(JSON.parse(saved));
    else initializeWeek();

    if (savedWeeks) setAllWeeks(JSON.parse(savedWeeks));
    if (savedStreak) setStreakCount(JSON.parse(savedStreak));
    if (savedQuizHistory) setQuizHistory(JSON.parse(savedQuizHistory));
  }, []);

  const initializeWeek = () => {
    const init = {};
    days.forEach(day => {
      init[day] = {
        readingComplete: false,
        soap: { scripture: '', observation: '', application: '', prayer: '' },
        prayers: { 0: '', 1: '', 2: '' },
        checkedBy: ''
      };
    });
    setDailyData(init);
  };

  // ==================== AUTO-SAVE WITH HISTORY ====================
  useEffect(() => {
    if (Object.keys(dailyData).length > 0) {
      setSaveStatus('Saving...');
      const timer = setTimeout(() => {
        localStorage.setItem('habitsWeek1Daily', JSON.stringify(dailyData));
        
        // Track history for undo
        setHistory(prev => [...prev.slice(-9), { timestamp: new Date().toISOString(), data: dailyData }]);
        
        setSaveStatus('Saved ✓');
        const clearTimer = setTimeout(() => setSaveStatus(''), 2000);
        return () => clearTimeout(clearTimer);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [dailyData, quiz]);

  // ==================== UTILITY FUNCTIONS ====================
  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 400) + 'px';
  };

  const handleSoapChange = (field, value) => {
    setDailyData(prev => ({
      ...prev,
      [today.day]: {
        ...prev[today.day],
        soap: { ...prev[today.day]?.soap, [field]: value }
      }
    }));
  };

  const handlePrayerChange = (index, value) => {
    setDailyData(prev => ({
      ...prev,
      [today.day]: {
        ...prev[today.day],
        prayers: { ...prev[today.day]?.prayers, [index]: value }
      }
    }));
  };

  const toggleReading = () => {
    setDailyData(prev => ({
      ...prev,
      [today.day]: { ...prev[today.day], readingComplete: !prev[today.day]?.readingComplete }
    }));
  };

  // ==================== UNDO FUNCTION ====================
  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1].data;
      setDailyData(previousState);
      setHistory(prev => prev.slice(0, -1));
      setSaveStatus('Undone ↶');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  // ==================== CLIPBOARD ====================
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setSaveStatus(`Copied ${label}!`);
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const copySoapEntry = () => {
    const soapText = `
S.O.A.P. - ${today.soapRange}
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
    const matchedWords = correctWords.filter(w => answer.includes(w)).length;
    const accuracy = Math.round((matchedWords / correctWords.length) * 100);
    const isCorrect = matchedWords >= 2;

    setQuiz(prev => ({ ...prev, submitted: true, correct: isCorrect, accuracy }));

    // Track quiz attempt
    setQuizHistory(prev => ({
      ...prev,
      [today.day]: { ...prev[today.day], accuracy, timestamp: new Date().toISOString() }
    }));
    localStorage.setItem('habitsQuizHistory', JSON.stringify(quizHistory));
  };

  const getMemorizationScore = () => {
    const scores = Object.values(quizHistory).filter(q => q?.accuracy).map(q => q.accuracy);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  };

  // ==================== BADGES & GAMIFICATION ====================
  const getBadges = () => {
    const badges = [];
    const completedDays = Object.keys(dailyData).filter(
      day => dailyData[day]?.readingComplete && Object.values(dailyData[day]?.soap || {}).some(v => v)
    ).length;

    if (completedDays === 7) badges.push({ id: 'perfect-week', label: 'Perfect Week!', emoji: '⭐' });
    if (completedDays >= 5) badges.push({ id: 'streak', label: 'On Fire!', emoji: '🔥' });
    if (getMemorizationScore() >= 80) badges.push({ id: 'memory-master', label: 'Memory Master', emoji: '🧠' });
    if (streakCount >= 2) badges.push({ id: 'consistency', label: 'Consistent', emoji: '💪' });

    return badges;
  };

  // ==================== REFLECT BACK (WEEK SUMMARY) ====================
  const ReflectBackModal = () => {
    if (!showReflect) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-black border-4 border-yellow-300 p-6 max-w-4xl w-full my-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black" style={{ color: '#FFEA00' }}>WEEK {currentWeek} REFLECTION</h2>
            <button onClick={() => setShowReflect(false)} className="p-2"><X className="h-6 w-6" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {days.map(day => (
              <div key={day} className="bg-gray-900 border-2 border-gray-700 p-4">
                <p className="text-sm font-bold text-yellow-300 mb-2">{day.toUpperCase()}</p>
                <div className="text-xs space-y-2 text-gray-300">
                  <p><span className="text-yellow-300">S:</span> {dailyData[day]?.soap?.scripture?.slice(0, 40)}...</p>
                  <p><span className="text-yellow-300">O:</span> {dailyData[day]?.soap?.observation?.slice(0, 40)}...</p>
                  <p><span className="text-yellow-300">A:</span> {dailyData[day]?.soap?.application?.slice(0, 40)}...</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-950 border-2 border-gray-700 text-xs text-gray-400">
            <p>Growth Arc: {days.length} days of spiritual reflection across John 3:1-21</p>
          </div>
        </div>
      </div>
    );
  };

  // ==================== PDF EXPORT ====================
  const exportPrayersToPDF = () => {
    const prayerText = `
HABITS CLASS - WEEK ${currentWeek} PRAYERS
${new Date().toLocaleDateString()}

${prayers.map((p, i) => `
${p.title.toUpperCase()}
${dailyData[days[i]]?.prayers?.[i] || '[No entry]'}

---
`).join('\n')}

Keep these close to your heart.
May God guide your path.
    `.trim();

    // Create a simple text file (modern approach)
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

  // ==================== NAVIGATION & DATA ====================
  const today = schedule[currentDay];
  const dayKey = today.day;
  const current = dailyData[dayKey] || { readingComplete: false, soap: {}, prayers: {}, checkedBy: '' };
  const completedDays = Object.keys(dailyData).filter(
    day => dailyData[day]?.readingComplete && Object.values(dailyData[day]?.soap || {}).some(v => v)
  ).length;

  const nextDay = () => currentDay < 6 && setCurrentDay(currentDay + 1);
  const prevDay = () => currentDay > 0 && setCurrentDay(currentDay - 1);
  const badges = getBadges();
  const memScore = getMemorizationScore();

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" style={{ fontFamily: "'Syne', sans-serif" }}>
      <ReflectBackModal />

      {/* Full Header */}
      <div className="border-b-4 border-yellow-300 bg-black p-6">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-black mb-2" style={{ color: '#FFEA00' }}>
            HABITS CLASS: WEEK {currentWeek}
          </h1>
          {/* Streak & Badges */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs bg-yellow-300 text-black px-2 py-1 font-bold">🔥 {streakCount} week streak</span>
            {badges.map(b => (
              <span key={b.id} className="text-xs bg-gray-800 text-yellow-300 px-2 py-1 font-bold">{b.emoji} {b.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Minimal Header */}
      <div className="sticky top-0 z-50 bg-black border-b-4 border-yellow-300 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-widest truncate">Daily Devotional · John 1-7 · Knowing God</p>
            <p className="text-xs text-gray-500">{completedDays}/7 days progressing</p>
          </div>
          <div className="flex gap-2 text-xs">
            <button onClick={handleUndo} className="p-1 hover:bg-gray-900 rounded" title="Undo">↶</button>
            <button onClick={() => setShowMeter(true)} className="p-1 hover:bg-gray-900 rounded" title="Memorization">📊 {memScore}%</button>
            <p className={`font-bold ${saveStatus === 'Saved ✓' ? 'text-green-400' : 'text-gray-500'}`}>
              {saveStatus}
            </p>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="bg-gray-900 border-b-4 border-gray-800 sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <button onClick={prevDay} disabled={currentDay === 0} className="p-2 disabled:opacity-30 flex-shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2 justify-center flex-1 min-w-0">
            {days.map((day, idx) => (
              <button
                key={day}
                onClick={() => setCurrentDay(idx)}
                className={`px-2.5 py-2 font-bold uppercase text-xs border-2 transition-all flex-shrink-0 ${
                  currentDay === idx
                    ? 'border-yellow-300 bg-yellow-300 text-black'
                    : dailyData[day]?.readingComplete && Object.values(dailyData[day]?.soap || {}).some(v => v)
                    ? 'border-green-500 bg-green-950 text-green-300'
                    : 'border-gray-700 bg-gray-950 text-gray-400'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          <button onClick={nextDay} disabled={currentDay === 6} className="p-2 disabled:opacity-30 flex-shrink-0">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Daily Devotional Card */}
        <div className="bg-gray-900 border-4 border-yellow-300 p-6 sm:p-8 space-y-8 overflow-hidden">
          {/* Day Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-gray-800">
            <div>
              <h2 className="text-3xl font-black mb-2">{today.day.toUpperCase()}</h2>
              <p className="text-gray-400 uppercase tracking-widest text-sm">{today.chapter}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase mb-2">Memory Verse</p>
              <p className="text-xs font-mono text-yellow-300">{memoryReference}</p>
            </div>
          </div>

          {/* TASK A: BIBLE READING */}
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase flex items-center gap-2">
              <BookOpen className="h-5 w-5" style={{ color: '#FFEA00' }} />
              Read {today.chapter}
            </h3>
            <button
              onClick={toggleReading}
              className={`w-full p-6 border-4 font-bold uppercase transition-all text-lg ${
                current.readingComplete
                  ? 'border-yellow-300 bg-yellow-300 text-black'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-yellow-300'
              }`}
            >
              {current.readingComplete ? <span className="flex items-center justify-center gap-3"><Check className="h-6 w-6" />Reading Complete ✓</span> : 'Mark Reading Complete'}
            </button>
          </div>

          {/* TASK B: DAILY S.O.A.P. */}
          <div className="space-y-4 border-t-2 border-gray-800 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5" style={{ color: '#FFEA00' }} />
                  Daily S.O.A.P.
                </h3>
                <p className="text-gray-400 text-sm">{today.soapRange}</p>
              </div>
              <button onClick={copySoapEntry} className="p-2 hover:bg-gray-800 rounded" title="Copy SOAP">
                <Copy className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-black border-2 border-gray-700 p-4 rounded-sm mb-4">
              <p className="text-sm italic text-gray-300">"{today.soapText}"</p>
            </div>

            <div className="space-y-5">
              {['scripture', 'observation', 'application', 'prayer'].map((field, idx) => {
                const labels = {
                  scripture: 'S: Scripture — What verse stands out?',
                  observation: 'O: Observation — What do you notice?',
                  application: 'A: Application — How does this apply to YOUR life?',
                  prayer: 'P: Prayer — Pray your response to God'
                };
                return (
                  <div key={field} className="border-l-4 border-yellow-300 pl-6">
                    <label className="block text-xs font-bold uppercase text-yellow-300 mb-2">{labels[field]}</label>
                    <textarea
                      value={current.soap?.[field] || ''}
                      onChange={(e) => handleSoapChange(field, e.target.value)}
                      onInput={handleTextareaInput}
                      placeholder={`Write your ${field}...`}
                      className="w-full bg-black border-2 border-gray-700 text-white p-3 font-mono text-sm focus:border-yellow-300 focus:outline-none resize-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* TASK C: THREE DAILY PRAYERS */}
          <div className="space-y-4 border-t-2 border-gray-800 pt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase flex items-center gap-2">
                <MessageSquare className="h-5 w-5" style={{ color: '#FFEA00' }} />
                Prayer Prompts
              </h3>
              <button onClick={exportPrayersToPDF} className="p-2 hover:bg-gray-800 rounded text-xs flex gap-1 items-center">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>

            <div className="space-y-4">
              {prayers.map((prayer, idx) => (
                <div key={idx} className="bg-black border-2 border-gray-700 p-4">
                  <p className="text-xs font-bold uppercase text-yellow-300 mb-3">{prayer.title}</p>
                  <p className="text-sm text-gray-400 mb-3 italic">"{prayer.prompt}"</p>
                  <textarea
                    value={current.prayers?.[idx] || ''}
                    onChange={(e) => handlePrayerChange(idx, e.target.value)}
                    onInput={handleTextareaInput}
                    placeholder={`Write your ${prayer.title.toLowerCase()}...`}
                    className="w-full bg-gray-950 border-2 border-gray-600 text-white p-2 font-mono text-sm focus:border-yellow-300 focus:outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Memory Verse Reminder */}
          <div className="bg-black border-4 border-gray-700 p-6 space-y-3 border-t-2 border-gray-800 pt-8">
            <h3 className="text-sm font-black uppercase flex items-center gap-2 text-yellow-300">
              <Eye className="h-4 w-4" />
              Daily Memory Verse
            </h3>
            <p className="text-lg italic font-serif text-gray-300 leading-relaxed">
              "{memoryVerse}"
            </p>
            <p className="text-xs text-gray-500 font-mono">{memoryReference}</p>
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
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setShowReflect(true)}
            className="p-4 bg-gray-900 border-2 border-gray-700 font-bold text-xs uppercase hover:border-yellow-300 text-center flex flex-col gap-2 items-center"
          >
            <BarChart3 className="h-5 w-5" />
            Reflect Back
          </button>
          <button
            onClick={() => setShowBadges(true)}
            className="p-4 bg-gray-900 border-2 border-gray-700 font-bold text-xs uppercase hover:border-yellow-300 text-center flex flex-col gap-2 items-center"
          >
            <Award className="h-5 w-5" />
            Badges
          </button>
          <button
            onClick={() => setShowMeter(true)}
            className="p-4 bg-gray-900 border-2 border-gray-700 font-bold text-xs uppercase hover:border-yellow-300 text-center flex flex-col gap-2 items-center"
          >
            <Eye className="h-5 w-5" />
            Memory Meter
          </button>
          <button
            onClick={exportPrayersToPDF}
            className="p-4 bg-gray-900 border-2 border-gray-700 font-bold text-xs uppercase hover:border-yellow-300 text-center flex flex-col gap-2 items-center"
          >
            <Download className="h-5 w-5" />
            Export Prayers
          </button>
        </div>

        {/* MEMORY VERSE QUIZ */}
        <div className="mt-12 bg-gray-900 border-4 border-yellow-300 p-8 space-y-6">
          <h2 className="text-2xl font-black uppercase">Memory Verse Quiz (John 1:1-5)</h2>

          <div className="bg-black border-4 border-gray-800 p-6">
            <p className="text-lg italic font-serif text-gray-300 text-center leading-relaxed">"{memoryVerse}"</p>
            <p className="text-xs text-gray-600 text-center mt-4 font-mono">{memoryReference}</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-yellow-300 mb-2">Recite John 1:1-5 from memory:</label>
            <textarea
              value={quiz.answer}
              onChange={(e) => setQuiz(prev => ({ ...prev, answer: e.target.value }))}
              onInput={handleTextareaInput}
              disabled={quiz.submitted}
              placeholder="Type the entire verse..."
              className="w-full bg-black border-2 border-gray-700 text-white p-4 font-mono text-sm focus:border-yellow-300 focus:outline-none disabled:opacity-40 resize-none"
            />

            {!quiz.submitted ? (
              <button
                onClick={handleQuizSubmit}
                className="w-full bg-yellow-300 text-black font-black uppercase py-3 hover:bg-yellow-200 transition-all text-sm"
              >
                Check My Answer
              </button>
            ) : (
              <div className={`p-6 border-4 ${quiz.correct ? 'border-green-500 bg-green-950' : 'border-gray-600 bg-gray-950'}`}>
                <p className="font-black uppercase mb-2">
                  {quiz.correct ? '✓ PERFECT! YOU GOT IT!' : `${quiz.accuracy || 0}% Match`}
                </p>
                <div className="w-full bg-gray-800 h-2 rounded mb-3">
                  <div className="bg-yellow-300 h-2" style={{ width: `${quiz.accuracy || 0}%` }} />
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
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 border-t-4 border-yellow-300 p-6 mt-12 mb-8">
        <div className="max-w-5xl mx-auto text-center text-xs text-gray-500 uppercase tracking-widest">
          ✓ All progress saved automatically · Installable as app · Offline support enabled
        </div>
      </div>
    </div>
  );
}
