import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, AlertCircle, Download, Eye, EyeOff, RotateCcw, Mail } from 'lucide-react';

export function TeacherDashboard() {
  const [classData, setClassData] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weekResetTime, setWeekResetTime] = useState(null);
  const [badgeNotifications, setBadgeNotifications] = useState([]);
  const [parentEmailMode, setParentEmailMode] = useState(false);
  const [selectedStudentForEmail, setSelectedStudentForEmail] = useState(null);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // ==================== LOAD & AGGREGATE STUDENT DATA ====================
  useEffect(() => {
    loadStudentData();
    checkWeeklyReset();
    checkBadgeUnlocks();
  }, [currentWeek]);

  const loadStudentData = () => {
    const students = {};

    // Method 1: Load from localStorage with student IDs
    // Look for keys like: "student_alice_habitWeek1Daily", "student_bob_habitWeek1Daily"
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Parse student ID from key
      if (key?.includes(`habitsWeek${currentWeek}Daily`)) {
        // Try to extract student ID
        let studentId = key.replace(`habitsWeek${currentWeek}Daily`, '').replace(/_/g, '') || `student_${Object.keys(students).length + 1}`;
        
        if (!students[studentId]) {
          const weekData = JSON.parse(localStorage.getItem(key) || '{}');
          const streak = JSON.parse(localStorage.getItem(`${studentId}_streak`) || '0');
          const quizHistory = JSON.parse(localStorage.getItem(`${studentId}_quizHistory`) || '{}');
          const badges = JSON.parse(localStorage.getItem(`${studentId}_badges`) || '[]');

          students[studentId] = {
            name: localStorage.getItem(`${studentId}_name`) || `Student ${Object.keys(students).length + 1}`,
            weekData,
            streak,
            quizHistory,
            badges,
            studentId
          };
        }
      }
    }

    // Method 2: Generate demo data if empty (for testing)
    if (Object.keys(students).length === 0) {
      students['student_alice'] = generateMockStudent('Alice M.', 'alice@school.edu', 6, 85, ['perfect-week', 'memory-master']);
      students['student_bob'] = generateMockStudent('Bob J.', 'bob@school.edu', 2, 45, ['on-fire']);
      students['student_charlie'] = generateMockStudent('Charlie P.', 'charlie@school.edu', 7, 95, ['perfect-week', 'memory-master', 'consistency']);
      students['student_diana'] = generateMockStudent('Diana L.', 'diana@school.edu', 4, 72, []);
      students['student_evan'] = generateMockStudent('Evan T.', 'evan@school.edu', 5, 88, ['consistency']);
    }

    setClassData(students);
  };

  const generateMockStudent = (name, email, daysComplete, avgAccuracy, badges) => {
    const weekData = {};
    
    days.forEach((day, idx) => {
      const isComplete = idx < daysComplete;
      weekData[day] = {
        readingComplete: isComplete,
        soap: {
          scripture: isComplete ? `"In the beginning was the Word..." - noted by ${name}` : '',
          observation: isComplete ? `${name} observed the role of Jesus as the Word` : '',
          application: isComplete ? `${name} will share God's Word more boldly` : '',
          prayer: isComplete ? `Dear God, help me reflect Jesus to others. Amen.` : ''
        },
        prayers: isComplete ? { 0: `See prayer from ${name}`, 1: `Surrender prayer`, 2: `Send prayer` } : { 0: '', 1: '', 2: '' }
      };
    });

    return {
      name,
      email,
      weekData,
      streak: Math.floor(Math.random() * 4) + 1,
      quizHistory: { accuracy: avgAccuracy },
      badges: badges || [],
      studentId: name.toLowerCase().replace(' ', '_')
    };
  };

  // ==================== WEEKLY RESET LOGIC ====================
  const checkWeeklyReset = () => {
    const lastReset = localStorage.getItem('habitsLastWeekReset');
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
    nextSunday.setHours(0, 0, 0, 0);

    setWeekResetTime(nextSunday);

    // Check if week should reset (Sunday midnight passed)
    if (lastReset) {
      const lastResetDate = new Date(lastReset);
      const daysSinceReset = Math.floor((now - lastResetDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceReset >= 7) {
        handleWeeklyReset();
      }
    }
  };

  const handleWeeklyReset = () => {
    // Archive previous week's data
    const prevWeek = currentWeek - 1;
    Object.entries(classData).forEach(([studentId, data]) => {
      const archiveKey = `${studentId}_week${prevWeek}_archived`;
      localStorage.setItem(archiveKey, JSON.stringify(data.weekData));
    });

    // Update reset timestamp
    localStorage.setItem('habitsLastWeekReset', new Date().toISOString());
    
    // Move to next week
    setCurrentWeek(prevWeek + 1);
  };

  // ==================== BADGE UNLOCK DETECTION ====================
  const checkBadgeUnlocks = () => {
    const notifications = [];

    Object.entries(classData).forEach(([studentId, data]) => {
      const newBadges = calculateBadges(data);
      const prevBadges = JSON.parse(localStorage.getItem(`${studentId}_badges`) || '[]');

      newBadges.forEach(badge => {
        if (!prevBadges.includes(badge.id)) {
          notifications.push({
            studentId,
            studentName: data.name,
            badge: badge.id,
            label: badge.label,
            emoji: badge.emoji,
            timestamp: new Date()
          });

          // Save badge unlock
          localStorage.setItem(`${studentId}_badges`, JSON.stringify([...prevBadges, badge.id]));
        }
      });
    });

    if (notifications.length > 0) {
      setBadgeNotifications(notifications);
    }
  };

  const calculateBadges = (studentData) => {
    const badges = [];
    const completedDays = Object.keys(studentData.weekData).filter(
      day => studentData.weekData[day]?.readingComplete && Object.values(studentData.weekData[day]?.soap || {}).some(v => v)
    ).length;

    if (completedDays === 7) badges.push({ id: 'perfect-week', label: 'Perfect Week!', emoji: '⭐' });
    if (completedDays >= 5) badges.push({ id: 'on-fire', label: 'On Fire!', emoji: '🔥' });
    if (studentData.quizHistory?.accuracy >= 80) badges.push({ id: 'memory-master', label: 'Memory Master', emoji: '🧠' });
    if (studentData.streak >= 2) badges.push({ id: 'consistency', label: 'Consistent', emoji: '💪' });

    return badges;
  };

  // ==================== ANALYTICS ====================
  const calculateMetrics = () => {
    const students = Object.entries(classData);
    const totalStudents = students.length;

    const dailyCompletion = {};
    days.forEach(day => {
      const completed = students.filter(([_, data]) => data.weekData?.[day]?.readingComplete).length;
      dailyCompletion[day] = Math.round((completed / totalStudents) * 100);
    });

    const overallCompletion = students.map(([_, data]) => {
      const completed = days.filter(d => data.weekData?.[d]?.readingComplete).length;
      return (completed / days.length) * 100;
    });

    const avgCompletion = Math.round(overallCompletion.reduce((a, b) => a + b, 0) / overallCompletion.length);

    // SOAP Quality = % of students with all 4 SOAP fields filled per day
    const soapQuality = students.map(([_, data]) => {
      const daysWithCompleteSoap = days.filter(d => {
        const soap = data.weekData?.[d]?.soap;
        return soap?.scripture && soap?.observation && soap?.application && soap?.prayer;
      }).length;
      return (daysWithCompleteSoap / days.length) * 100;
    });

    const avgSoapQuality = Math.round(soapQuality.reduce((a, b) => a + b, 0) / soapQuality.length);

    // Students behind = completed < 4 days
    const behindStudents = students.filter(([_, data]) => {
      const completed = days.filter(d => data.weekData?.[d]?.readingComplete).length;
      return completed < 4;
    });

    return {
      totalStudents,
      avgCompletion,
      avgSoapQuality,
      dailyCompletion,
      behindStudents,
      overallCompletion
    };
  };

  // ==================== PARENT EMAIL / PDF GENERATION ====================
  const generateStudentReport = (studentId, studentData) => {
    const completedDays = days.filter(d => studentData.weekData?.[d]?.readingComplete).length;
    const completionPct = Math.round((completedDays / days.length) * 100);
    const badges = calculateBadges(studentData);

    const report = `
HABITS CLASS - STUDENT PROGRESS REPORT
Week ${currentWeek}

Student: ${studentData.name}
Date: ${new Date().toLocaleDateString()}

=== COMPLETION ===
Days Completed: ${completedDays}/7 (${completionPct}%)
Reading Progress: ${completionPct}%
Bible: John 1-7

=== ACHIEVEMENTS ===
${badges.length > 0 
  ? badges.map(b => `${b.emoji} ${b.label}`).join('\n')
  : 'Keep going! Badges unlock as you progress.'}

=== SPIRITUAL REFLECTIONS ===
${days.map(day => {
  const soap = studentData.weekData?.[day]?.soap;
  if (soap?.scripture) {
    return `
${day}:
Scripture: ${soap.scripture?.slice(0, 60)}...
Application: ${soap.application?.slice(0, 60)}...`;
  }
  return `${day}: [Not yet completed]`;
}).join('\n')}

=== WEEKLY SUMMARY ===
Streak: ${studentData.streak} weeks
Quiz Accuracy: ${studentData.quizHistory?.accuracy || 0}%
Status: ${completionPct === 100 ? '✓ PERFECT WEEK!' : completionPct >= 75 ? '→ On Track' : '⚠️ Needs Support'}

---
This report generated by Habits Class
Celebrating spiritual growth, one day at a time.
    `.trim();

    return report;
  };

  const downloadParentReport = (studentId, studentData) => {
    const report = generateStudentReport(studentId, studentData);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `Habits_Report_${studentData.name.replace(' ', '_')}_Week${currentWeek}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sendParentEmail = (studentId, studentData) => {
    const report = generateStudentReport(studentId, studentData);
    const mailtoLink = `mailto:?subject=Habits Class Progress Report - ${studentData.name}&body=${encodeURIComponent(
      `Dear Parent,\n\nHere's ${studentData.name}'s weekly progress:\n\n${report}\n\nBest regards,\nHabits Class Teacher`
    )}`;
    window.location.href = mailtoLink;
  };

  // ==================== RENDER ====================
  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-black text-white p-6" style={{ fontFamily: "'Syne', sans-serif" }}>
      {/* Badge Notifications */}
      {badgeNotifications.length > 0 && (
        <div className="fixed top-6 right-6 z-50 space-y-2 max-w-sm">
          {badgeNotifications.map((notif, idx) => (
            <div key={idx} className="bg-yellow-900 border-4 border-yellow-300 p-4 rounded animate-pulse">
              <p className="font-black text-yellow-300">{notif.emoji} {notif.label}</p>
              <p className="text-sm text-gray-300">{notif.studentName} just unlocked a badge!</p>
              <button
                onClick={() => setBadgeNotifications(prev => prev.filter((_, i) => i !== idx))}
                className="mt-2 text-xs underline text-yellow-400 hover:text-yellow-300"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Parent Email Modal */}
      {parentEmailMode && selectedStudentForEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-black border-4 border-yellow-300 p-8 max-w-md w-full">
            <h2 className="text-2xl font-black mb-6" style={{ color: '#FFEA00' }}>Send to Parents</h2>

            <div className="bg-gray-900 border-2 border-gray-700 p-4 mb-6 rounded">
              <p className="text-sm text-gray-400 mb-2">Student: <span className="font-bold text-white">{selectedStudentForEmail[1].name}</span></p>
              <p className="text-sm text-gray-400">Email: <span className="font-bold text-white">{selectedStudentForEmail[1].email || 'Not provided'}</span></p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => sendParentEmail(selectedStudentForEmail[0], selectedStudentForEmail[1])}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold uppercase py-3"
              >
                <Mail className="inline mr-2 h-4 w-4" />
                Open Email Client
              </button>
              <button
                onClick={() => downloadParentReport(selectedStudentForEmail[0], selectedStudentForEmail[1])}
                className="w-full bg-gray-800 border-2 border-gray-700 hover:border-yellow-300 text-white font-bold uppercase py-3"
              >
                <Download className="inline mr-2 h-4 w-4" />
                Download Report
              </button>
              <button
                onClick={() => {
                  setParentEmailMode(false);
                  setSelectedStudentForEmail(null);
                }}
                className="w-full bg-gray-950 border-2 border-gray-700 text-gray-400 font-bold uppercase py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black" style={{ color: '#FFEA00' }}>TEACHER DASHBOARD</h1>
            <p className="text-gray-400 text-sm uppercase tracking-widest mt-2">Week {currentWeek} · Real-time Analytics</p>
          </div>
          <div className="flex gap-2">
            <select
              value={currentWeek}
              onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
              className="bg-gray-900 border-2 border-gray-700 text-white px-4 py-2 font-bold uppercase"
            >
              {[1, 2, 3, 4].map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-3 bg-gray-900 border-2 border-gray-700 hover:border-yellow-300 rounded flex items-center gap-2"
            >
              {showAdvanced ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              Data
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border-4 border-yellow-300 p-4">
            <p className="text-xs text-gray-500 uppercase font-bold">Class Size</p>
            <p className="text-3xl font-black" style={{ color: '#FFEA00' }}>{metrics.totalStudents}</p>
          </div>

          <div className="bg-gray-900 border-4 border-green-500 p-4">
            <p className="text-xs text-gray-500 uppercase font-bold">Avg Completion</p>
            <p className="text-3xl font-black text-green-400">{metrics.avgCompletion}%</p>
          </div>

          <div className="bg-gray-900 border-4 border-blue-500 p-4">
            <p className="text-xs text-gray-500 uppercase font-bold">SOAP Quality</p>
            <p className="text-3xl font-black text-blue-400">{metrics.avgSoapQuality}%</p>
          </div>

          <div className={`bg-gray-900 border-4 p-4 ${metrics.behindStudents.length > 0 ? 'border-red-500' : 'border-green-500'}`}>
            <p className="text-xs text-gray-500 uppercase font-bold">At Risk</p>
            <p className={`text-3xl font-black ${metrics.behindStudents.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {metrics.behindStudents.length}
            </p>
          </div>
        </div>

        {/* Week Reset Info */}
        {weekResetTime && (
          <div className="mt-4 bg-gray-950 border-2 border-gray-700 p-3 text-xs text-gray-400">
            <p>📅 Leaderboard resets Sunday midnight ({weekResetTime.toLocaleDateString()}) for fresh week competition</p>
          </div>
        )}
      </div>

      {/* Daily Completion Chart */}
      <div className="max-w-7xl mx-auto mb-8 bg-gray-900 border-4 border-gray-800 p-6">
        <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" style={{ color: '#FFEA00' }} />
          Daily Completion Rate
        </h2>

        <div className="space-y-3">
          {days.map(day => (
            <div key={day}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-bold">{day}</span>
                <span className="text-sm font-bold" style={{ color: '#FFEA00' }}>{metrics.dailyCompletion[day]}%</span>
              </div>
              <div className="w-full bg-gray-800 h-3 rounded overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${metrics.dailyCompletion[day]}%`,
                    backgroundColor: metrics.dailyCompletion[day] >= 80 ? '#22c55e' : metrics.dailyCompletion[day] >= 50 ? '#eab308' : '#ef4444'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* At-Risk Students */}
      {metrics.behindStudents.length > 0 && (
        <div className="max-w-7xl mx-auto mb-8 bg-red-950 border-4 border-red-500 p-6">
          <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-red-400">
            <AlertCircle className="h-6 w-6" />
            Students Behind (< 4 Days)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.behindStudents.map(([studentId, data]) => {
              const completed = days.filter(d => data.weekData?.[d]?.readingComplete).length;
              return (
                <div key={studentId} className="bg-black border-2 border-red-500 p-4">
                  <p className="font-bold text-red-400">{data.name}</p>
                  <p className="text-xs text-gray-400 mb-3">{completed}/7 days complete</p>
                  <button
                    onClick={() => setSelectedStudent([studentId, data])}
                    className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1 font-bold"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Student Leaderboard with Parent Option */}
      {showAdvanced && (
        <div className="max-w-7xl mx-auto mb-8 bg-gray-900 border-4 border-gray-800 p-6">
          <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <Users className="h-6 w-6" style={{ color: '#FFEA00' }} />
            Student Performance + Parent Reports
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="text-left py-2 px-2 font-bold text-yellow-300">Student</th>
                  <th className="text-center py-2 px-2 font-bold">Days</th>
                  <th className="text-center py-2 px-2 font-bold">Completion</th>
                  <th className="text-center py-2 px-2 font-bold">SOAP %</th>
                  <th className="text-center py-2 px-2 font-bold">Badges</th>
                  <th className="text-center py-2 px-2 font-bold">Parent Report</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(classData).map(([studentId, data]) => {
                  const completed = days.filter(d => data.weekData?.[d]?.readingComplete).length;
                  const completionPct = Math.round((completed / days.length) * 100);

                  const soapComplete = days.filter(d => {
                    const soap = data.weekData?.[d]?.soap;
                    return soap?.scripture && soap?.observation && soap?.application && soap?.prayer;
                  }).length;
                  const soapQuality = Math.round((soapComplete / days.length) * 100);
                  const badges = calculateBadges(data);

                  return (
                    <tr key={studentId} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-3 px-2 font-bold">{data.name}</td>
                      <td className="py-3 px-2 text-center">{completed}/7</td>
                      <td className="py-3 px-2 text-center">{completionPct}%</td>
                      <td className="py-3 px-2 text-center">{soapQuality}%</td>
                      <td className="py-3 px-2 text-center">{badges.map(b => b.emoji).join('')}</td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudentForEmail([studentId, data]);
                            setParentEmailMode(true);
                          }}
                          className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 font-bold text-white"
                        >
                          📧 Send
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-black border-4 border-yellow-300 p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black" style={{ color: '#FFEA00' }}>{selectedStudent[1].name}</h2>
              <button onClick={() => setSelectedStudent(null)} className="text-2xl font-bold">✕</button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {days.map(day => {
                const dayData = selectedStudent[1].weekData?.[day];
                const isComplete = dayData?.readingComplete;

                return (
                  <div key={day} className={`border-2 p-4 ${isComplete ? 'border-green-500 bg-green-950' : 'border-gray-700 bg-gray-950'}`}>
                    <p className="font-bold mb-2">{day} {isComplete ? '✓' : '○'}</p>
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
              <button
                onClick={() => {
                  setSelectedStudentForEmail(selectedStudent);
                  setParentEmailMode(true);
                  setSelectedStudent(null);
                }}
                className="w-full bg-blue-600 text-white font-bold uppercase py-2"
              >
                📧 Send Parent Report
              </button>
              <button
                onClick={() => downloadParentReport(selectedStudent[0], selectedStudent[1])}
                className="w-full bg-gray-800 border-2 border-gray-700 hover:border-yellow-300 text-white font-bold uppercase py-2"
              >
                <Download className="inline mr-2 h-4 w-4" />
                Download Report
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full bg-gray-950 border-2 border-gray-700 text-gray-400 font-bold uppercase py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export & Actions */}
      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => loadStudentData()}
          className="flex-1 bg-yellow-300 text-black font-black uppercase py-3 hover:bg-yellow-200 flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-5 w-5" />
          Refresh Data
        </button>
        <button
          onClick={handleWeeklyReset}
          className="flex-1 bg-gray-900 border-2 border-gray-700 hover:border-yellow-300 font-black uppercase py-3"
        >
          <RotateCcw className="inline mr-2 h-5 w-5" />
          Manual Reset
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-gray-900 border-2 border-gray-700 hover:border-yellow-300 font-black uppercase py-3"
        >
          Hard Refresh
        </button>
      </div>

      {/* Info Footer */}
      <div className="max-w-7xl mx-auto mt-8 bg-gray-950 border-2 border-gray-700 p-4 text-center text-xs text-gray-500">
        <p>✓ Automatic weekly reset at Sunday midnight · Badge notifications in top-right · Parent reports include completion % + achievements</p>
      </div>
    </div>
  );
}

export default TeacherDashboard;
