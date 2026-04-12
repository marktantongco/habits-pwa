import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Zap, Award } from 'lucide-react';

export function StreakLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('streak'); // 'streak', 'completion', 'badges'
  const [week, setWeek] = useState(1);

  useEffect(() => {
    // Generate leaderboard from student data
    const generateLeaderboard = () => {
      // In production, fetch from backend
      const mockStudents = [
        { id: 1, streak: 4, completion: 100, badges: ['perfect-week', 'memory-master'], lastUpdated: new Date() },
        { id: 2, streak: 2, completion: 85, badges: ['on-fire'], lastUpdated: new Date() },
        { id: 3, streak: 3, completion: 95, badges: ['perfect-week'], lastUpdated: new Date() },
        { id: 4, streak: 1, completion: 57, badges: [], lastUpdated: new Date() },
        { id: 5, streak: 2, completion: 71, badges: ['consistency'], lastUpdated: new Date() },
        { id: 6, streak: 5, completion: 100, badges: ['perfect-week', 'consistency', 'memory-master'], lastUpdated: new Date() },
      ];

      // Sort by selected filter
      let sorted = [...mockStudents];
      if (filter === 'streak') {
        sorted.sort((a, b) => b.streak - a.streak);
      } else if (filter === 'completion') {
        sorted.sort((a, b) => b.completion - a.completion);
      } else if (filter === 'badges') {
        sorted.sort((a, b) => b.badges.length - a.badges.length);
      }

      setLeaderboard(sorted.map((student, idx) => ({ ...student, rank: idx + 1 })));
    };

    generateLeaderboard();
  }, [filter, week]);

  const badgeConfig = {
    'perfect-week': { emoji: '⭐', label: 'Perfect Week', color: 'bg-yellow-950' },
    'on-fire': { emoji: '🔥', label: 'On Fire!', color: 'bg-orange-950' },
    'memory-master': { emoji: '🧠', label: 'Memory Master', color: 'bg-blue-950' },
    'consistency': { emoji: '💪', label: 'Consistent', color: 'bg-green-950' },
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-600';
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6" style={{ fontFamily: "'Syne', sans-serif" }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3" style={{ color: '#FFEA00' }}>
              <Trophy className="h-10 w-10" />
              LEADERBOARD
            </h1>
            <p className="text-gray-400 text-sm uppercase tracking-widest mt-2">Anonymous Rankings · Week {week}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { id: 'streak', label: '🔥 Streaks', icon: Flame },
            { id: 'completion', label: '✓ Completion', icon: Star },
            { id: 'badges', label: '🏆 Badges', icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-3 font-bold uppercase text-xs border-2 transition-all ${
                filter === tab.id
                  ? 'border-yellow-300 bg-yellow-300 text-black'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-yellow-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="bg-gray-900 border-4 border-gray-500 p-6 mb-3 rounded-t-lg">
                <p className="text-2xl mb-2">🥈</p>
                <p className="font-black text-xl text-gray-400">Student {leaderboard[1].id}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {filter === 'streak' ? `${leaderboard[1].streak}w streak` : `${leaderboard[1].completion}% done`}
                </p>
              </div>
              <div className="h-20 bg-gradient-to-b from-gray-700 to-gray-900 border-2 border-gray-500" />
            </div>

            {/* 1st Place */}
            <div className="text-center mb-8">
              <div className="bg-yellow-900 border-4 border-yellow-300 p-6 mb-3 rounded-lg shadow-lg">
                <p className="text-4xl mb-2">🥇</p>
                <p className="font-black text-2xl text-yellow-300">Student {leaderboard[0].id}</p>
                <p className="text-sm text-yellow-400 mt-2 font-bold">
                  {filter === 'streak' ? `${leaderboard[0].streak}w streak` : `${leaderboard[0].completion}% done`}
                </p>
                <div className="flex gap-1 justify-center mt-3 flex-wrap">
                  {leaderboard[0].badges.slice(0, 3).map(badge => (
                    <span key={badge} className="text-xs">{badgeConfig[badge]?.emoji}</span>
                  ))}
                </div>
              </div>
              <div className="h-32 bg-gradient-to-b from-yellow-700 to-yellow-900 border-4 border-yellow-300" />
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="bg-gray-900 border-4 border-orange-600 p-6 mb-3 rounded-t-lg">
                <p className="text-2xl mb-2">🥉</p>
                <p className="font-black text-xl text-orange-400">Student {leaderboard[2].id}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {filter === 'streak' ? `${leaderboard[2].streak}w streak` : `${leaderboard[2].completion}% done`}
                </p>
              </div>
              <div className="h-16 bg-gradient-to-b from-gray-700 to-gray-900 border-2 border-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="max-w-5xl mx-auto bg-gray-900 border-4 border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-black border-b-2 border-gray-800 px-6 py-4 grid grid-cols-6 gap-4 font-bold uppercase text-xs">
          <div className="col-span-2">Rank</div>
          <div className="text-center">
            {filter === 'streak' && '🔥 Streak'}
            {filter === 'completion' && '✓ Completion'}
            {filter === 'badges' && '🏆 Badges'}
          </div>
          <div className="text-center">Status</div>
          <div className="col-span-2 text-right">Badges</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-800">
          {leaderboard.map((student, idx) => {
            const isTopThree = student.rank <= 3;
            const bgColor = isTopThree
              ? student.rank === 1
                ? 'bg-yellow-950'
                : 'bg-gray-950'
              : idx % 2 === 0
              ? 'bg-black'
              : 'bg-gray-950';

            const progressPct = student.completion;
            const statusEmoji = student.completion === 100 ? '✓' : student.completion >= 75 ? '→' : '⚠️';
            const statusColor = student.completion === 100 ? 'text-green-400' : student.completion >= 75 ? 'text-yellow-400' : 'text-red-400';

            return (
              <div key={student.id} className={`${bgColor} px-6 py-4 grid grid-cols-6 gap-4 items-center hover:bg-gray-800 transition`}>
                {/* Rank */}
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-black ${getMedalColor(student.rank)}`}>
                      {getMedalEmoji(student.rank)}
                    </span>
                    <div>
                      <p className="font-bold">Student {student.id}</p>
                      <p className="text-xs text-gray-500">Rank #{student.rank}</p>
                    </div>
                  </div>
                </div>

                {/* Metric */}
                <div className="text-center">
                  <p className="text-xl font-black" style={{ color: '#FFEA00' }}>
                    {filter === 'streak' && `${student.streak}w`}
                    {filter === 'completion' && `${student.completion}%`}
                    {filter === 'badges' && student.badges.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    {filter === 'streak' && 'weeks'}
                    {filter === 'completion' && 'done'}
                    {filter === 'badges' && 'badges'}
                  </p>
                </div>

                {/* Status */}
                <div className="text-center">
                  <p className={`text-2xl font-bold ${statusColor}`}>{statusEmoji}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {student.completion === 100 ? 'Complete' : student.completion >= 75 ? 'On Track' : 'Needs Help'}
                  </p>
                </div>

                {/* Badges */}
                <div className="col-span-2 flex justify-end gap-2 flex-wrap">
                  {student.badges.length > 0 ? (
                    student.badges.map(badge => (
                      <div
                        key={badge}
                        className={`${badgeConfig[badge].color} border-2 border-yellow-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1`}
                      >
                        <span>{badgeConfig[badge].emoji}</span>
                        <span className="hidden sm:inline">{badgeConfig[badge].label}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic">Keep going!</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="max-w-5xl mx-auto mt-8 bg-gray-900 border-2 border-gray-700 p-6 text-center">
        <p className="text-sm text-gray-400 mb-3">
          🌟 <span className="font-bold">Anonymous Leaderboard</span> 🌟
        </p>
        <p className="text-xs text-gray-500">
          Rankings are shown anonymously (Student #1, #2, etc.) to encourage healthy competition without comparison anxiety.
          Focus on your personal growth!
        </p>
      </div>

      {/* Legend */}
      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(badgeConfig).map(([key, badge]) => (
          <div key={key} className="bg-gray-900 border-2 border-gray-700 p-4 text-center">
            <p className="text-2xl mb-2">{badge.emoji}</p>
            <p className="text-xs font-bold uppercase">{badge.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StreakLeaderboard;
