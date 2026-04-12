import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, AlertCircle, Download, Eye, EyeOff } from 'lucide-react';

export function TeacherDashboard() {
  const [classData, setClassData] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load all student data from localStorage
  useEffect(() => {
    const students = {};
    
    // Simulate loading student data (in production, fetch from backend)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('habitsWeek') && key?.includes('Daily')) {
        const studentId = key.split('_')[0] || `Student_${Object.keys(students).length + 1}`;
        if (!students[studentId]) {
          students[studentId] = {
            weekData: JSON.parse(localStorage.getItem(key)),
            streak: JSON.parse(localStorage.getItem(`${studentId}_streak`)) || 0,
            quizHistory: JSON.parse(localStorage.getItem(`${studentId}_quizHistory`)) || {}
          };
        }
      }
    }

    // For demo: create sample student data if no data exists
    if (Object.keys(students).length === 0) {
      students['Student_1'] = generateMockStudent('Alice', 6, 75);
      students['Student_2'] = generateMockStudent('Bob', 3, 55);
      students['Student_3'] = generateMockStudent('Charlie', 7, 92);
      students['Student_4'] = generateMockStudent('Diana', 4, 68);
      students['Student_5'] = generateMockStudent('Evan', 5, 78);
    }

    setClassData(students);
  }, []);

  // Generate mock student data for demo
  const generateMockStudent = (name, daysComplete, avgAccuracy) => {
    const weekData = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach((day, idx) => {
      const isComplete = idx < daysComplete;
      weekData[day] = {
        readingComplete: isComplete,
        soap: {
          scripture: isComplete ? `Verse noted by ${name}` : '',
          observation: isComplete ? `Observation from ${name}` : '',
          application: isComplete ? `How ${name} applies this` : '',
          prayer: isComplete ? `Prayer by ${name}` : ''
        },
        prayers: isComplete ? { 0: `Prayer 1`, 1: `Prayer 2`, 2: `Prayer 3` } : { 0: '', 1: '', 2: '' }
      };
    });

    return {
      name,
      weekData,
      streak: Math.floor(Math.random() * 3) + 1,
      quizHistory: { accuracy: avgAccuracy }
    };
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

    // SOAP Quality = % of students with all 4 SOAP fields filled
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

  const metrics = calculateMetrics();

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-black text-white p-6" style={{ fontFamily: "'Syne', sans-serif" }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black" style={{ color: '#FFEA00' }}>TEACHER DASHBOARD</h1>
            <p className="text-gray-400 text-sm uppercase tracking-widest mt-2">Real-time Class Analytics · Week 1</p>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-3 bg-gray-900 border-2 border-gray-700 hover:border-yellow-300 rounded flex items-center gap-2"
          >
            {showAdvanced ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            {showAdvanced ? 'Hide' : 'Show'} Student Data
          </button>
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

      {/* At-Risk Students Alert */}
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
                  <p className="font-bold text-red-400">{data.name || studentId}</p>
                  <p className="text-xs text-gray-400">{completed}/7 days complete</p>
                  <button
                    onClick={() => setSelectedStudent([studentId, data])}
                    className="mt-2 text-xs bg-red-600 hover:bg-red-500 px-3 py-1 font-bold"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Student Leaderboard */}
      {showAdvanced && (
        <div className="max-w-7xl mx-auto mb-8 bg-gray-900 border-4 border-gray-800 p-6">
          <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <Users className="h-6 w-6" style={{ color: '#FFEA00' }} />
            Student Performance Breakdown
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="text-left py-2 px-2 font-bold text-yellow-300">Student</th>
                  <th className="text-center py-2 px-2 font-bold">Days Done</th>
                  <th className="text-center py-2 px-2 font-bold">Completion %</th>
                  <th className="text-center py-2 px-2 font-bold">SOAP Quality</th>
                  <th className="text-center py-2 px-2 font-bold">Quiz Avg</th>
                  <th className="text-center py-2 px-2 font-bold">Status</th>
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

                  const quizAvg = data.quizHistory?.accuracy || 0;

                  const status = completed < 4 ? '⚠️ Behind' : completed === 7 ? '✓ Complete' : '→ In Progress';
                  const statusColor = completed < 4 ? 'text-red-400' : completed === 7 ? 'text-green-400' : 'text-yellow-400';

                  return (
                    <tr key={studentId} className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedStudent([studentId, data])}>
                      <td className="py-3 px-2 font-bold">{data.name || studentId}</td>
                      <td className="py-3 px-2 text-center">{completed}/7</td>
                      <td className="py-3 px-2 text-center">{completionPct}%</td>
                      <td className="py-3 px-2 text-center">{soapQuality}%</td>
                      <td className="py-3 px-2 text-center">{quizAvg}%</td>
                      <td className={`py-3 px-2 text-center font-bold ${statusColor}`}>{status}</td>
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
              <h2 className="text-2xl font-black" style={{ color: '#FFEA00' }}>{selectedStudent[1].name || selectedStudent[0]}</h2>
              <button onClick={() => setSelectedStudent(null)} className="text-2xl font-bold">✕</button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {days.map(day => {
                const dayData = selectedStudent[1].weekData?.[day];
                const isComplete = dayData?.readingComplete;
                const soapComplete = dayData?.soap?.scripture && dayData?.soap?.observation && dayData?.soap?.application && dayData?.soap?.prayer;

                return (
                  <div key={day} className={`border-2 p-4 ${isComplete ? 'border-green-500 bg-green-950' : 'border-gray-700 bg-gray-950'}`}>
                    <p className="font-bold mb-2">{day}</p>
                    <div className="space-y-1 text-xs text-gray-300">
                      <p><span className="text-yellow-300">Reading:</span> {isComplete ? '✓ Complete' : '✗ Not Done'}</p>
                      <p><span className="text-yellow-300">SOAP:</span> {soapComplete ? '✓ Complete' : '✗ Incomplete'}</p>
                      <p><span className="text-yellow-300">Scripture:</span> {dayData?.soap?.scripture?.slice(0, 30) || 'None'}...</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setSelectedStudent(null)} className="mt-6 w-full bg-yellow-300 text-black font-bold uppercase py-2">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Export Report */}
      <div className="max-w-7xl mx-auto mt-8 flex gap-4">
        <button
          onClick={() => {
            const report = generateReport(metrics, classData);
            downloadReport(report);
          }}
          className="flex-1 bg-yellow-300 text-black font-black uppercase py-3 hover:bg-yellow-200 flex items-center justify-center gap-2"
        >
          <Download className="h-5 w-5" />
          Export Report
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-gray-900 border-2 border-gray-700 hover:border-yellow-300 font-black uppercase py-3"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}

// ==================== UTILITIES ====================
const generateReport = (metrics, classData) => {
  const timestamp = new Date().toLocaleString();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  let report = `
HABITS CLASS - TEACHER REPORT
Week 1 Analytics
Generated: ${timestamp}

=== SUMMARY ===
Total Students: ${metrics.totalStudents}
Average Completion: ${metrics.avgCompletion}%
Average SOAP Quality: ${metrics.avgSoapQuality}%
Students At Risk: ${metrics.behindStudents.length}

=== DAILY COMPLETION ===
${days.map(d => `${d}: ${metrics.dailyCompletion[d]}%`).join('\n')}

=== STUDENTS AT RISK ===
${metrics.behindStudents.length > 0 
  ? metrics.behindStudents.map(([id, data]) => {
      const completed = days.filter(d => data.weekData?.[d]?.readingComplete).length;
      return `${data.name || id}: ${completed}/7 days`;
    }).join('\n')
  : 'None'
}

=== DETAILED BREAKDOWN ===
${Object.entries(classData).map(([id, data]) => {
  const completed = days.filter(d => data.weekData?.[d]?.readingComplete).length;
  const completionPct = Math.round((completed / days.length) * 100);
  return `${data.name || id}: ${completed}/7 (${completionPct}%)`;
}).join('\n')}

---
Report generated by Habits Class Teacher Dashboard
  `.trim();

  return report;
};

const downloadReport = (report) => {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
  element.setAttribute('download', `Habits_Week1_Report_${new Date().toISOString().split('T')[0]}.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
