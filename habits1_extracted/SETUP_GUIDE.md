# HABITS CLASS TRACKER - COMPLETE SETUP GUIDE

## 📦 What You're Building

A **Progressive Web App (PWA)** that works offline with:
- ✅ Daily devotional tracking (Bible reading, S.O.A.P., 3 prayers)
- ✅ History/Undo system (undo up to 10 changes)
- ✅ Clipboard integration (copy daily entries)
- ✅ Streak counter (consecutive weeks tracked)
- ✅ Badge rewards (Perfect Week, Memory Master, etc.)
- ✅ Memorization meter (tracks quiz accuracy progress)
- ✅ Reflect Back modal (week-end visual summary of all 7 days)
- ✅ PDF export (download 3 prayers as text file)
- ✅ PWA installable (works offline, adds to home screen)
- ✅ Auto-expandable textareas (grow as you type)
- ✅ Auto-save with visual feedback

---

## 🚀 QUICK SETUP (3 STEPS)

### Step 1: Create New React Project
```bash
npm create vite@latest habits-class -- --template react
cd habits-class
npm install lucide-react
```

### Step 2: Replace Files
Copy these files into your project:

**`src/App.jsx`** → Copy content from `HabitsTrackerFull.jsx`

**`public/manifest.json`** → Copy the provided `manifest.json`

**`public/service-worker.js`** → Copy the provided `service-worker.js`

**`src/main.jsx`** → Add manifest link:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Register manifest for PWA
const link = document.createElement('link');
link.rel = 'manifest';
link.href = '/manifest.json';
document.head.appendChild(link);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 3: Deploy
```bash
npm run build
# Deploy /dist to Vercel, Netlify, or any static host
```

---

## 🎮 FEATURE BREAKDOWN

### 1. **Auto-Save + Undo**
- Every change saves to localStorage automatically
- History stack tracks last 10 changes
- Click `↶` button to undo

### 2. **Clipboard Integration**
- **Copy SOAP Entry** → Copies all 4 S.O.A.P. fields as text
- **Auto-feedback** → "Copied SOAP Entry!" appears for 2 seconds

### 3. **Streak Counter**
- Tracks consecutive weeks completed
- Stored separately (supports multiple weeks)
- Displayed in header: `🔥 N week streak`

### 4. **Badge System** (Auto-unlocked)
- **⭐ Perfect Week** → Complete all 7 days (reading + SOAP entries)
- **🔥 On Fire!** → Complete 5+ days
- **🧠 Memory Master** → Quiz accuracy ≥ 80%
- **💪 Consistent** → 2+ week streak

### 5. **Memorization Meter**
- Tracks quiz attempt accuracy (0-100%)
- Shows average across all attempts
- Visual progress bar on quiz result
- Updates dynamically as you retry

### 6. **Reflect Back Modal**
- Shows all 7 days' S.O.A.P. entries side-by-side
- Displays first 40 chars of each section
- Opens on click of "Reflect Back" button
- Scrollable grid for mobile

### 7. **PDF Export**
- Downloads all three daily prayers as `.txt` file
- Formatted with prayer titles and dates
- Includes week number
- File naming: `Habits_Week1_Prayers.txt`

### 8. **PWA Features**
- **Offline Support** → Service worker caches app assets
- **Installable** → "Add to Home Screen" appears on mobile/desktop
- **App Icon** → Yellow/black minimalist icon
- **Standalone Mode** → Opens as app (no URL bar)

---

## 📱 MOBILE DEPLOYMENT

### iOS (Home Screen)
1. Open in Safari
2. Tap Share → Add to Home Screen
3. App appears on home screen
4. Works offline after first visit

### Android (Chrome)
1. Open in Chrome
2. Menu → Install app
3. App appears in launcher
4. Works offline after first visit

### Desktop (Vercel)
Visit `yourdomain.com` → Install button appears in Chrome/Edge browser

---

## 🛠️ CUSTOMIZATION

### Change Memory Verse
Find in `HabitsTrackerFull.jsx`:
```jsx
const memoryVerse = 'Your verse here...';
const memoryReference = 'John X:X-X';
```

### Change Schedule/S.O.A.P. Portions
Update the `schedule` array:
```jsx
const schedule = [
  { day: 'Monday', chapter: 'John 1', soapRange: 'John 3:1-3', soapText: '...' },
  // ... more days
];
```

### Change Prayers
Update the `prayers` array:
```jsx
const prayers = [
  { title: 'Custom Prayer', prompt: 'Your prompt here?' },
  // ... more prayers
];
```

### Customize Colors
- Primary: `#FFEA00` (yellow)
- Accent: `#ccff00` (neon green, optional)
- Dark: `#000000` (black)
- Update Tailwind classes to match your brand

---

## 💾 LOCAL STORAGE KEYS

All data persists in browser localStorage:
- `habitsWeek1Daily` → Current week's daily entries
- `habitsAllWeeks` → All weeks' data (for future weeks)
- `habitsStreak` → Streak counter
- `habitsQuizHistory` → Quiz attempts and accuracy scores

**Note:** LocalStorage has ~5MB limit. Current data is <100KB.

---

## 🔄 MULTI-WEEK SUPPORT (Future Build)

To add weeks 2-4:
1. Store data per week in localStorage
2. Add week selector dropdown
3. Copy the entire daily data structure per week
4. Update streak logic to sum consecutive completed weeks

Current structure supports single week. Scale with:
```jsx
const [currentWeek, setCurrentWeek] = useState(1);
const storageKey = `habitsWeek${currentWeek}Daily`;
```

---

## 🎯 FEATURE CHECKLIST

- [x] Daily Bible reading checkbox
- [x] S.O.A.P. journaling (4 fields)
- [x] 3 daily prayers (See, Surrender, Send)
- [x] Memory verse reminder + quiz
- [x] Auto-save with visual feedback
- [x] Undo/History system
- [x] Clipboard copy
- [x] Streak counter
- [x] Badge system (4 badges)
- [x] Memorization meter with progress bar
- [x] Reflect Back (week summary)
- [x] PDF/text export
- [x] PWA installable
- [x] Offline support (service worker)
- [x] Auto-expanding textareas
- [x] Responsive mobile/desktop
- [x] Dark brutalist design

---

## 🐛 TROUBLESHOOTING

**PWA not installing?**
- Ensure HTTPS (required for PWA)
- Check manifest.json is served correctly
- Clear browser cache and retry

**Service worker not caching?**
- First visit: assets are cached
- Offline access works on second visit
- Check DevTools → Application → Cache Storage

**History/Undo not working?**
- Uses localStorage
- Limited to last 10 changes
- Click `↶` to undo

**Quiz accuracy not showing?**
- Need to submit first
- Reloading page keeps score
- Accuracy = words matched / 3

---

## 📊 DATA STRUCTURE

```js
// Daily data per day
{
  "Monday": {
    "readingComplete": true/false,
    "soap": {
      "scripture": "...",
      "observation": "...",
      "application": "...",
      "prayer": "..."
    },
    "prayers": {
      "0": "See prayer text",
      "1": "Surrender prayer text",
      "2": "Send prayer text"
    },
    "checkedBy": "Teacher name"
  }
}

// Quiz history
{
  "Monday": {
    "accuracy": 85,
    "timestamp": "2024-04-12T10:30:00Z"
  }
}
```

---

## 🚀 NEXT STEPS

1. **Deploy to Vercel** (free, fast)
2. **Test on mobile** (iOS + Android)
3. **Share link with class** before Sunday
4. **Collect feedback** from first week
5. **Scale to weeks 2-4** (duplicate + update references)

---

## 📞 SUPPORT

If features break:
1. Check browser console for errors
2. Clear localStorage: `localStorage.clear()`
3. Reload page
4. Re-download/redeploy app

**This is production-ready code.** All localStorage persists across sessions.
