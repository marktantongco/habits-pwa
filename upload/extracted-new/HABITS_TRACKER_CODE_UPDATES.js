// HABITS TRACKER - CODE UPDATES FOR STUDENT ID + NEW FEATURES

/*
WHAT TO CHANGE:
1. Add student ID support
2. Update localStorage keys to include student ID
3. Add badge unlock notifications
4. Update week selector
5. Connect to fixed teacher dashboard
*/

// ==================== STEP 1: ADD STUDENT ID STATE ====================

// ADD AT TOP OF COMPONENT (after other useState declarations):

const [studentId, setStudentId] = useState(null);
const [studentName, setStudentName] = useState('');
const [badgeUnlocked, setBadgeUnlocked] = useState(null);

// ==================== STEP 2: INITIALIZE STUDENT ID ====================

// ADD THIS IN FIRST useEffect (where service worker is registered):

useEffect(() => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => console.log('SW registration failed:', err));
  }

  // CREATE OR LOAD STUDENT ID
  let id = localStorage.getItem('habitsStudentId');
  if (!id) {
    id = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('habitsStudentId', id);
    
    // Prompt for student name once
    const name = prompt('What\'s your name?', 'Student');
    if (name) {
      localStorage.setItem(`${id}_name`, name);
      setStudentName(name);
    }
  } else {
    const savedName = localStorage.getItem(`${id}_name`);
    setStudentName(savedName || 'Student');
  }
  
  setStudentId(id);

  // LOAD DATA (keep existing code, but update keys)
  const storageKey = `${id}_habitsWeek${currentWeek}Daily`;
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    setDailyData(JSON.parse(saved));
  } else {
    initializeWeek();
  }
}, []);

// ==================== STEP 3: UPDATE AUTO-SAVE WITH STUDENT ID ====================

// REPLACE EXISTING useEffect for auto-save with this:

useEffect(() => {
  if (Object.keys(dailyData).length > 0 && studentId) {
    setSaveStatus('Saving...');
    const timer = setTimeout(() => {
      // USE STUDENT ID IN STORAGE KEY
      const storageKey = `${studentId}_habitsWeek${currentWeek}Daily`;
      localStorage.setItem(storageKey, JSON.stringify(dailyData));
      
      // Also save to old key for backwards compatibility (optional)
      localStorage.setItem('habitsWeek1Daily', JSON.stringify(dailyData));
      
      // Track history for undo
      setHistory(prev => [...prev.slice(-9), { timestamp: new Date().toISOString(), data: dailyData }]);
      
      setSaveStatus('Saved ✓');
      const clearTimer = setTimeout(() => setSaveStatus(''), 2000);
      return () => clearTimeout(clearTimer);
    }, 300);
    return () => clearTimeout(timer);
  }
}, [dailyData, quiz, studentId, currentWeek]);

// ==================== STEP 4: UPDATE STREAK COUNTER ====================

// REPLACE where streak is saved/loaded:

// OLD: localStorage.setItem('habitsStreak', JSON.stringify(streakCount));
// NEW: localStorage.setItem(`${studentId}_streak`, JSON.stringify(streakCount));

// In toggleReading function, after marking complete:
const toggleReading = () => {
  setDailyData(prev => ({
    ...prev,
    [today.day]: { ...prev[today.day], readingComplete: !prev[today.day]?.readingComplete }
  }));
  
  // Update streak if all 7 days done
  const allDone = days.filter(d => dailyData[d]?.readingComplete).length === 7;
  if (allDone) {
    const newStreak = (streakCount || 0) + 1;
    setStreakCount(newStreak);
    if (studentId) {
      localStorage.setItem(`${studentId}_streak`, JSON.stringify(newStreak));
    }
  }
};

// ==================== STEP 5: UPDATE QUIZ HISTORY ====================

// REPLACE where quiz attempts are saved:

// OLD: localStorage.setItem('habitsQuizHistory', JSON.stringify(quizHistory));
// NEW: localStorage.setItem(`${studentId}_quizHistory`, JSON.stringify(quizHistory));

// In handleQuizSubmit:
const handleQuizSubmit = () => {
  const answer = quiz.answer.toLowerCase();
  const correctWords = ['beginning', 'word', 'god'];
  const matchedWords = correctWords.filter(w => answer.includes(w)).length;
  const accuracy = Math.round((matchedWords / correctWords.length) * 100);
  const isCorrect = matchedWords >= 2;

  setQuiz(prev => ({ ...prev, submitted: true, correct: isCorrect, accuracy }));

  // Track quiz attempt WITH STUDENT ID
  if (studentId) {
    const updated = {
      ...quizHistory,
      [today.day]: { accuracy, timestamp: new Date().toISOString() }
    };
    setQuizHistory(updated);
    localStorage.setItem(`${studentId}_quizHistory`, JSON.stringify(updated));
  }

  // CHECK FOR BADGE UNLOCK (Memory Master)
  if (accuracy >= 80) {
    checkAndUnlockBadge('memory-master', 'Memory Master', '🧠');
  }
};

// ==================== STEP 6: ADD BADGE UNLOCK DETECTION ====================

// ADD THIS NEW FUNCTION:

const checkAndUnlockBadge = (badgeId, badgeLabel, badgeEmoji) => {
  if (studentId) {
    const savedBadges = JSON.parse(localStorage.getItem(`${studentId}_badges`) || '[]');
    
    if (!savedBadges.includes(badgeId)) {
      // NEW BADGE UNLOCKED!
      savedBadges.push(badgeId);
      localStorage.setItem(`${studentId}_badges`, JSON.stringify(savedBadges));
      
      // Show celebration
      setBadgeUnlocked({
        id: badgeId,
        label: badgeLabel,
        emoji: badgeEmoji
      });
      
      // Clear after 5 seconds
      setTimeout(() => setBadgeUnlocked(null), 5000);
    }
  }
};

// Also check on page load for badges that were earned:
useEffect(() => {
  if (!studentId) return;
  
  const badges = calculateBadges();
  const savedBadges = JSON.parse(localStorage.getItem(`${studentId}_badges`) || '[]');
  
  badges.forEach(badge => {
    if (!savedBadges.includes(badge.id)) {
      checkAndUnlockBadge(badge.id, badge.label, badge.emoji);
    }
  });
}, [dailyData, studentId]);

// ==================== STEP 7: ADD BADGE UNLOCK NOTIFICATION UI ====================

// ADD THIS NEAR TOP OF RETURN JSX (after other sticky headers):

{badgeUnlocked && (
  <div className="fixed top-20 right-6 z-50 bg-yellow-900 border-4 border-yellow-300 p-6 rounded animate-pulse">
    <div className="text-center">
      <p className="text-5xl mb-2">{badgeUnlocked.emoji}</p>
      <p className="font-black text-yellow-300 uppercase">{badgeUnlocked.label}</p>
      <p className="text-xs text-gray-300 mt-2">You unlocked a badge!</p>
    </div>
  </div>
)}

// ==================== STEP 8: UPDATE WEEK SELECTOR ====================

// ADD to sticky header or create new selector:

<div className="flex items-center gap-2">
  <label className="text-xs font-bold uppercase text-gray-400">Week:</label>
  <select
    value={currentWeek}
    onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
    className="bg-gray-900 border-2 border-gray-700 text-white px-3 py-1 font-bold"
  >
    {[1, 2, 3, 4].map(w => <option key={w} value={w}>Week {w}</option>)}
  </select>
</div>

// ==================== STEP 9: UPDATE INITIALIZE WEEK ====================

// UPDATE the initializeWeek function to use student ID:

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
  
  // Save with student ID
  if (studentId) {
    const storageKey = `${studentId}_habitsWeek${currentWeek}Daily`;
    localStorage.setItem(storageKey, JSON.stringify(init));
  }
};

// ==================== STEP 10: UPDATE HEADER TO SHOW STUDENT NAME ====================

// REPLACE the full header section:

<div className="border-b-4 border-yellow-300 bg-black p-6">
  <div className="max-w-5xl mx-auto px-4">
    <div className="flex items-center justify-between mb-2">
      <h1 className="text-4xl font-black mb-2" style={{ color: '#FFEA00' }}>
        HABITS CLASS: WEEK {currentWeek}
      </h1>
      <p className="text-sm text-yellow-400 font-bold">{studentName}</p>
    </div>
    {/* Rest of header stays same */}
  </div>
</div>

// ==================== STEP 11: ADD NAME INPUT FOR FIRST TIME ====================

// OPTIONAL: Add modal for students to update their name:

{!studentName && studentId && (
  <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
    <div className="bg-black border-4 border-yellow-300 p-8 max-w-sm w-full">
      <h2 className="text-2xl font-black mb-4" style={{ color: '#FFEA00' }}>Welcome!</h2>
      <p className="text-gray-400 mb-4">What's your name?</p>
      <input
        type="text"
        defaultValue={studentName}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && e.target.value) {
            setStudentName(e.target.value);
            localStorage.setItem(`${studentId}_name`, e.target.value);
          }
        }}
        placeholder="Enter your name"
        className="w-full bg-gray-900 border-2 border-gray-700 text-white px-4 py-2 mb-4"
        autoFocus
      />
      <button
        onClick={(e) => {
          const name = e.target.previousElementSibling.value;
          if (name) {
            setStudentName(name);
            localStorage.setItem(`${studentId}_name`, name);
          }
        }}
        className="w-full bg-yellow-300 text-black font-bold uppercase py-2"
      >
        Continue
      </button>
    </div>
  </div>
)}

// ==================== SUMMARY OF CHANGES ====================

/*
QUICK CHECKLIST:
1. ✓ Add studentId, studentName, badgeUnlocked state
2. ✓ Initialize student ID on first load
3. ✓ Update all localStorage keys to include `${studentId}_`
4. ✓ Update auto-save to use student ID
5. ✓ Add badge unlock detection
6. ✓ Add badge notification UI
7. ✓ Add week selector
8. ✓ Update header to show student name
9. ✓ Add name input modal
10. ✓ Test: Create new student → see name + ID
11. ✓ Test: Complete day → see "Saved" + data persists
12. ✓ Test: Quiz 80%+ → see badge unlock notification
13. ✓ Test: Check localStorage for `student_X_habitsWeek1Daily`
14. ✓ Deploy and test with teacher dashboard

AFTER THESE CHANGES:
- Student tracker will save data per student
- Teacher dashboard can read and aggregate all students
- Badge unlocks show celebration
- Weekly reset will work properly
- Parent reports will have correct data
*/
