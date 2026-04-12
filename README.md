# Habits Class: Daily Devotional PWA

A comprehensive Progressive Web App for spiritual growth tracking, featuring Bible reading, S.O.A.P. journaling, prayer prompts, memory verse quizzes, clipboard history, and a full teacher dashboard with day-status awareness.

Built with **Next.js 16**, **TypeScript**, and **Tailwind CSS 4**.

---

## Features Overview

### Student Features
- **Bible Reading Tracker** - Track daily readings through John 1-7 with visual completion status
- **S.O.A.P. Journaling** - Scripture, Observation, Application, Prayer entries for each day with word counts
- **Three Daily Prayers** - See, Surrender, and Send prayer prompts with journaling textareas
- **Memory Verse Quiz** - Test recall of John 1:1-5 with accuracy scoring and attempt tracking
- **Badge System** - Earn 4 badges: Perfect Week, On Fire, Memory Master, Consistent
- **Badge Unlock Notifications** - Animated slide-in celebrations when earning new badges
- **Streak Counter** - Track consecutive weekly completion with flame badge
- **Clipboard History** - Every copy is tracked with timestamps; review, re-copy, or delete entries (max 20)
- **Save Work Button** - Explicit save with visual pulse feedback + auto-save on every change
- **Undo History** - Revert up to 10 changes with full data rollback
- **Export Prayers** - Download prayer entries as a formatted text file
- **Reflect Back** - Weekly review modal showing all 7 days of S.O.A.P. entries at a glance
- **Memorization Meter** - Track quiz accuracy across all attempts with tier indicators
- **Student Identification** - Auto-generated unique ID with onboarding name capture
- **6 Color Themes** - Midnight Gold, Ocean Deep, Forest Calm, Sunset Ember, Lavender Dream, Arctic Light
- **Enhanced Theme Selector** - Floating action button with animated theme picker and toast notifications

### Day Status System
Every day in the weekly schedule is visually distinguished:

| Status | Condition | Visual | Icon |
|---|---|---|---|
| **Done** | Reading complete + SOAP content | Green border + success shading | Star + Checkmark |
| **Past Due** | Day before today + not done | Red border + pulsing warning | AlertTriangle |
| **Due Today** | Today + not done | Amber border + caution shading | AlertCircle |
| **Current** | Today + selected | Accent color highlight | Active indicator |
| **Future** | Day after today | Muted gray styling | Muted dot |

### Completion Animations
- **Star Burst** - Animated star explosion when a task is marked complete
- **Checkmark Appear** - Checkmark fades in after the star settles (0.6s delay)
- **Reward Section** - Motivational text appears below completed reading tasks
- **Badge Unlock** - 3D flip animation when a new badge is earned
- **Save Pulse** - Green pulse ring on explicit save action

### Teacher Dashboard
- **Password-Protected Access** - Toggle from student view via "Teacher?" button (password: `/123`)
- **Real-time Class Analytics** - Class size, avg completion, SOAP quality, at-risk student count
- **Daily Completion Chart** - Color-coded progress bars for Mon-Sun
- **At-Risk Alerts** - Students with fewer than 4 days highlighted with red indicators
- **Student Performance Table** - Per-student metrics with completion % and SOAP quality
- **Day Status Integration** - Teacher view uses same done/past-due/due-today system
- **Week Selector** - Switch between Week 1-4 views
- **Parent Communication** - One-click email + downloadable text reports per student
- **Student Detail Modal** - Drill into individual student daily entries with stars/warnings

### PWA Features
- **Installable** - Add to home screen on any device (manifest.json + service worker)
- **Offline Support** - Service worker caches all assets for offline use
- **Mobile-First Design** - Responsive layout optimized for phones and tablets
- **GPU-Accelerated Animations** - `will-change: transform` and `translateZ(0)` for smooth 60fps
- **Reduced Motion** - Respects `prefers-reduced-motion` for accessibility

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | React framework with App Router |
| TypeScript | Full type safety |
| Tailwind CSS 4 | Utility-first styling |
| Lucide React | SVG icon library |
| localStorage | Client-side data persistence |
| Service Worker | Offline caching |
| CSS Custom Properties | Dynamic theming system |
| React.memo | Performance optimization on modals |

## Project Structure

```
habits-pwa/
  src/
    app/
      layout.tsx          # Root layout: DM Serif Display + DM Sans fonts, PWA metadata
      page.tsx            # Main app (1823 lines): student tracker + teacher dashboard
      globals.css         # Theme system (6 themes), animations, day status styles
    components/ui/        # Shared UI components (shadcn/ui)
    lib/
      utils.ts            # Utility functions
    hooks/
      use-toast.ts        # Toast notification hook
  public/
    manifest.json         # PWA manifest (installable app)
    service-worker.js     # Offline caching service worker
    logo.svg              # App logo
    robots.txt            # SEO robots configuration
  next.config.ts          # Static export configuration
  package.json            # Dependencies and scripts
```

## Data Storage

All data is stored in the browser's `localStorage` with student-specific namespacing:

### Student Data
| Key | Description |
|---|---|
| `habitsStudentId` | Unique student identifier (auto-generated) |
| `{studentId}_name` | Student name (set during onboarding) |
| `{studentId}_habitsWeek{N}Daily` | Daily reading/SOAP/prayer data |
| `{studentId}_streak` | Week streak count |
| `{studentId}_quizHistory` | Quiz attempt records with accuracy |
| `{studentId}_badges` | Earned badge IDs array |
| `{studentId}_clipboardHistory` | Clipboard copy history (max 20) |
| `habitsTheme` | Selected color theme ID |

### Theme System
6 themes controlled via CSS custom properties on `[data-theme]` attribute:
- **Midnight Gold** (default) - Black + yellow (#FFEA00)
- **Ocean Deep** - Dark blue + cyan (#00d4ff)
- **Forest Calm** - Dark green + lime (#76ff03)
- **Sunset Ember** - Dark warm + orange (#ff6d00)
- **Lavender Dream** - Dark purple + pink (#e040fb)
- **Arctic Light** - Light theme + sky blue (#0ea5e9)

---

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or Bun package manager

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
# Build static export
bun run build
```

Output goes to `out/` directory, ready for deployment.

### Lint

```bash
bun run lint
```

---

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Vercel auto-detects Next.js and deploys
4. Set `output: "export"` is already configured in `next.config.ts`

### GitHub Pages
1. Build: `bun run build`
2. The `out/` directory contains the static site
3. Deploy `out/` to GitHub Pages (branch or GitHub Actions)
4. Site available at `https://marktantongco.github.io/habits-pwa/`

---

## Configuration

### Teacher Password
Default: `/123`

To change, edit the `TEACHER_PASSWORD` constant in `src/app/page.tsx`:

```typescript
const TEACHER_PASSWORD = '/123';
```

### Reading Schedule
Edit the `SCHEDULE` array to customize daily Bible chapters, SOAP ranges, and passage text.

### Memory Verse
Edit `MEMORY_VERSE` and `MEMORY_REFERENCE` constants for the weekly memory challenge.

### Prayer Prompts
Edit the `PRAYERS` array to customize the three daily prayer types.

### Badge Criteria
| Badge | Requirement |
|---|---|
| Perfect Week | Complete all 7 days with full SOAP entries |
| On Fire | Complete 5+ days with SOAP content |
| Memory Master | 80%+ average quiz accuracy |
| Consistent | 2+ week streak maintained |

---

## Design System

### Typography
- **Display/Headings**: DM Serif Display (serif) - elegant, authoritative
- **Body/UI**: DM Sans (sans-serif) - clean, modern readability
- **Code/Verse**: Monospace - for references and technical content

### Color Semantics (per theme)
| Variable | Purpose |
|---|---|
| `--th-bg` | Main background |
| `--th-bg-card` | Card/panel background |
| `--th-border` | Default border |
| `--th-text` | Primary text |
| `--th-accent` | Theme accent color |
| `--th-success` | Done/completed (green) |
| `--th-danger` | Past due/error (red) |
| `--th-warning` | Due today/caution (amber) |
| `--th-info` | Informational (blue) |

### Animations
| Animation | Duration | Use |
|---|---|---|
| `star-burst` | 0.8s | Task completion |
| `checkmark-appear` | 0.5s (0.6s delay) | After star settles |
| `pulse-warning` | 1.5s loop | Past-due indicators |
| `badge-unlock` | 0.6s | New badge earned |
| `slide-in-right` | 0.3s | Badge notification toast |
| `modal-content` | 0.3s | Modal panel entrance |
| `save-pulse` | 0.6s | Save confirmation |
| `shimmer` | 1.5s loop | Loading placeholder |

---

## Browser Support

- Chrome 80+
- Firefox 80+
- Safari 14+
- Edge 80+

## License

MIT

---

## Credits

Built for the Habits Class spiritual growth program.
Typography: DM Serif Display + DM Sans by Colophon Foundry.
Icons: Lucide React.
