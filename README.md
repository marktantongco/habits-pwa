# Habits Class: Daily Devotional PWA

A Progressive Web App for spiritual growth tracking with Bible reading, S.O.A.P. journaling, prayer prompts, memory verse quizzes, and a teacher dashboard.

Built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

## Features

### Student Side
- **Bible Reading Tracker** - Track daily readings through John 1-7
- **S.O.A.P. Journaling** - Scripture, Observation, Application, Prayer entries for each day
- **Three Daily Prayers** - See, Surrender, and Send prayer prompts with journaling
- **Memory Verse Quiz** - Test recall of John 1:1-5 with accuracy scoring
- **Badge System** - Earn badges: Perfect Week, On Fire, Memory Master, Consistent
- **Badge Unlock Notifications** - Animated popup celebrations when earning new badges
- **Streak Counter** - Track consecutive weekly completion
- **Undo History** - Revert up to 10 changes
- **Export Prayers** - Download prayer entries as a text file
- **Reflect Back** - Review all weekly S.O.A.P. entries at a glance
- **Memorization Meter** - Track quiz accuracy across attempts
- **Student Identification** - Auto-generated unique ID with name for teacher tracking

### Teacher Side
- **Password-Protected Dashboard** - Toggle from student view via "Teacher?" button
- **Real-time Class Analytics** - Class size, avg completion, SOAP quality, at-risk count
- **Daily Completion Chart** - Visual bar chart showing Mon-Sun progress
- **At-Risk Alerts** - Identify students with fewer than 4 days completed
- **Student Performance Table** - Per-student metrics with badges and completion %
- **Week Selector** - Switch between Week 1-4 views
- **Parent Email Reports** - One-click email with full student progress report
- **Downloadable Reports** - Generate text reports for each student
- **Student Detail Modal** - Drill into individual student daily entries

### PWA Features
- **Installable** - Add to home screen on any device
- **Offline Support** - Service worker caches assets for offline use
- **Mobile-First Design** - Responsive layout optimized for phones and tablets
- **Dark Brutalist Theme** - Black + yellow design with Syne font

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | React framework |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Lucide React | Icons |
| localStorage | Client-side data persistence |
| Service Worker | Offline caching |

## Project Structure

```
src/
  app/
    layout.tsx        # Root layout with PWA metadata, Syne font
    page.tsx          # Main app (student tracker + teacher dashboard)
    globals.css       # Tailwind config + custom scrollbar styles
public/
    manifest.json     # PWA manifest
    service-worker.js # Offline caching service worker
```

## Data Storage

All data is stored in the browser's `localStorage`:

### Student Data (with Student ID)
- `habitsStudentId` - Unique student identifier
- `{studentId}_name` - Student name
- `{studentId}_habitsWeek{N}Daily` - Daily reading/SOAP/prayer data
- `{studentId}_streak` - Week streak count
- `{studentId}_quizHistory` - Quiz attempt records
- `{studentId}_badges` - Earned badge IDs

### Legacy Data (backwards compatible)
- `habitsWeek1Daily` - Daily data without student ID
- `habitsStreak` - Streak count
- `habitsQuizHistory` - Quiz history

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm or Bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/marktantongco/habits-pwa.git
cd habits-pwa

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build static export (for Vercel or GitHub Pages)
bun run build
```

The static files are output to the `out/` directory.

## Deployment

### Vercel
1. Push to GitHub
2. Connect repository in Vercel dashboard
3. Vercel auto-detects Next.js and deploys

### GitHub Pages
1. Build the static export: `bun run build`
2. Deploy the `out/` directory to GitHub Pages
3. Or use GitHub Actions to automate deployment

## Configuration

### Teacher Password
Default password: `habits2024`

To change, edit the `TEACHER_PASSWORD` constant in `src/app/page.tsx`.

### Reading Schedule
Edit the `SCHEDULE` array in `src/app/page.tsx` to customize:
- Daily Bible chapters
- S.O.A.P. passage ranges
- S.O.A.P. passage text

### Memory Verse
Edit `MEMORY_VERSE` and `MEMORY_REFERENCE` constants.

### Badge Criteria
| Badge | Requirement |
|---|---|
| Perfect Week | Complete all 7 days with SOAP |
| On Fire | Complete 5+ days with SOAP |
| Memory Master | 80%+ quiz accuracy |
| Consistent | 2+ week streak |

## Screenshots

The app features a dark, brutalist design with yellow (#FFEA00) accents on a black background, using the Syne font family for a bold, modern aesthetic.

## Browser Support

- Chrome 80+
- Firefox 80+
- Safari 14+
- Edge 80+

## License

MIT
