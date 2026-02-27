# DataGuard Sentinel — Admin Dashboard Development Guide (React)

> **Project:** DataGuard Sentinel: Metadata-Based Data Exfiltration Detection System  
> **Group:** ISP-09 | SLIIT BSc (Hons) in IT — Specialisation in Cyber Security  
> **Members:** IT23415140 (Liyanage P.G.D.), IT23187214 (Rathnayake R.D.N.K.)  
> **Document Version:** 1.0  
> **Date:** February 25, 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Proposal Requirements — Full Checklist](#2-proposal-requirements--full-checklist)
3. [Technology Stack](#3-technology-stack)
4. [UI/UX Design System](#4-uiux-design-system)
5. [Project Setup](#5-project-setup)
6. [Firebase Integration](#6-firebase-integration)
7. [Firestore Collections & Data Schema](#7-firestore-collections--data-schema)
8. [SignalR Real-Time Hub](#8-signalr-real-time-hub)
9. [Agent → Dashboard Data Flow](#9-agent--dashboard-data-flow)
10. [Authentication & Admin Password Management](#10-authentication--admin-password-management)
11. [User Management (Add / Remove / Full List)](#11-user-management-add--remove--full-list)
12. [Dashboard Pages & Features](#12-dashboard-pages--features)
13. [Component Architecture](#13-component-architecture)
14. [API Endpoints (SignalR Hub Server)](#14-api-endpoints-signalr-hub-server)
15. [State Management](#15-state-management)
16. [Charts, Pie Charts & Bar Charts — Full Analytics](#16-charts-pie-charts--bar-charts--full-analytics)
17. [Monthly Reports with Customization](#17-monthly-reports-with-customization)
18. [Notification System](#18-notification-system)
19. [Routing Structure](#19-routing-structure)
20. [Security Considerations](#20-security-considerations)
21. [Environment Configuration](#21-environment-configuration)
22. [Deployment](#22-deployment)
23. [Testing Strategy](#23-testing-strategy)
24. [Development Milestones](#24-development-milestones)

---

## 1. Overview

The Admin Dashboard is a **centralized web-based application** for security analysts to monitor, investigate, and respond to data exfiltration events detected by the DataGuard Sentinel endpoint agents. It is the **5th major objective** of the project proposal:

> **O5:** Build a centralized web-based admin dashboard for security analysts

### What Already Exists (Backend — Ready)

| Component | Status | Details |
|-----------|--------|---------|
| Firebase Firestore database | ✅ Ready | 10 collections populated by endpoint agents |
| Firestore security rules | ✅ Ready | Role-based access (admin/user/system), 171 lines |
| Firebase Auth (admin) | ✅ Ready | `FirebaseAuthService` — admin create/authenticate/verify |
| SignalR client (agent-side) | ✅ Ready | `SignalRAlertService` — 7 hub methods, command receiving |
| Data models | ✅ Ready | `UploadEvent`, `DlpAlert`, `UserRiskProfile`, `ClipboardEvent`, `RemovableMediaEvent`, `AiApplicationEvent` |
| Data pipeline | ✅ Ready | All monitoring channels → Firestore + SignalR |
| Agent heartbeat | ✅ Ready | `agents` collection with `lastHeartbeat`, `status`, `scanCount` |
| Audit logging | ✅ Ready | Immutable `auditLogs` collection |

### What Needs To Be Built

| Component | Priority |
|-----------|----------|
| React web dashboard frontend | 🔴 Critical |
| ASP.NET Core SignalR hub server | 🔴 Critical |
| Admin login/authentication UI | 🔴 Critical |
| Admin password change functionality | 🔴 Critical |
| Real-time monitoring views | 🔴 Critical |
| User management (list, add, remove) | 🔴 Critical |
| Alert management & investigation | 🟡 High |
| Risk analytics & charting | 🟡 High |
| Policy management UI | 🟡 High |
| Report generation | 🟢 Medium |

---

## 2. Proposal Requirements — Full Checklist

All items below are derived from the original project proposal and must be implemented in the admin dashboard:

### 2.1 Core Dashboard Features (from Proposal Objective O5)

| # | Proposal Requirement | Dashboard Feature | Priority |
|---|---------------------|-------------------|----------|
| P1 | Centralized web-based admin dashboard | React SPA with Firebase backend | 🔴 Critical |
| P2 | Real-time monitoring panel | Live alert feed via SignalR WebSocket | 🔴 Critical |
| P3 | User risk overview | TRS/BRS scores, risk level badges, violation history per user | 🔴 Critical |
| P4 | Upload event viewer | Searchable/filterable event table with details drawer | 🔴 Critical |
| P5 | Alert management | View, acknowledge, resolve, add investigation notes | 🔴 Critical |
| P6 | Repeat offender flagging | Escalation alerts, violation count badges, auto-flagging | 🔴 Critical |
| P7 | Organizational risk overview | Aggregate risk stats, department breakdown, trend charts | 🔴 Critical |

### 2.2 Endpoint Agent Monitoring (from Proposal Objective O1)

| # | Proposal Requirement | Dashboard Feature | Priority |
|---|---------------------|-------------------|----------|
| P8 | Monitor connected endpoint agents | Agent list with online/offline status, last heartbeat, scan count | 🔴 Critical |
| P9 | Agent health monitoring | Health dashboard with uptime, last scan, error alerts | 🟡 High |
| P10 | Remote agent commands | Send commands via SignalR: scan-now, update-policy, restart | 🟡 High |

### 2.3 Upload Channel Monitoring (from Proposal Objective O2)

| # | Proposal Requirement | Dashboard Feature | Priority |
|---|---------------------|-------------------|----------|
| P11 | Browser upload events | Browser upload events list with destination URL, file details, risk score | 🔴 Critical |
| P12 | Clipboard DLP events | Clipboard event viewer with source process, AI app targeting, sensitive patterns | 🔴 Critical |
| P13 | USB/Removable media events | USB event list with drive info, file details, block status | 🔴 Critical |
| P14 | AI application detection events | AI app event viewer with detected apps, network connections, paste-to-AI alerts | 🔴 Critical |
| P15 | Email monitoring events | Email exfiltration event viewer (when implemented in agent) | 🟢 Medium |
| P16 | FTP monitoring events | FTP transfer event viewer (when implemented in agent) | 🟢 Medium |
| P17 | Cloud sync monitoring events | Cloud sync event viewer | 🟢 Medium |

### 2.4 Metadata & Classification (from Proposal Objective O3)

| # | Proposal Requirement | Dashboard Feature | Priority |
|---|---------------------|-------------------|----------|
| P18 | File metadata display | Show file hash, size, timestamps, extension, category in event details | 🔴 Critical |
| P19 | Content scan results | Display matched confidential patterns (credit cards, SSN, API keys, etc.) | 🔴 Critical |
| P20 | Sensitivity classification | Visual badges: Public (green), Internal (blue), Confidential (orange), Restricted (red) | 🔴 Critical |
| P21 | File category breakdown | Charts/stats: Document, Spreadsheet, Code, Database, Archive, Image, Video | 🟡 High |

### 2.5 Risk Scoring Display (from Proposal Objective O4)

| # | Proposal Requirement | Dashboard Feature | Priority |
|---|---------------------|-------------------|----------|
| P22 | Transaction Risk Score (TRS) display | Per-event TRS with component breakdown (Sensitivity 40%, Destination 25%, Size 15%, Time 10%, Type 10%) | 🔴 Critical |
| P23 | Behavioral Risk Score (BRS) display | Per-user BRS with trend history, decay visualization, escalation alerts | 🔴 Critical |
| P24 | Risk level thresholds | Visual indicators: LOW (0-30 green), MEDIUM (31-60 yellow), HIGH (61-80 orange), CRITICAL (81-100 red) | 🔴 Critical |
| P25 | TRS component weights | Display/configure: Sensitivity (40%), Destination Trust (25%), File Size (15%), Time Pattern (10%), File Type (10%) | 🟡 High |

### 2.6 Admin Management Features

| # | Proposal Requirement | Dashboard Feature | Priority |
|---|---------------------|-------------------|----------|
| P26 | Admin authentication | Secure login page with Firebase auth | 🔴 Critical |
| P27 | Admin password change | Change admin password from dashboard settings | 🔴 Critical |
| P28 | User list management | Full list of all registered users with search, filter, sort | 🔴 Critical |
| P29 | Remove user on agent uninstall | Admin can remove user details from dashboard after agent uninstall | 🔴 Critical |
| P30 | User registration tracking | View user registration details: employeeId, machineName, registeredAt, status | 🔴 Critical |

### 2.7 Communication & Backend (from Proposal)

| # | Proposal Requirement | Dashboard Feature | Priority |
|---|---------------------|-------------------|----------|
| P31 | SignalR real-time communication | WebSocket connection to SignalR hub for live data | 🔴 Critical |
| P32 | Dashboard command sending | Send commands to agents: scan-now, update-config, policy-update | 🟡 High |
| P33 | Firestore direct reads | Read from all 10 Firestore collections for historical data | 🔴 Critical |

### 2.8 Anti-Tampering & Security Visibility (from Proposal)

| # | Proposal Requirement | Dashboard Feature | Priority |
|---|---------------------|-------------------|----------|
| P34 | Audit log viewer | Immutable audit trail viewer (read-only, no delete) | 🔴 Critical |
| P35 | Tamper attempt alerts | Display service stop/restart/uninstall attempts from agents | 🟡 High |
| P36 | Agent offline alerts | Alert when agent heartbeat missing > threshold | 🟡 High |

### 2.9 Policy & Configuration Management

| # | Proposal Requirement | Dashboard Feature | Priority |
|---|---------------------|-------------------|----------|
| P37 | Destination trust management | Manage trusted/suspicious/blacklisted domains and trust scores | 🟡 High |
| P38 | Risk threshold configuration | Configure TRS/BRS thresholds, alert/block levels | 🟡 High |
| P39 | Monitoring feature toggles | Enable/disable monitoring channels remotely per agent | 🟡 High |

### 2.10 Analytics & Reporting

| # | Proposal Requirement | Dashboard Feature | Priority |
|---|---------------------|-------------------|----------|
| P40 | Upload volume trends | Time-series charts showing upload events over time | 🟡 High |
| P41 | Channel breakdown analytics | Pie/bar charts: Browser vs USB vs Clipboard vs AI vs Email vs FTP | 🟡 High |
| P42 | Risk distribution charts | Histograms of TRS/BRS across organization | 🟡 High |
| P43 | Top risk users report | Ranked list of highest-risk users with BRS, violations, blocked uploads | 🔴 Critical |
| P44 | Exportable reports | PDF/CSV export of events, alerts, user profiles | 🟢 Medium |

---

## 3. Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.x | UI framework (SPA) |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Vite** | 5.x | Build tool & dev server |
| **React Router** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **shadcn/ui** | Latest | Pre-built accessible UI components |
| **Recharts** | 2.x | Charts & data visualization |
| **TanStack Table** | 8.x | Powerful data tables with filtering, sorting, pagination |
| **React Query (TanStack)** | 5.x | Server-state management, caching, real-time sync |
| **Zustand** | 4.x | Lightweight client-state management |
| **React Hook Form** | 7.x | Form handling with validation |
| **Zod** | 3.x | Runtime schema validation |
| **date-fns** | 3.x | Date formatting/manipulation |
| **Lucide React** | Latest | Icon library |
| **Sonner** | Latest | Toast notifications |
| **@microsoft/signalr** | 8.x | SignalR JavaScript client |
| **Firebase JS SDK** | 10.x | Firestore, Auth |

### Backend (SignalR Hub Server)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **ASP.NET Core** | 8.0 | Web API framework |
| **SignalR** | ASP.NET Core built-in | Real-time WebSocket hub |
| **Firebase Admin SDK** | Latest | Server-side Firestore + Auth |
| **Serilog** | Latest | Structured logging |
| **jsPDF** | 2.x | PDF generation for reports |
| **xlsx** | Latest | Excel/CSV export |
| **html2canvas** | 1.x | Chart screenshot for PDF reports |

---

## 4. UI/UX Design System

> **Design Philosophy:** Clean, minimal, data-dense. No excessive animations. Let the data speak.

### 4.1 Design Principles

| Principle | Description |
|-----------|-------------|
| **Clarity over decoration** | Every pixel serves a purpose — no ornamental animations or gradients |
| **Data density** | Show maximum useful data per screen; avoid wasted whitespace |
| **Consistent hierarchy** | Same visual weight for same-level elements across all pages |
| **Instant feedback** | Subtle state changes (hover, active, loading) — no flashy transitions |
| **Accessible contrast** | WCAG 2.1 AA minimum — 4.5:1 text, 3:1 UI components |
| **Scannable layout** | Left-to-right, top-to-bottom flow; KPIs at top, details below |

### 4.2 Color System

```css
/* src/index.css — CSS Custom Properties */
:root {
  /* Background */
  --bg-primary: #ffffff;          /* Main content background */
  --bg-secondary: #f8fafc;        /* Page background (slate-50) */
  --bg-sidebar: #0f172a;          /* Sidebar dark (slate-900) */
  --bg-card: #ffffff;             /* Card surface */
  --bg-hover: #f1f5f9;           /* Row/item hover (slate-100) */
  --bg-selected: #eff6ff;        /* Selected row (blue-50) */

  /* Text */
  --text-primary: #0f172a;        /* Headings (slate-900) */
  --text-secondary: #475569;      /* Body text (slate-600) */
  --text-muted: #94a3b8;          /* Captions, timestamps (slate-400) */
  --text-inverse: #f8fafc;        /* Text on dark backgrounds */

  /* Borders */
  --border-default: #e2e8f0;      /* Card borders (slate-200) */
  --border-focus: #3b82f6;        /* Focus ring (blue-500) */

  /* Semantic — Risk Levels */
  --risk-low: #22c55e;            /* Green-500 */
  --risk-low-bg: #f0fdf4;         /* Green-50 */
  --risk-medium: #eab308;         /* Yellow-500 */
  --risk-medium-bg: #fefce8;      /* Yellow-50 */
  --risk-high: #f97316;           /* Orange-500 */
  --risk-high-bg: #fff7ed;        /* Orange-50 */
  --risk-critical: #ef4444;       /* Red-500 */
  --risk-critical-bg: #fef2f2;    /* Red-50 */

  /* Semantic — Sensitivity Levels */
  --sens-public: #22c55e;         /* Green */
  --sens-internal: #3b82f6;       /* Blue */
  --sens-confidential: #f97316;   /* Orange */
  --sens-restricted: #ef4444;     /* Red */

  /* Semantic — Status */
  --status-online: #22c55e;       /* Green */
  --status-warning: #eab308;      /* Yellow */
  --status-offline: #ef4444;      /* Red */

  /* Brand */
  --brand-primary: #3b82f6;       /* Blue-500 — primary actions */
  --brand-primary-hover: #2563eb; /* Blue-600 */
  --brand-accent: #6366f1;        /* Indigo-500 — secondary accent */
}

/* Dark mode (optional, toggled via class) */
.dark {
  --bg-primary: #1e293b;
  --bg-secondary: #0f172a;
  --bg-sidebar: #020617;
  --bg-card: #1e293b;
  --bg-hover: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --border-default: #334155;
}
```

### 4.3 Typography

| Role | Font | Weight | Size | Tailwind Class |
|------|------|--------|------|----------------|
| **Page title** | Inter | 600 (Semibold) | 24px / 1.5rem | `text-2xl font-semibold` |
| **Section heading** | Inter | 600 | 18px / 1.125rem | `text-lg font-semibold` |
| **Card title** | Inter | 500 (Medium) | 14px / 0.875rem | `text-sm font-medium` |
| **Body text** | Inter | 400 (Regular) | 14px / 0.875rem | `text-sm` |
| **Table header** | Inter | 500 | 12px / 0.75rem | `text-xs font-medium uppercase tracking-wider` |
| **Table cell** | Inter | 400 | 13px / 0.8125rem | `text-[13px]` |
| **KPI number** | Inter | 700 (Bold) | 28px / 1.75rem | `text-3xl font-bold` |
| **Badge text** | Inter | 500 | 11px / 0.6875rem | `text-[11px] font-medium` |
| **Caption/timestamp** | Inter | 400 | 12px / 0.75rem | `text-xs text-muted-foreground` |

**Font import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

### 4.4 Spacing & Grid

| Element | Spacing | Tailwind |
|---------|---------|----------|
| Page padding | 24px | `p-6` |
| Card padding | 16px-20px | `p-4` or `p-5` |
| Card gap (grid) | 16px | `gap-4` |
| Section gap | 24px | `space-y-6` |
| Table row height | 40px | `h-10` |
| Sidebar width | 240px (expanded), 64px (collapsed) | fixed |
| Header height | 56px | `h-14` |

**Grid system examples:**
```
Dashboard KPIs:  grid-cols-2 md:grid-cols-4 lg:grid-cols-6  (responsive)
Chart row:       grid-cols-1 lg:grid-cols-2                  (two charts side by side)
Detail panels:   grid-cols-1 xl:grid-cols-3                  (main + 2 side panels)
```

### 4.5 Component Design Patterns

#### Stat Card (KPI)

```
┌──────────────────────────┐
│  📤 Total Uploads         │   ← Icon + label (text-xs text-muted, uppercase)
│                           │
│  1,247                    │   ← Value (text-3xl font-bold)
│  ▲ 12% from last month   │   ← Trend (text-xs, green if up, red if down)
└──────────────────────────┘
```
- White card, 1px border `slate-200`, `rounded-lg`, `shadow-sm`
- No gradient, no background color fills
- Subtle hover: `hover:shadow-md` (only shadow change)

#### Data Table Row

```
┌──────┬───────────┬──────────┬────────┬───────────┬────┬──────────┐
│ Time │ User      │ File     │ Channel│ Dest.     │TRS │ Status   │
├──────┼───────────┼──────────┼────────┼───────────┼────┼──────────┤
│12:34 │ john_d    │ Q4.xlsx  │ Browser│ drive.goo │ 72 │ ● Blocked│   ← row
│12:31 │ sara_k    │ img.png  │ USB    │ E:\       │ 15 │ ● Allowed│   ← alternating bg
└──────┴───────────┴──────────┴────────┴───────────┴────┴──────────┘
```
- Alternating row: `even:bg-slate-50` (very subtle)
- Hover: `hover:bg-slate-100`
- No bold row borders — use `divide-y divide-slate-100`
- Clickable rows: `cursor-pointer`

#### Alert Feed Item

```
┌─────────────────────────────────────────────────────┐
│ 🔴 CRITICAL  Restricted file uploaded to AI service  │   ← Type badge + title
│ john_doe • Q4-financials.xlsx • 12:34 PM            │   ← User • file • time
│ TRS: 92 • Channel: Browser • ChatGPT               │   ← Meta line
└─────────────────────────────────────────────────────┘
```
- Left border color matches severity: `border-l-4 border-red-500`
- Background: white (or very subtle tint for critical: `bg-red-50`)
- No animation on entry — just appears at top of list

#### Badge Variants

```
Risk:        [LOW]  [MEDIUM]  [HIGH]  [CRITICAL]
Sensitivity: [Public]  [Internal]  [Confidential]  [Restricted]
Status:      [● Online]  [● Warning]  [● Offline]
Channel:     [Browser]  [Clipboard]  [USB]  [AI App]
Alert:       [Info]  [Warning]  [Block]  [Critical]
```
- Pill shape: `rounded-full px-2.5 py-0.5`
- Soft colored background + dark text (e.g., `bg-red-100 text-red-700`)
- No border, no shadow

### 4.6 Layout — Complete Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HEADER BAR  (h-14, white, border-b)              │
│  ┌────┐                                                                    │
│  │Logo│  DataGuard Sentinel          🔍 Search...    🔔 3   👤 Admin ▾    │
│  └────┘                                                                    │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  SIDEBAR   │   PAGE CONTENT                                                 │
│  (w-60)    │                                                                │
│  bg-slate  │   ┌──────────────────────────────────────────────────────┐     │
│  -900      │   │ Page Title                          [Export] [Filter]│     │
│            │   └──────────────────────────────────────────────────────┘     │
│  ┌──────┐  │                                                                │
│  │  📊  │  │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Dashb.│  │   │ KPI 1   │ │ KPI 2   │ │ KPI 3   │ │ KPI 4   │           │
│  ├──────┤  │   └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  │  🔔  │  │                                                                │
│  │Alerts│  │   ┌──────────────────────┐ ┌──────────────────────┐           │
│  ├──────┤  │   │                      │ │                      │           │
│  │  📤  │  │   │   PIE CHART          │ │   BAR CHART          │           │
│  │Upload│  │   │   (Channel Split)    │ │   (Risk Dist.)       │           │
│  ├──────┤  │   │                      │ │                      │           │
│  │  📋  │  │   └──────────────────────┘ └──────────────────────┘           │
│  │Clipb.│  │                                                                │
│  ├──────┤  │   ┌───────────────────────────────────────────────┐           │
│  │  💾  │  │   │                                               │           │
│  │ USB  │  │   │   LINE CHART (Upload Volume Trend)            │           │
│  ├──────┤  │   │                                               │           │
│  │  🤖  │  │   └───────────────────────────────────────────────┘           │
│  │AI App│  │                                                                │
│  ├──────┤  │   ┌───────────────────────────────────────────────┐           │
│  │  👥  │  │   │   DATA TABLE                                  │           │
│  │Users │  │   │   (Recent Events / Users / Alerts)            │           │
│  ├──────┤  │   │                                               │           │
│  │  🖥️  │  │   └───────────────────────────────────────────────┘           │
│  │Agents│  │                                                                │
│  ├──────┤  │                                                                │
│  │  📈  │  │                                                                │
│  │Analyt│  │                                                                │
│  ├──────┤  │                                                                │
│  │  📄  │  │                                                                │
│  │Report│  │                                                                │
│  ├──────┤  │                                                                │
│  │  ⚙️  │  │                                                                │
│  │Settin│  │                                                                │
│  └──────┘  │                                                                │
│            │                                                                │
├────────────┴────────────────────────────────────────────────────────────────┤
│  Footer: DataGuard Sentinel v1.0  •  Connected to Hub ●  •  Last sync 2s  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.7 Transitions & Interactions (Minimal)

Only these CSS transitions are used — no JavaScript animations, no spring physics, no entrance animations:

| Interaction | Transition | Duration | CSS |
|------------|-----------|----------|-----|
| Button hover | Background color | 150ms | `transition-colors duration-150` |
| Card hover | Box shadow | 150ms | `transition-shadow duration-150` |
| Table row hover | Background color | 100ms | `transition-colors duration-100` |
| Sidebar collapse | Width | 200ms | `transition-[width] duration-200` |
| Dropdown open | Opacity + scale | 100ms | `transition-all duration-100` |
| Toast appear | Slide in from right | 200ms | Sonner default (controlled) |
| Dialog open | Opacity fade | 150ms | shadcn default |
| Focus ring | Box shadow | 0ms | Instant `ring-2 ring-blue-500` |

**What we do NOT use:**
- No page transition animations
- No skeleton shimmer loading (use simple spinner or `opacity-50` on stale data)
- No chart drawing animations (charts render instantly with data)
- No number counting animations on KPI cards
- No parallax, bounce, spring, or stagger effects
- No loading bars that animate across the top

### 4.8 Loading States

| State | Visual Treatment |
|-------|------------------|
| Page loading | Simple centered spinner (`animate-spin` on a circle SVG icon) |
| Table loading | Table skeleton: gray rows with `bg-slate-100 rounded animate-pulse` (max 3 rows) |
| Chart loading | Card with centered spinner, same card dimensions to prevent layout shift |
| Button loading | Spinner icon replaces button text, button disabled |
| Stale data (refetching) | Content stays visible at `opacity-70`, small spinner in corner |
| Empty state | Centered icon + "No data" text + optional action button |
| Error state | Red-tinted card with error message + "Retry" button |

### 4.9 Sidebar Design

```tsx
// Sidebar structure:
// - Dark background (slate-900)
// - White text / icons
// - Active item: bg-slate-800 + left blue border (border-l-2 border-blue-500) + white text
// - Inactive item: text-slate-400, hover:text-white hover:bg-slate-800/50
// - Section dividers: thin slate-700 line
// - Collapse to 64px (icon-only) on smaller screens
// - Logo at top, admin avatar at bottom
```

**Sidebar navigation groups:**
```
── OVERVIEW ──────────────
   Dashboard
   Alerts            (3)    ← unread badge

── MONITORING ────────────
   Upload Events
   Clipboard Events
   USB Events
   AI App Events

── MANAGEMENT ────────────
   Users
   Agents
   Audit Log

── INSIGHTS ──────────────
   Analytics
   Reports                  ← NEW: Monthly report page

── CONFIGURATION ─────────
   Policy
   Settings
```

### 4.10 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| `sm` | ≥ 640px | Single column, sidebar hidden (hamburger menu) |
| `md` | ≥ 768px | Sidebar collapsed (icons only), 2-column KPI grid |
| `lg` | ≥ 1024px | Sidebar expanded, 2-column chart grid, full tables |
| `xl` | ≥ 1280px | 4-column KPI grid, 3-column detail layouts |
| `2xl` | ≥ 1536px | Maximum content width, comfortable spacing |

### 4.11 Page Layout Templates

**Template A — Overview (Dashboard, Analytics)**
```
[KPI Cards Row]
[Chart] [Chart]
[Wide Chart / Table]
```

**Template B — Data Table (Events, Users, Agents, Audit)**
```
[Page Title + Filters + Export]
[Full-Width Data Table with Pagination]
```

**Template C — Detail (User Detail, Alert Detail)**
```
[Header Card with Key Info]
[Stats Cards Row]
[Chart] [Timeline]
[Related Events Table]
```

**Template D — Form (Settings, Policy)**
```
[Page Title]
[Form Section Card]
[Form Section Card]
[Save Button]
```

### 4.12 Icon Usage

Using **Lucide React** — line-style icons, consistent 20px size:

| Context | Icon | Usage |
|---------|------|-------|
| Dashboard | `LayoutDashboard` | Sidebar nav |
| Alerts | `Bell` | Sidebar + header notification |
| Upload events | `Upload` | Sidebar nav + event badges |
| Clipboard | `ClipboardCopy` | Sidebar nav |
| USB | `Usb` | Sidebar nav |
| AI Apps | `Bot` | Sidebar nav |
| Users | `Users` | Sidebar nav |
| Agents | `Monitor` | Sidebar nav |
| Audit | `FileText` | Sidebar nav |
| Analytics | `BarChart3` | Sidebar nav |
| Reports | `FileBarChart` | Sidebar nav |
| Settings | `Settings` | Sidebar nav |
| Policy | `Shield` | Sidebar nav |
| Search | `Search` | Header search bar |
| Filter | `SlidersHorizontal` | Filter toggles |
| Export | `Download` | Export button |
| Refresh | `RefreshCw` | Refresh data button |
| Risk Low | `CheckCircle` | Green |
| Risk Medium | `AlertTriangle` | Yellow |
| Risk High | `AlertOctagon` | Orange |
| Risk Critical | `XOctagon` | Red |
| Online | `Circle` (filled green) | Agent status |
| Offline | `Circle` (filled red) | Agent status |

---

## 5. Project Setup

### 4.1 Create React Project

```bash
# Create project with Vite + TypeScript
npm create vite@latest dataguard-dashboard -- --template react-ts
cd dataguard-dashboard

# Install core dependencies
npm install firebase @microsoft/signalr
npm install react-router-dom @tanstack/react-query @tanstack/react-table
npm install zustand react-hook-form @hookform/resolvers zod
npm install recharts date-fns lucide-react sonner
npm install tailwindcss @tailwindcss/vite

# Install shadcn/ui
npx shadcn@latest init

# Install shadcn components
npx shadcn@latest add button card input label table badge dialog
npx shadcn@latest add dropdown-menu avatar separator sheet tabs
npx shadcn@latest add alert command popover calendar select textarea
npx shadcn@latest add tooltip progress skeleton switch
```

### 4.2 Project Structure

```
dataguard-dashboard/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── main.tsx                        # App entry point
│   ├── App.tsx                         # Root component with Router
│   ├── index.css                       # Tailwind imports
│   │
│   ├── config/
│   │   ├── firebase.ts                 # Firebase SDK initialization
│   │   ├── signalr.ts                  # SignalR hub connection
│   │   └── environment.ts              # Environment variables
│   │
│   ├── types/
│   │   ├── upload-event.ts             # UploadEvent interface
│   │   ├── dlp-alert.ts               # DlpAlert interface
│   │   ├── user-risk-profile.ts       # UserRiskProfile interface
│   │   ├── clipboard-event.ts         # ClipboardEvent interface
│   │   ├── removable-media-event.ts   # RemovableMediaEvent interface
│   │   ├── ai-application-event.ts    # AiApplicationEvent interface
│   │   ├── agent.ts                    # Agent heartbeat interface
│   │   ├── audit-log.ts               # AuditLog interface
│   │   ├── user.ts                     # User account interface
│   │   ├── admin.ts                    # Admin interface
│   │   ├── risk-scoring-config.ts     # Risk config interface
│   │   └── enums.ts                    # All enums
│   │
│   ├── services/
│   │   ├── firebase-service.ts         # Firestore CRUD operations
│   │   ├── auth-service.ts            # Admin authentication
│   │   ├── signalr-service.ts         # SignalR real-time connection
│   │   ├── user-service.ts            # User management (CRUD)
│   │   ├── alert-service.ts           # Alert management
│   │   ├── event-service.ts           # Upload/clipboard/USB event queries
│   │   ├── agent-service.ts           # Agent monitoring
│   │   ├── analytics-service.ts       # Data aggregation for charts
│   │   └── export-service.ts          # PDF/CSV report generation
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                  # Authentication hook
│   │   ├── useFirestore.ts            # Firestore query hook
│   │   ├── useSignalR.ts             # SignalR connection hook
│   │   ├── useRealTimeAlerts.ts       # Live alert subscription
│   │   ├── useAgentStatus.ts          # Agent online/offline tracking
│   │   └── useRiskScoring.ts          # Risk score calculations
│   │
│   ├── store/
│   │   ├── auth-store.ts              # Admin auth state (Zustand)
│   │   ├── alert-store.ts             # Real-time alert state
│   │   ├── notification-store.ts      # Toast notification state
│   │   └── filter-store.ts            # Global filter state
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx               # Admin login
│   │   ├── DashboardPage.tsx           # Main dashboard overview
│   │   ├── AlertsPage.tsx              # Alert management
│   │   ├── UploadEventsPage.tsx        # Upload event browser
│   │   ├── ClipboardEventsPage.tsx     # Clipboard DLP events
│   │   ├── UsbEventsPage.tsx           # USB/removable media events
│   │   ├── AiEventsPage.tsx            # AI application events
│   │   ├── UsersPage.tsx               # User list & management
│   │   ├── UserDetailPage.tsx          # Individual user profile
│   │   ├── AgentsPage.tsx              # Connected agents list
│   │   ├── AuditLogPage.tsx            # Immutable audit trail
│   │   ├── RiskAnalyticsPage.tsx       # Charts & analytics
│   │   ├── PolicyPage.tsx              # Policy configuration
│   │   └── SettingsPage.tsx            # Admin settings & password change
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   │   ├── Header.tsx              # Top header with notifications
│   │   │   ├── MainLayout.tsx          # Layout wrapper
│   │   │   └── ProtectedRoute.tsx      # Auth guard
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx            # KPI stat card
│   │   │   ├── AlertFeed.tsx           # Live alert feed
│   │   │   ├── RiskDistribution.tsx    # Risk level chart
│   │   │   ├── ChannelBreakdown.tsx    # Upload channel pie chart
│   │   │   ├── TopRiskUsers.tsx        # High-risk users list
│   │   │   ├── AgentStatusGrid.tsx     # Agent online/offline grid
│   │   │   └── RecentActivity.tsx      # Recent events feed
│   │   │
│   │   ├── alerts/
│   │   │   ├── AlertTable.tsx          # Alert data table
│   │   │   ├── AlertDetailDrawer.tsx   # Alert details side panel
│   │   │   ├── AlertActions.tsx        # Resolve, acknowledge, notes
│   │   │   └── AlertBadge.tsx          # Alert type/severity badge
│   │   │
│   │   ├── events/
│   │   │   ├── UploadEventTable.tsx    # Upload events table
│   │   │   ├── EventDetailModal.tsx    # Event detail popup
│   │   │   ├── EventFilters.tsx        # Filter bar
│   │   │   ├── ClipboardEventTable.tsx # Clipboard event table
│   │   │   ├── UsbEventTable.tsx       # USB event table
│   │   │   └── AiEventTable.tsx        # AI event table
│   │   │
│   │   ├── users/
│   │   │   ├── UserTable.tsx           # User list table
│   │   │   ├── UserCard.tsx            # User profile card
│   │   │   ├── UserRiskBadge.tsx       # Risk level badge
│   │   │   ├── ViolationTimeline.tsx   # Violation history
│   │   │   ├── RemoveUserDialog.tsx    # Confirm user removal
│   │   │   └── UserDetailPanel.tsx     # Full user detail view
│   │   │
│   │   ├── agents/
│   │   │   ├── AgentTable.tsx          # Agent status table
│   │   │   ├── AgentStatusBadge.tsx    # Online/offline badge
│   │   │   └── AgentCommandDialog.tsx  # Send command dialog
│   │   │
│   │   ├── risk/
│   │   │   ├── TrsBreakdown.tsx        # TRS component breakdown
│   │   │   ├── BrsTrendChart.tsx       # BRS over time chart
│   │   │   ├── RiskGauge.tsx           # Risk score gauge
│   │   │   └── RiskLevelBadge.tsx      # Risk level colored badge
│   │   │
│   │   ├── charts/
│   │   │   ├── UploadTrendChart.tsx    # Upload volume over time
│   │   │   ├── ChannelPieChart.tsx     # Channel distribution
│   │   │   ├── SensitivityBarChart.tsx # Sensitivity breakdown
│   │   │   ├── TimeHeatmap.tsx         # Upload time patterns
│   │   │   └── RiskHistogram.tsx       # TRS/BRS distribution
│   │   │
│   │   ├── settings/
│   │   │   ├── ChangePasswordForm.tsx  # Admin password change
│   │   │   ├── RiskThresholdConfig.tsx # TRS/BRS threshold settings
│   │   │   ├── DestinationTrustList.tsx # Manage trusted domains
│   │   │   └── MonitoringToggles.tsx   # Feature enable/disable
│   │   │
│   │   └── common/
│   │       ├── DataTable.tsx           # Reusable data table
│   │       ├── SearchBar.tsx           # Global search
│   │       ├── DateRangePicker.tsx     # Date range filter
│   │       ├── ExportButton.tsx        # CSV/PDF export
│   │       ├── LoadingSpinner.tsx      # Loading indicator
│   │       ├── EmptyState.tsx          # No data placeholder
│   │       └── SensitivityBadge.tsx    # Sensitivity level badge
│   │
│   └── utils/
│       ├── formatters.ts               # Date, number, file size formatters
│       ├── risk-colors.ts             # Risk level → color mapping
│       ├── constants.ts               # App constants
│       └── validators.ts              # Form validators
│
├── .env                                # Environment variables
├── .env.example                        # Template
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### 4.3 Create ASP.NET Core SignalR Hub Server

```bash
# In the DataGuard solution directory
dotnet new webapi -n DataGuard.DashboardApi -o src/DataGuard.DashboardApi
dotnet sln DataGuard.sln add src/DataGuard.DashboardApi/DataGuard.DashboardApi.csproj

# Add required packages
cd src/DataGuard.DashboardApi
dotnet add package Google.Cloud.Firestore
dotnet add package FirebaseAdmin
dotnet add package Serilog.AspNetCore
```

---

## 6. Firebase Integration

### 6.1 Firebase Configuration

```typescript
// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "dataguard-sentinel",
  // Add your Firebase web app config here
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "dataguard-sentinel.firebaseapp.com",
  databaseURL: "https://dataguard-sentinel-default-rtdb.firebaseio.com",
  storageBucket: "dataguard-sentinel.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
```

### 5.2 Firebase Admin SDK (Server-Side — Hub Server)

The SignalR hub server uses the Firebase Admin SDK with the existing service account:

```csharp
// src/DataGuard.DashboardApi/Services/FirebaseService.cs
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;

public class FirebaseService
{
    private readonly FirestoreDb _db;

    public FirebaseService()
    {
        // Uses existing service account from config/firebase-service-account.json
        var credential = GoogleCredential.FromFile("config/firebase-service-account.json");
        FirebaseApp.Create(new AppOptions { Credential = credential });
        _db = FirestoreDb.Create("dataguard-sentinel");
    }
}
```

---

## 7. Firestore Collections & Data Schema

### 7.1 Complete Collection Map

The endpoint agents already write to these collections. The dashboard reads from them:

| Collection | Document ID Pattern | Written By | Dashboard Access |
|-----------|-------------------|-----------|-----------------|
| **`dashboardAdmins`** | `{dashboardAdminId}` | Dashboard (self-managed) | Full CRUD — login, profile, password/email change |
| **`admins`** | `{adminId}` | ConfigUI (`FirebaseAuthService`) | Read + Write (view & change agent admin credentials) |
| **`users`** | `{userId}` | ConfigUI (`FirebaseAuthService`) | Full CRUD — list, view, remove |
| **`uploadEvents`** | `{eventId}` | EndpointAgent (`FirebaseEventService`) | Read + filter + search |
| **`riskProfiles`** | `{employeeId}` | EndpointAgent (`FirebaseEventService`) | Read (all profiles for user list) |
| **`alerts`** | `{alertId}` | EndpointAgent (`FirebaseEventService`) | Read + update (resolve/notes) |
| **`clipboardEvents`** | `CLIP_{timestamp}` | EndpointAgent (`FirebaseEventService`) | Read + filter |
| **`usbEvents`** | `USB_{timestamp}` | EndpointAgent (`FirebaseEventService`) | Read + filter |
| **`auditLogs`** | `LOG_{timestamp}_{guid}` | EndpointAgent (`FirebaseEventService`) | Read-only (immutable) |
| **`agents`** | `{agentId}` | EndpointAgent (`FirebaseEventService`) | Read (agent status/heartbeat) |
| **`settings`** | `{settingsId}` | Dashboard | Read + write (admin only) |
| **`ftpEvents`** | `FTP_{timestamp}` | EndpointAgent (future) | Read + filter |
| **`emailEvents`** | `EMAIL_{timestamp}` | EndpointAgent (future) | Read + filter |

### 6.2 TypeScript Interfaces

```typescript
// src/types/enums.ts
export enum UploadChannel {
  Unknown = "Unknown",
  Browser = "Browser",
  CloudSync = "CloudSync",
  FTP = "FTP",
  Email = "Email",
  EnterpriseApp = "EnterpriseApp",
}

export enum FileSensitivityLevel {
  Public = "Public",
  Internal = "Internal",
  Confidential = "Confidential",
  Restricted = "Restricted",
}

export enum FileCategory {
  Document = "Document",
  Spreadsheet = "Spreadsheet",
  Image = "Image",
  Video = "Video",
  Archive = "Archive",
  Code = "Code",
  Database = "Database",
  Other = "Other",
}

export enum DlpAlertType {
  Info = "Info",
  Warning = "Warning",
  Block = "Block",
  Critical = "Critical",
}

export enum DlpChannel {
  Browser = "Browser",
  Clipboard = "Clipboard",
  USB = "USB",
  FileSystem = "FileSystem",
  Email = "Email",
  Ftp = "Ftp",
  CloudSync = "CloudSync",
  AiApplication = "AiApplication",
}

export enum RiskLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export enum ViolationType {
  UnauthorizedDestination = "UnauthorizedDestination",
  SensitiveDataUpload = "SensitiveDataUpload",
  ExcessiveUploadVolume = "ExcessiveUploadVolume",
  OffHoursActivity = "OffHoursActivity",
  RepeatedBlocking = "RepeatedBlocking",
  SuspiciousBehavior = "SuspiciousBehavior",
}

export enum AiEventType {
  ProcessDetected = "ProcessDetected",
  NetworkConnection = "NetworkConnection",
  ClipboardPaste = "ClipboardPaste",
  ActiveWindowDetected = "ActiveWindowDetected",
  DataTransmission = "DataTransmission",
  FileAccess = "FileAccess",
}

export enum TrustCategory {
  Trusted = "Trusted",
  Known = "Known",
  Unknown = "Unknown",
  Suspicious = "Suspicious",
  Blacklisted = "Blacklisted",
}
```

```typescript
// src/types/upload-event.ts
import { UploadChannel, FileSensitivityLevel, FileCategory } from "./enums";

export interface UploadEvent {
  eventId: string;
  userId: string;
  deviceId: string;
  timestamp: Date;
  fileName: string;
  fileExtension: string;
  filePath: string;
  fileSizeBytes: number;
  channel: UploadChannel;
  applicationName: string;
  destinationUrl: string;
  destinationDomain: string;
  destinationIpAddress: string;
  sensitivityLevel: FileSensitivityLevel;
  category: FileCategory;
  transactionRiskScore: number;
  isBlocked: boolean;
  blockReason?: string;
}
```

```typescript
// src/types/dlp-alert.ts
import { DlpAlertType, DlpChannel } from "./enums";

export interface DlpAlert {
  alertId: string;
  type: DlpAlertType;
  channel: DlpChannel;
  title: string;
  message: string;
  fileName: string;
  details: string;
  sensitivityLevel: string;
  riskScore: number;
  timestamp: Date;
  // Dashboard-managed fields:
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  investigationNotes?: string;
  isEscalation: boolean;
}
```

```typescript
// src/types/user-risk-profile.ts
import { RiskLevel, ViolationType } from "./enums";

export interface UserRiskProfile {
  userId: string;
  username: string;
  email: string;
  department: string;
  behavioralRiskScore: number;
  currentRiskLevel: RiskLevel;
  totalUploads: number;
  blockedUploads: number;
  highRiskUploads: number;
  lastUploadTime: Date;
  profileCreatedAt: Date;
  lastUpdatedAt: Date;
  violationHistory: ViolationRecord[];
}

export interface ViolationRecord {
  violationId: string;
  eventId: string;
  description: string;
  timestamp: Date;
  type: ViolationType;
  riskScoreImpact: number;
}
```

```typescript
// src/types/clipboard-event.ts
export interface ClipboardEvent {
  timestamp: Date;
  textContent: string;
  contentLength: number;
  sourceProcess: string;
  sourceWindowTitle: string;
  containsSensitiveData: boolean;
  classification?: string;
  riskScore: number;
  matchedPatterns: string[];
  isTargetingAiApp: boolean;
  targetAiAppName?: string;
}
```

```typescript
// src/types/removable-media-event.ts
import { FileSensitivityLevel } from "./enums";

export interface RemovableMediaEvent {
  timestamp: Date;
  driveLetter: string;
  volumeLabel: string;
  filePath: string;
  fileName: string;
  fileSizeBytes: number;
  changeType: string;
  sensitivityLevel: FileSensitivityLevel;
  riskScore: number;
  isBlocked: boolean;
  blockReason?: string;
}
```

```typescript
// src/types/ai-application-event.ts
import { AiEventType } from "./enums";

export interface AiApplicationEvent {
  timestamp: Date;
  eventType: AiEventType;
  applicationName: string;
  processName: string;
  windowTitle: string;
  processId: number;
  remoteEndpoint: string;
  resolvedDomain: string;
  contentPreview: string;
  contentLength: number;
  isBlocked: boolean;
  blockReason: string;
  riskScore: number;
  matchedPatterns: string[];
  userId: string;
  deviceId: string;
}
```

```typescript
// src/types/agent.ts
export interface AgentHeartbeat {
  agentId: string;
  machineName: string;
  organizationId: string;
  lastHeartbeat: Date;
  status: "online" | "offline" | "warning";
  scanCount: number;
  currentUserId: string;
  agentVersion?: string;
  osVersion?: string;
  ipAddress?: string;
}
```

```typescript
// src/types/audit-log.ts
export interface AuditLog {
  logId: string;
  action: string;
  channel: string;
  target: string;
  details: string;
  riskScore: number;
  userId: string;
  timestamp: Date;
}
```

```typescript
// src/types/user.ts
export interface UserAccount {
  userId: string;
  username: string;
  employeeId: string;
  machineName: string;
  registeredAt: Date;
  status: "active" | "inactive" | "uninstalled" | "removed";
  registeredBy: string;
  department?: string;
  email?: string;
}
```

```typescript
// src/types/admin.ts

/**
 * Dashboard Admin — used to log in to the React admin dashboard.
 * Completely SEPARATE from the agent/ConfigUI admin accounts.
 * Stored in Firestore `dashboardAdmins` collection.
 */
export interface DashboardAdmin {
  dashboardAdminId: string;   // Firebase Auth UID
  username: string;           // Display name / login username
  email: string;              // Email used for Firebase Auth login
  role: "dashboard_admin";    // Always "dashboard_admin"
  createdAt: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
}

/**
 * Agent Admin — used by ConfigUI / endpoint agent software.
 * Stored in Firestore `admins` collection (created by ConfigUI).
 * Dashboard can VIEW and CHANGE these credentials but does NOT log in with them.
 */
export interface AgentAdmin {
  adminId: string;
  email: string;
  passwordHash: string;
  role: "administrator";
  createdAt: Date;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  // Agent-side fields (read-only from dashboard)
  organizationId?: string;
  machineName?: string;
}
```

```typescript
// src/types/risk-scoring-config.ts
import { TrustCategory } from "./enums";

export interface RiskScoringConfig {
  // TRS Weights
  sensitivityLevelWeight: number;   // default: 30
  destinationTrustWeight: number;   // default: 25
  uploadVolumeWeight: number;       // default: 20
  timePatternWeight: number;        // default: 15
  fileTypeWeight: number;           // default: 10
  // BRS Parameters
  initialBRS: number;               // default: 0
  maxBRS: number;                   // default: 100
  violationIncrement: number;      // default: 10
  decayRate: number;                // default: 1
  // Risk Level Thresholds
  lowRiskThreshold: number;         // default: 30
  mediumRiskThreshold: number;      // default: 60
  highRiskThreshold: number;        // default: 85
  alertThreshold: number;           // default: 70
  blockThreshold: number;           // default: 90
}

export interface DestinationTrustLevel {
  domain: string;
  category: TrustCategory;
  trustScore: number;               // 0-100
  addedAt: Date;
}
```

---

## 8. SignalR Real-Time Hub

### 7.1 Hub Server Implementation (ASP.NET Core)

The SignalR hub server receives data from endpoint agents and broadcasts to connected dashboards.

```csharp
// src/DataGuard.DashboardApi/Hubs/MonitoringHub.cs
using Microsoft.AspNetCore.SignalR;

public class MonitoringHub : Hub
{
    // ===== AGENT → HUB (received from endpoint agents) =====

    // Receives alert from endpoint agent, broadcasts to all dashboard clients
    public async Task SendAlert(object alert, string userId)
    {
        await Clients.Group("dashboard").SendAsync("ReceiveAlert", alert);
    }

    // Receives upload event from agent, broadcasts to dashboards
    public async Task SendUploadEvent(object uploadEvent)
    {
        await Clients.Group("dashboard").SendAsync("ReceiveUploadEvent", uploadEvent);
    }

    // Receives risk profile update from agent, broadcasts to dashboards
    public async Task SendRiskProfileUpdate(object profile, object brsResult)
    {
        await Clients.Group("dashboard").SendAsync("ReceiveRiskUpdate", profile, brsResult);
    }

    // Receives escalation alert from agent, broadcasts to dashboards
    public async Task SendEscalation(string userId, string username, int brs, string reason, string riskLevel)
    {
        await Clients.Group("dashboard").SendAsync("ReceiveEscalation", new {
            userId, username, brs, reason, riskLevel, timestamp = DateTime.UtcNow
        });
    }

    // Agent heartbeat — update agent status and broadcast to dashboards
    public async Task AgentHeartbeat(object heartbeat)
    {
        await Clients.Group("dashboard").SendAsync("AgentStatusUpdate", heartbeat);
    }

    // Agent registration on connect
    public async Task RegisterAgent(object agentInfo)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "agents");
        await Clients.Group("dashboard").SendAsync("AgentConnected", agentInfo);
    }

    // Ping/pong for connection health
    public async Task Pong()
    {
        // Agent responding to ping
    }

    // ===== DASHBOARD → HUB → AGENT (commands from dashboard) =====

    // Dashboard joins the "dashboard" group to receive broadcasts
    public async Task JoinDashboard()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "dashboard");
    }

    // Send command to specific agent
    public async Task SendCommandToAgent(string agentId, string commandType, string payload)
    {
        await Clients.Group($"agent_{agentId}").SendAsync("ReceiveCommand", new {
            commandType, payload, issuedBy = Context.UserIdentifier, timestamp = DateTime.UtcNow
        });
    }

    // Send policy update to all agents
    public async Task BroadcastPolicyUpdate(string policyJson)
    {
        await Clients.Group("agents").SendAsync("PolicyUpdate", policyJson);
    }

    // Ping agent for health check
    public async Task PingAgent(string agentId)
    {
        await Clients.Group($"agent_{agentId}").SendAsync("Ping");
    }
}
```

### 7.2 Hub Server Startup

```csharp
// src/DataGuard.DashboardApi/Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("DashboardPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://dashboard.dataguard.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();
app.UseCors("DashboardPolicy");
app.MapHub<MonitoringHub>("/hubs/monitoring");
app.Run();
```

### 7.3 React SignalR Client

```typescript
// src/config/signalr.ts
import * as signalR from "@microsoft/signalr";

const HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || "https://api.dataguard.com/hubs/monitoring";

export const createHubConnection = (): signalR.HubConnection => {
  return new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => localStorage.getItem("authToken") || "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Information)
    .build();
};
```

```typescript
// src/hooks/useSignalR.ts
import { useEffect, useRef, useCallback, useState } from "react";
import { createHubConnection } from "../config/signalr";
import { useAlertStore } from "../store/alert-store";
import type * as signalR from "@microsoft/signalr";

export function useSignalR() {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { addAlert, addUploadEvent, updateRiskProfile, addEscalation, updateAgentStatus } =
    useAlertStore();

  useEffect(() => {
    const connection = createHubConnection();
    connectionRef.current = connection;

    // Register dashboard event handlers
    connection.on("ReceiveAlert", (alert) => addAlert(alert));
    connection.on("ReceiveUploadEvent", (event) => addUploadEvent(event));
    connection.on("ReceiveRiskUpdate", (profile, brsResult) => updateRiskProfile(profile, brsResult));
    connection.on("ReceiveEscalation", (data) => addEscalation(data));
    connection.on("AgentStatusUpdate", (heartbeat) => updateAgentStatus(heartbeat));
    connection.on("AgentConnected", (agentInfo) => updateAgentStatus(agentInfo));

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => {
      setIsConnected(true);
      connection.invoke("JoinDashboard");
    });
    connection.onclose(() => setIsConnected(false));

    // Start connection
    connection.start().then(() => {
      setIsConnected(true);
      connection.invoke("JoinDashboard");
    });

    return () => { connection.stop(); };
  }, []);

  const sendCommand = useCallback(async (agentId: string, commandType: string, payload: string) => {
    await connectionRef.current?.invoke("SendCommandToAgent", agentId, commandType, payload);
  }, []);

  const broadcastPolicy = useCallback(async (policyJson: string) => {
    await connectionRef.current?.invoke("BroadcastPolicyUpdate", policyJson);
  }, []);

  return { isConnected, sendCommand, broadcastPolicy };
}
```

---

## 9. Agent → Dashboard Data Flow

### 8.1 Complete Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        ENDPOINT MACHINE                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │   DataGuard Endpoint Agent (Windows Service)                │    │
│  │                                                             │    │
│  │  ┌──────────────────┐  ┌──────────────────┐                │    │
│  │  │ Browser Monitor   │  │ Clipboard Monitor │                │    │
│  │  │ USB Monitor       │  │ AI App Monitor    │                │    │
│  │  │ FileSystem Monitor│  │ Network Interceptor│               │    │
│  │  └───────┬──────────┘  └────────┬──────────┘                │    │
│  │          │                       │                           │    │
│  │          ▼                       ▼                           │    │
│  │  ┌──────────────────────────────────────┐                   │    │
│  │  │         Worker.cs (Orchestrator)      │                   │    │
│  │  │  ProcessUploadEventAsync()            │                   │    │
│  │  │  → MetadataExtractor                  │                   │    │
│  │  │  → DocumentContentScanner             │                   │    │
│  │  │  → FileClassifier                     │                   │    │
│  │  │  → RiskScoreCalculator (TRS)          │                   │    │
│  │  │  → BehavioralRiskScoreService (BRS)   │                   │    │
│  │  └───────┬──────────────────┬────────────┘                   │    │
│  │          │                  │                                 │    │
│  │          ▼                  ▼                                 │    │
│  │  ┌─────────────┐  ┌──────────────────┐                      │    │
│  │  │ Firebase     │  │ SignalR Alert     │                      │    │
│  │  │ EventService │  │ Service (Client)  │                      │    │
│  │  └──────┬──────┘  └────────┬──────────┘                      │    │
│  │         │                  │                                  │    │
│  └─────────┼──────────────────┼──────────────────────────────────┘    │
│            │                  │                                       │
└────────────┼──────────────────┼──────────────────────────────────────┘
             │                  │
             ▼                  ▼
┌────────────────────┐  ┌──────────────────────────────┐
│  Firebase Firestore │  │  SignalR Hub Server            │
│  (Cloud Database)   │  │  (ASP.NET Core)                │
│                     │  │                                │
│  uploadEvents       │  │  MonitoringHub                 │
│  riskProfiles       │  │  /hubs/monitoring               │
│  alerts             │  │                                │
│  clipboardEvents    │  │  Broadcasts to dashboard       │
│  usbEvents          │  │  group members via WebSocket   │
│  auditLogs          │  │                                │
│  agents             │  └───────────┬──────────────────┘
│  admins             │              │
│  users              │              │
│  settings           │              │
└────────┬────────────┘              │
         │                           │
         ▼                           ▼
┌────────────────────────────────────────────────────────┐
│           REACT ADMIN DASHBOARD                         │
│                                                         │
│  ┌──────────────┐    ┌────────────────────────┐        │
│  │ Firebase SDK  │    │ @microsoft/signalr     │        │
│  │ (Firestore)   │    │ (WebSocket Client)     │        │
│  │               │    │                        │        │
│  │ Historical    │    │ Real-time data:         │        │
│  │ data queries  │    │ - Live alerts           │        │
│  │ - pagination  │    │ - Upload events         │        │
│  │ - filtering   │    │ - Risk updates          │        │
│  │ - search      │    │ - Escalations           │        │
│  │ - aggregation │    │ - Agent heartbeats      │        │
│  └──────┬───────┘    └────────┬───────────────┘        │
│         │                     │                         │
│         ▼                     ▼                         │
│  ┌──────────────────────────────────────────────┐      │
│  │   React State (Zustand + React Query)         │      │
│  │   → Dashboard Views                           │      │
│  │   → Charts (Recharts)                         │      │
│  │   → Tables (TanStack Table)                   │      │
│  │   → Notifications (Sonner)                    │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Dashboard can also SEND commands back to agents:       │
│  Dashboard → SignalR Hub → Agent                        │
│  Commands: scan-now, update-policy, restart              │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Data Flow Per Event Type

| Source Monitor | Data Model | Firestore Collection | SignalR Hub Method | Dashboard Handler |
|---------------|-----------|---------------------|-------------------|------------------|
| BrowserUploadMonitor | `UploadEvent` | `uploadEvents` | `SendUploadEvent` | `ReceiveUploadEvent` |
| ClipboardMonitor | `ClipboardEvent` | `clipboardEvents` | `SendAlert` | `ReceiveAlert` |
| RemovableMediaMonitor | `RemovableMediaEvent` | `usbEvents` | `SendAlert` | `ReceiveAlert` |
| AiApplicationMonitor | `AiApplicationEvent` | (via alert) | `SendAlert` | `ReceiveAlert` |
| FileSystemHookMonitor | `UploadEvent` | `uploadEvents` | `SendUploadEvent` | `ReceiveUploadEvent` |
| NetworkUploadInterceptor | `UploadEvent` | `uploadEvents` | `SendUploadEvent` | `ReceiveUploadEvent` |
| BehavioralRiskScoreService | `UserRiskProfile` | `riskProfiles` | `SendRiskProfileUpdate` | `ReceiveRiskUpdate` |
| Worker (escalation) | Escalation alert | `alerts` | `SendEscalation` | `ReceiveEscalation` |
| Worker (heartbeat) | Heartbeat data | `agents` | `AgentHeartbeat` | `AgentStatusUpdate` |

---

## 10. Authentication & Admin Password Management

> **IMPORTANT:** Dashboard admins and Agent/ConfigUI admins are **completely separate** accounts.
> They use different Firestore collections, different credentials, and different login flows.

### 10.1 Two Separate Admin Systems

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ADMIN ACCOUNT SEPARATION                               │
├─────────────────────────────────┬───────────────────────────────────────────┤
│   DASHBOARD ADMIN               │   AGENT ADMIN (ConfigUI)                 │
├─────────────────────────────────┼───────────────────────────────────────────┤
│ Purpose: Log in to React        │ Purpose: Log in to ConfigUI WPF app      │
│          admin dashboard        │          on the endpoint machine          │
│                                 │                                           │
│ Collection: `dashboardAdmins`   │ Collection: `admins`                      │
│                                 │                                           │
│ Auth: Firebase Auth             │ Auth: Firebase Auth (separate account)    │
│       (separate UID)            │       (separate UID)                      │
│                                 │                                           │
│ Created by: Dashboard setup /   │ Created by: ConfigUI first-run setup     │
│             another dashboard   │             on each endpoint machine      │
│             admin               │                                           │
│                                 │                                           │
│ Manages: Dashboard itself       │ Manages: Agent config, monitoring         │
│          + can view/change      │          toggles, scan intervals          │
│            agent admin creds    │                                           │
│                                 │                                           │
│ Login page: /login (React SPA)  │ Login page: ConfigUI MainWindow (WPF)    │
│                                 │                                           │
│ Credentials changeable from:    │ Credentials changeable from:             │
│   → Dashboard Settings page     │   → Dashboard Settings page (remote)     │
│                                 │   → ConfigUI itself (local)              │
└─────────────────────────────────┴───────────────────────────────────────────┘
```

### 10.2 Dashboard Admin Login Flow

```
User opens dashboard → LoginPage → Enter email + password
  → Firebase Auth (signInWithEmailAndPassword)
  → Verify role in `dashboardAdmins` collection (NOT `admins`)
  → Store auth token + dashboard admin profile in Zustand store
  → Redirect to DashboardPage
```

### 10.3 Dashboard Admin Authentication Service

```typescript
// src/services/auth-service.ts
import {
  signInWithEmailAndPassword, signOut, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider, updateEmail
} from "firebase/auth";
import { doc, getDoc, updateDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { sha256 } from "../utils/hash";

// Dashboard admins — separate from agent admins
const DASHBOARD_ADMIN_COLLECTION = "dashboardAdmins";
// Agent admins — managed by ConfigUI, viewable/editable from dashboard
const AGENT_ADMIN_COLLECTION = "admins";

export const authService = {
  // ═══════════════════════════════════════════════════════════
  //  DASHBOARD ADMIN AUTH (for logging into the dashboard)
  // ═══════════════════════════════════════════════════════════

  /**
   * Dashboard admin login — authenticate via Firebase Auth
   * + verify role in `dashboardAdmins` collection (NOT `admins`)
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Step 1: Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Step 2: Verify dashboard admin role — check `dashboardAdmins` NOT `admins`
      const adminDoc = await getDoc(doc(db, DASHBOARD_ADMIN_COLLECTION, uid));
      if (!adminDoc.exists() || adminDoc.data().role !== "dashboard_admin") {
        await signOut(auth);
        return {
          success: false,
          error: "This account is not a dashboard administrator. " +
                 "Agent admin accounts cannot log in to the dashboard."
        };
      }

      // Step 3: Update last login timestamp
      await updateDoc(doc(db, DASHBOARD_ADMIN_COLLECTION, uid), {
        lastLoginAt: new Date(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Dashboard admin logout
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Change dashboard admin's own password
   */
  async changeDashboardPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return { success: false, error: "No authenticated user" };
      }

      // Re-authenticate before password change (Firebase requirement)
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password in Firebase Auth
      await updatePassword(user, newPassword);

      // Update metadata in `dashboardAdmins` collection
      await updateDoc(doc(db, DASHBOARD_ADMIN_COLLECTION, user.uid), {
        passwordChangedAt: new Date(),
      });

      return { success: true };
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        return { success: false, error: "Current password is incorrect" };
      }
      return { success: false, error: error.message };
    }
  },

  /**
   * Change dashboard admin's own username/email
   */
  async changeDashboardEmail(
    currentPassword: string,
    newEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return { success: false, error: "No authenticated user" };
      }

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update email in Firebase Auth
      await updateEmail(user, newEmail);

      // Update email in `dashboardAdmins` collection
      await updateDoc(doc(db, DASHBOARD_ADMIN_COLLECTION, user.uid), {
        email: newEmail,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get current dashboard admin profile
   */
  async getDashboardAdminProfile() {
    const user = auth.currentUser;
    if (!user) return null;
    const adminDoc = await getDoc(doc(db, DASHBOARD_ADMIN_COLLECTION, user.uid));
    return adminDoc.exists() ? { uid: user.uid, ...adminDoc.data() } : null;
  },

  /**
   * Check if user is authenticated dashboard admin
   */
  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  },

  // ═══════════════════════════════════════════════════════════
  //  AGENT ADMIN CREDENTIAL MANAGEMENT (remote, from dashboard)
  // ═══════════════════════════════════════════════════════════

  /**
   * List all agent admin accounts (from `admins` collection)
   * Dashboard admin can view these but does NOT log in with them
   */
  async listAgentAdmins() {
    const snapshot = await getDocs(collection(db, AGENT_ADMIN_COLLECTION));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /**
   * Get a specific agent admin's details
   */
  async getAgentAdmin(agentAdminId: string) {
    const adminDoc = await getDoc(doc(db, AGENT_ADMIN_COLLECTION, agentAdminId));
    return adminDoc.exists() ? { id: adminDoc.id, ...adminDoc.data() } : null;
  },

  /**
   * Change an agent admin's password (remote update from dashboard)
   * This updates the password hash in Firestore `admins` collection.
   * The agent/ConfigUI reads the hash on next auth attempt.
   * NOTE: This does NOT change the Firebase Auth password for the agent admin —
   * that requires Firebase Admin SDK on the server side.
   */
  async changeAgentAdminPassword(
    agentAdminId: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const passwordHash = sha256(newPassword + "DataGuardSalt2026");
      await updateDoc(doc(db, AGENT_ADMIN_COLLECTION, agentAdminId), {
        passwordHash,
        passwordChangedAt: new Date(),
        passwordChangedBy: "dashboard",
      });

      // Also call the SignalR hub to update Firebase Auth password via Admin SDK
      // (requires server-side endpoint since client cannot change another user's password)
      // await hubConnection.invoke("UpdateAgentAdminPassword", agentAdminId, newPassword);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Change an agent admin's email/username (remote update from dashboard)
   */
  async changeAgentAdminEmail(
    agentAdminId: string,
    newEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, AGENT_ADMIN_COLLECTION, agentAdminId), {
        email: newEmail,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
```

### 10.4 Login Page Component

```tsx
// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../services/auth-service";
import { useAuthStore } from "../store/auth-store";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const result = await authService.login(data.email, data.password);
    setIsLoading(false);

    if (result.success) {
      const profile = await authService.getDashboardAdminProfile();
      setAuth({ isAuthenticated: true, admin: profile });
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">DataGuard Sentinel</h1>
          <p className="text-sm text-slate-500 mt-1">Dashboard Admin Login</p>
          <p className="text-xs text-slate-400 mt-1">
            This is the dashboard admin portal. Agent admins use ConfigUI.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700">Email</label>
              <input
                type="email"
                {...form.register("email")}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@dataguard.com"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Password</label>
              <input
                type="password"
                {...form.register("password")}
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 text-sm bg-slate-900 text-white rounded-md
                         hover:bg-slate-800 transition-colors duration-150 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### 10.5 Change Dashboard Admin Credentials UI

```tsx
// src/components/settings/DashboardCredentialsForm.tsx
// This form lets the logged-in dashboard admin change their OWN credentials.
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../../services/auth-service";
import { toast } from "sonner";

// ── Password change ──
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Email / username change ──
const emailSchema = z.object({
  currentPassword: z.string().min(1, "Password required to confirm"),
  newEmail: z.string().email("Enter a valid email"),
});

export function DashboardCredentialsForm() {
  const [isLoading, setIsLoading] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  });

  const onChangePassword = async (data: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    const result = await authService.changeDashboardPassword(data.currentPassword, data.newPassword);
    setIsLoading(false);
    if (result.success) {
      toast.success("Dashboard password changed successfully");
      passwordForm.reset();
    } else {
      toast.error(result.error || "Failed to change password");
    }
  };

  const onChangeEmail = async (data: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    const result = await authService.changeDashboardEmail(data.currentPassword, data.newEmail);
    setIsLoading(false);
    if (result.success) {
      toast.success("Dashboard email changed successfully");
      emailForm.reset();
    } else {
      toast.error(result.error || "Failed to change email");
    }
  };

  return (
    <div className="space-y-6">
      {/* Section: Change Dashboard Login Password */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-slate-900 mb-4">Change Dashboard Login Password</h3>
        <p className="text-xs text-slate-500 mb-4">
          This changes YOUR dashboard admin password. It does NOT affect agent admin accounts.
        </p>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-3 max-w-md">
          <input type="password" {...passwordForm.register("currentPassword")} placeholder="Current password"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md" />
          <input type="password" {...passwordForm.register("newPassword")} placeholder="New password"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md" />
          <input type="password" {...passwordForm.register("confirmPassword")} placeholder="Confirm new password"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md" />
          <button type="submit" disabled={isLoading}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">
            {isLoading ? "Changing..." : "Change Dashboard Password"}
          </button>
        </form>
      </div>

      {/* Section: Change Dashboard Login Email */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-slate-900 mb-4">Change Dashboard Login Email</h3>
        <form onSubmit={emailForm.handleSubmit(onChangeEmail)} className="space-y-3 max-w-md">
          <input type="password" {...emailForm.register("currentPassword")} placeholder="Current password to confirm"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md" />
          <input type="email" {...emailForm.register("newEmail")} placeholder="New email address"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md" />
          <button type="submit" disabled={isLoading}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">
            {isLoading ? "Changing..." : "Change Dashboard Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 10.6 Agent Admin Credential Management (from Dashboard)

```tsx
// src/components/settings/AgentAdminManager.tsx
// This lets the dashboard admin VIEW and CHANGE agent admin credentials remotely.
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/auth-service";
import { toast } from "sonner";
import type { AgentAdmin } from "../../types/admin";

export function AgentAdminManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Fetch all agent admin accounts
  const { data: agentAdmins = [], isLoading } = useQuery({
    queryKey: ["agentAdmins"],
    queryFn: () => authService.listAgentAdmins(),
  });

  // Change agent admin password
  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      authService.changeAgentAdminPassword(id, password),
    onSuccess: () => {
      toast.success("Agent admin password updated");
      setEditingId(null);
      setNewPassword("");
      queryClient.invalidateQueries({ queryKey: ["agentAdmins"] });
    },
    onError: () => toast.error("Failed to update agent admin password"),
  });

  // Change agent admin email
  const changeEmailMutation = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      authService.changeAgentAdminEmail(id, email),
    onSuccess: () => {
      toast.success("Agent admin email updated");
      setEditingId(null);
      setNewEmail("");
      queryClient.invalidateQueries({ queryKey: ["agentAdmins"] });
    },
    onError: () => toast.error("Failed to update agent admin email"),
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-sm font-medium text-slate-900 mb-1">
        Agent Admin Accounts (ConfigUI)
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        These are the admin credentials used by ConfigUI / endpoint agent software.
        They are separate from your dashboard login. You can change their passwords
        and emails from here.
      </p>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading agent admins...</p>
      ) : agentAdmins.length === 0 ? (
        <p className="text-sm text-slate-400">No agent admin accounts found.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider border-b">
              <th className="py-2 text-left">Email</th>
              <th className="py-2 text-left">Machine</th>
              <th className="py-2 text-left">Last Login</th>
              <th className="py-2 text-left">Password Changed</th>
              <th className="py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agentAdmins.map((admin: any) => (
              <tr key={admin.id} className="hover:bg-slate-50">
                <td className="py-3">
                  {editingId === admin.id ? (
                    <input
                      value={newEmail || admin.email}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="px-2 py-1 text-sm border rounded"
                    />
                  ) : (
                    admin.email
                  )}
                </td>
                <td className="py-3 text-slate-500">{admin.machineName || "—"}</td>
                <td className="py-3 text-slate-500">
                  {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : "Never"}
                </td>
                <td className="py-3 text-slate-500">
                  {admin.passwordChangedAt
                    ? new Date(admin.passwordChangedAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="py-3">
                  {editingId === admin.id ? (
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="px-2 py-1 text-sm border rounded w-32"
                      />
                      <button
                        onClick={() => {
                          if (newPassword) changePasswordMutation.mutate({ id: admin.id, password: newPassword });
                          if (newEmail && newEmail !== admin.email) changeEmailMutation.mutate({ id: admin.id, email: newEmail });
                        }}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                      >Save</button>
                      <button
                        onClick={() => { setEditingId(null); setNewPassword(""); setNewEmail(""); }}
                        className="px-2 py-1 text-xs bg-slate-200 rounded"
                      >Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(admin.id); setNewEmail(admin.email); }}
                      className="px-2 py-1 text-xs bg-slate-100 rounded hover:bg-slate-200"
                    >Edit Credentials</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### 10.7 Settings Page — Combined Credential Management

The Settings page contains both dashboard and agent admin credential sections:

```tsx
// src/pages/SettingsPage.tsx (credential management portion)
export function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>

      {/* ── Dashboard Admin Credentials ── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Dashboard Admin Credentials</h2>
        <p className="text-sm text-slate-500 mb-4">
          Change your dashboard login email and password. These are used to access
          this admin dashboard only.
        </p>
        <DashboardCredentialsForm />
      </div>

      <hr className="border-slate-200" />

      {/* ── Agent Admin Credentials ── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Agent Admin Credentials</h2>
        <p className="text-sm text-slate-500 mb-4">
          View and change the login credentials used by ConfigUI / endpoint agent software.
          These are completely separate from your dashboard login.
        </p>
        <AgentAdminManager />
      </div>

      <hr className="border-slate-200" />

      {/* ── Other settings (policy, org, etc.) ── */}
      {/* ... */}
    </div>
  );
}
```

### 10.8 Firestore `dashboardAdmins` Collection — Initial Setup

To create the first dashboard admin account, use the Firebase Console or a setup script:

```typescript
// scripts/create-dashboard-admin.ts (run once during initial setup)
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "../src/config/firebase";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createDashboardAdmin(email: string, password: string, username: string) {
  // Create Firebase Auth account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  // Create document in `dashboardAdmins` collection
  await setDoc(doc(db, "dashboardAdmins", uid), {
    dashboardAdminId: uid,
    username: username,
    email: email,
    role: "dashboard_admin",
    createdAt: new Date(),
  });

  console.log(`Dashboard admin created: ${email} (UID: ${uid})`);
}

// Usage:
createDashboardAdmin("dashboard@dataguard.com", "SecureP@ss2026!", "DashboardAdmin");
```

### 10.9 Protected Route Component

```typescript
// src/components/layout/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
```

### 10.10 Auth Zustand Store

```typescript
// src/store/auth-store.ts
import { create } from "zustand";
import type { DashboardAdmin } from "../types/admin";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: DashboardAdmin | null;   // Dashboard admin profile, NOT agent admin
  setAuth: (state: { isAuthenticated: boolean; admin: any }) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  admin: null,
  setAuth: ({ isAuthenticated, admin }) => set({ isAuthenticated, admin, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ isAuthenticated: false, admin: null, isLoading: false }),
}));
```

---

## 11. User Management (Add / Remove / Full List)

### 10.1 User Management Service

```typescript
// src/services/user-service.ts
import {
  collection, getDocs, doc, getDoc, deleteDoc, updateDoc, query, where, orderBy, limit, startAfter
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { UserAccount } from "../types/user";
import type { UserRiskProfile } from "../types/user-risk-profile";

const USERS_COLLECTION = "users";
const RISK_PROFILES_COLLECTION = "riskProfiles";
const UPLOAD_EVENTS_COLLECTION = "uploadEvents";
const CLIPBOARD_EVENTS_COLLECTION = "clipboardEvents";
const USB_EVENTS_COLLECTION = "usbEvents";
const ALERTS_COLLECTION = "alerts";
const AGENTS_COLLECTION = "agents";

export const userService = {
  /**
   * Get full list of all registered users with pagination
   */
  async getAllUsers(pageSize = 50, lastDoc?: any): Promise<{
    users: UserAccount[];
    lastDoc: any;
    hasMore: boolean;
  }> {
    let q = query(
      collection(db, USERS_COLLECTION),
      orderBy("registeredAt", "desc"),
      limit(pageSize + 1)
    );
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    const snapshot = await getDocs(q);
    const users = snapshot.docs.slice(0, pageSize).map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    })) as UserAccount[];

    return {
      users,
      lastDoc: snapshot.docs[pageSize - 1],
      hasMore: snapshot.docs.length > pageSize,
    };
  },

  /**
   * Search users by name, employeeId, or machineName
   */
  async searchUsers(searchTerm: string): Promise<UserAccount[]> {
    // Firestore doesn't support full-text search natively,
    // so we do a prefix match on employeeId or fetch all and filter client-side
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    const term = searchTerm.toLowerCase();
    return snapshot.docs
      .map((doc) => ({ userId: doc.id, ...doc.data() } as UserAccount))
      .filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.employeeId.toLowerCase().includes(term) ||
          user.machineName.toLowerCase().includes(term)
      );
  },

  /**
   * Get single user details
   */
  async getUserById(userId: string): Promise<UserAccount | null> {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
    return docSnap.exists() ? ({ userId: docSnap.id, ...docSnap.data() } as UserAccount) : null;
  },

  /**
   * Get user's risk profile
   */
  async getUserRiskProfile(userId: string): Promise<UserRiskProfile | null> {
    const docSnap = await getDoc(doc(db, RISK_PROFILES_COLLECTION, userId));
    return docSnap.exists() ? (docSnap.data() as UserRiskProfile) : null;
  },

  /**
   * Remove user and ALL associated data
   * Called when admin removes a user after agent uninstall
   */
  async removeUser(userId: string): Promise<{ success: boolean; error?: string; deletedCounts: Record<string, number> }> {
    try {
      const deletedCounts: Record<string, number> = {};

      // 1. Delete user document from `users` collection
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
      deletedCounts.users = 1;

      // 2. Delete user's risk profile from `riskProfiles` collection
      const riskProfileDoc = doc(db, RISK_PROFILES_COLLECTION, userId);
      const riskSnap = await getDoc(riskProfileDoc);
      if (riskSnap.exists()) {
        await deleteDoc(riskProfileDoc);
        deletedCounts.riskProfiles = 1;
      }

      // 3. Delete user's upload events from `uploadEvents` collection
      const uploadQuery = query(collection(db, UPLOAD_EVENTS_COLLECTION), where("employeeId", "==", userId));
      const uploadSnap = await getDocs(uploadQuery);
      for (const d of uploadSnap.docs) { await deleteDoc(d.ref); }
      deletedCounts.uploadEvents = uploadSnap.size;

      // 4. Delete user's clipboard events from `clipboardEvents` collection
      const clipboardQuery = query(collection(db, CLIPBOARD_EVENTS_COLLECTION), where("employeeId", "==", userId));
      const clipboardSnap = await getDocs(clipboardQuery);
      for (const d of clipboardSnap.docs) { await deleteDoc(d.ref); }
      deletedCounts.clipboardEvents = clipboardSnap.size;

      // 5. Delete user's USB events from `usbEvents` collection
      const usbQuery = query(collection(db, USB_EVENTS_COLLECTION), where("employeeId", "==", userId));
      const usbSnap = await getDocs(usbQuery);
      for (const d of usbSnap.docs) { await deleteDoc(d.ref); }
      deletedCounts.usbEvents = usbSnap.size;

      // 6. Delete user's alerts from `alerts` collection
      const alertQuery = query(collection(db, ALERTS_COLLECTION), where("userId", "==", userId));
      const alertSnap = await getDocs(alertQuery);
      for (const d of alertSnap.docs) { await deleteDoc(d.ref); }
      deletedCounts.alerts = alertSnap.size;

      // 7. Delete user's agent record from `agents` collection
      const agentQuery = query(collection(db, AGENTS_COLLECTION), where("currentUserId", "==", userId));
      const agentSnap = await getDocs(agentQuery);
      for (const d of agentSnap.docs) { await deleteDoc(d.ref); }
      deletedCounts.agents = agentSnap.size;

      // NOTE: auditLogs are NOT deleted — they are immutable by design

      return { success: true, deletedCounts };
    } catch (error: any) {
      return { success: false, error: error.message, deletedCounts: {} };
    }
  },

  /**
   * Mark user as inactive/uninstalled (soft delete — keeps data for investigation)
   */
  async markUserAsUninstalled(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, USERS_COLLECTION, userId), {
        status: "uninstalled",
        uninstalledAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user count stats for dashboard
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    uninstalled: number;
  }> {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users = snapshot.docs.map((d) => d.data());
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      inactive: users.filter((u) => u.status === "inactive").length,
      uninstalled: users.filter((u) => u.status === "uninstalled" || u.status === "removed").length,
    };
  },
};
```

### 10.2 User List Page

```typescript
// src/pages/UsersPage.tsx — Full user list with search, filter, and remove
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user-service";
import { UserTable } from "../components/users/UserTable";
import { RemoveUserDialog } from "../components/users/RemoveUserDialog";
import { toast } from "sonner";
// Search bar, filter dropdowns, export button

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAllUsers(),
  });

  // Remove user mutation
  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => userService.removeUser(userId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("User and all associated data removed successfully", {
          description: `Deleted: ${JSON.stringify(result.deletedCounts)}`,
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error("Failed to remove user: " + result.error);
      }
      setUserToRemove(null);
    },
  });

  // Mark as uninstalled mutation (soft delete)
  const markUninstalledMutation = useMutation({
    mutationFn: (userId: string) => userService.markUserAsUninstalled(userId),
    onSuccess: () => {
      toast.success("User marked as uninstalled");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Filter users
  const filteredUsers = usersData?.users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.machineName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h1>User Management</h1>

      {/* Search & Filters */}
      <div>
        <input
          placeholder="Search by name, employee ID, or machine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="uninstalled">Uninstalled</option>
        </select>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers || []}
        isLoading={isLoading}
        onViewUser={(userId) => { /* navigate to user detail */ }}
        onMarkUninstalled={(userId) => markUninstalledMutation.mutate(userId)}
        onRemoveUser={(userId) => setUserToRemove(userId)}
      />

      {/* Remove User Confirmation Dialog */}
      <RemoveUserDialog
        isOpen={!!userToRemove}
        userId={userToRemove}
        onConfirm={() => userToRemove && removeUserMutation.mutate(userToRemove)}
        onCancel={() => setUserToRemove(null)}
        isLoading={removeUserMutation.isPending}
      />
    </div>
  );
}
```

### 10.3 Remove User Confirmation Dialog

```typescript
// src/components/users/RemoveUserDialog.tsx
export function RemoveUserDialog({
  isOpen, userId, onConfirm, onCancel, isLoading,
}: {
  isOpen: boolean;
  userId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    // Dialog (shadcn/ui)
    // Title: "Remove User Permanently"
    // Warning: "This action will permanently delete all data for this user including:
    //   - User account record
    //   - Risk profile and behavioral score
    //   - All upload events
    //   - All clipboard events
    //   - All USB events
    //   - All associated alerts
    //   - Agent registration
    //   NOTE: Audit logs are preserved (immutable) for compliance."
    // Buttons: [Cancel] [Remove User — destructive red button]
  );
}
```

### 10.4 User Table Columns

The user list table displays:

| Column | Field | Sortable | Filterable |
|--------|-------|----------|-----------|
| Username | `username` | Yes | Yes (search) |
| Employee ID | `employeeId` | Yes | Yes (search) |
| Machine Name | `machineName` | Yes | Yes (search) |
| Status | `status` | Yes | Yes (dropdown: active/inactive/uninstalled) |
| Risk Level | `currentRiskLevel` (from riskProfiles) | Yes | Yes (dropdown) |
| BRS Score | `behavioralRiskScore` (from riskProfiles) | Yes | No |
| Total Uploads | `totalUploads` (from riskProfiles) | Yes | No |
| Blocked Uploads | `blockedUploads` (from riskProfiles) | Yes | No |
| Registered At | `registeredAt` | Yes | Yes (date range) |
| Last Activity | `lastUploadTime` (from riskProfiles) | Yes | No |
| Actions | — | No | No |

**Actions column buttons:**
- 👁 **View** — Navigate to user detail page
- ⚠️ **Mark Uninstalled** — Soft delete (keeps data, changes status)
- 🗑 **Remove** — Hard delete (removes all user data, confirmation required)

---

## 12. Dashboard Pages & Features

### 11.1 Main Dashboard (`DashboardPage.tsx`)

**Purpose:** Real-time organizational overview for security analysts

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: DataGuard Sentinel | [Connected ●] | [Notifications] │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                      │
│  SIDEBAR │  KPI STAT CARDS                                      │
│          │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐           │
│  Dashboard│  │Total  │ │Active │ │Critical│ │Blocked│           │
│  Alerts   │  │Events │ │Agents │ │Alerts  │ │Uploads│           │
│  Uploads  │  │ 1,247 │ │   12  │ │    8   │ │   34  │           │
│  Clipboard│  └───────┘ └───────┘ └───────┘ └───────┘           │
│  USB      │                                                      │
│  AI Apps  │  ┌─────────────────┐  ┌─────────────────┐          │
│  Users    │  │  LIVE ALERT FEED │  │  TOP RISK USERS  │          │
│  Agents   │  │  (SignalR live)  │  │  1. John — 92 🔴 │          │
│  Audit Log│  │  ● CRITICAL:... │  │  2. Sara — 78 🟠 │          │
│  Analytics│  │  ● WARNING:...  │  │  3. Mike — 65 🟡 │          │
│  Policy   │  │  ● BLOCK:...   │  │  4. Alex — 45 🟡 │          │
│  Settings │  └─────────────────┘  └─────────────────┘          │
│           │                                                      │
│           │  ┌─────────────────┐  ┌─────────────────┐          │
│           │  │ UPLOAD CHANNELS  │  │ RISK DISTRIBUTION│          │
│           │  │ (Pie Chart)      │  │ (Bar Chart)      │          │
│           │  │ Browser: 45%    │  │ Low: 60%         │          │
│           │  │ USB: 20%        │  │ Medium: 25%      │          │
│           │  │ Clipboard: 15%  │  │ High: 10%        │          │
│           │  │ AI Apps: 12%    │  │ Critical: 5%     │          │
│           │  │ Other: 8%       │  │                   │          │
│           │  └─────────────────┘  └─────────────────┘          │
│           │                                                      │
│           │  ┌──────────────────────────────────────┐           │
│           │  │  UPLOAD VOLUME TREND (Line Chart)     │           │
│           │  │  Last 7 days / 30 days / 90 days      │           │
│           │  └──────────────────────────────────────┘           │
│           │                                                      │
│           │  ┌──────────────────────────────────────┐           │
│           │  │  AGENT STATUS GRID                     │           │
│           │  │  [Machine1 🟢] [Machine2 🟢]          │           │
│           │  │  [Machine3 🔴] [Machine4 🟡]          │           │
│           │  └──────────────────────────────────────┘           │
└──────────┴──────────────────────────────────────────────────────┘
```

**KPI Stat Cards:**
- Total upload events (today / all-time)
- Active agents (online count / total)
- Critical alerts (unresolved count)
- Blocked uploads (today / all-time)
- High-risk users (BRS ≥ 60)
- Average TRS score

### 11.2 Alerts Page (`AlertsPage.tsx`)

**Features:**
- Real-time alert feed (new alerts appear at top via SignalR)
- Filter by: alert type (Info/Warning/Block/Critical), channel (Browser/Clipboard/USB/AI/etc.), date range, resolved/unresolved
- Sort by: timestamp, risk score, severity
- Alert detail drawer (slide-out panel with full details)
- Actions: Mark as read, Resolve alert, Add investigation notes
- Escalation alerts highlighted with special badge
- Bulk actions: resolve multiple, export selected

### 11.3 Upload Events Page (`UploadEventsPage.tsx`)

**Features:**
- Paginated table of all upload events from `uploadEvents` collection
- Columns: Timestamp, User, File Name, Channel, Destination, Sensitivity, TRS, Blocked
- Filters: channel, sensitivity level, risk score range, blocked/allowed, date range
- Click row → Event Detail Modal showing:
  - Full file metadata (hash, size, extension, category)
  - TRS breakdown (Sensitivity 40% + Destination 25% + Size 15% + Time 10% + Type 10%)
  - Matched confidential patterns
  - Block reason (if blocked)
  - User risk profile summary

### 11.4 Clipboard Events Page (`ClipboardEventsPage.tsx`)

**Features:**
- Table of clipboard DLP events from `clipboardEvents` collection
- Columns: Timestamp, User, Source Process, Content Length, Sensitive Data, AI Target, Risk Score
- Highlight events targeting AI apps (ChatGPT, Copilot, Claude, etc.)
- Show matched sensitive patterns (credit cards, SSN, API keys, etc.)
- Filter by: contains sensitive data (yes/no), AI targeting (yes/no), risk score range

### 11.5 USB Events Page (`UsbEventsPage.tsx`)

**Features:**
- Table of USB/removable media events from `usbEvents` collection
- Columns: Timestamp, User, Drive, Volume Label, File, Size, Sensitivity, Blocked
- Filter by: blocked/allowed, sensitivity level, drive letter
- Show block reasons for blocked transfers

### 11.6 AI Events Page (`AiEventsPage.tsx`)

**Features:**
- Table of AI application detection events
- Columns: Timestamp, User, Event Type, Application, Process, Domain, Risk Score, Blocked
- Event types: Process Detected, Network Connection, Clipboard Paste, Active Window, Data Transmission, File Access
- Highlight paste-to-AI events with content preview
- Filter by: event type, application name, blocked/allowed

### 11.7 User Detail Page (`UserDetailPage.tsx`)

**Features:**
- User profile header: name, employee ID, machine, department, status, registration date
- Risk score dashboard:
  - BRS gauge (0-100) with color coding
  - BRS trend chart over time
  - Current risk level badge (Low/Medium/High/Critical)
- Activity statistics:
  - Total uploads, blocked uploads, high-risk uploads
  - Upload channel breakdown (pie chart)
  - Upload volume over time (line chart)
- Violation timeline:
  - Chronological list of all violations
  - Each violation: type, description, timestamp, risk impact
  - Violation type icons & colors
- Recent events:
  - Last 50 upload events
  - Last 20 clipboard events
  - Last 20 USB events
- Agent status:
  - Connected agent info, last heartbeat, scan count
- Actions:
  - Mark as uninstalled (soft delete)
  - Remove user (hard delete with confirmation)
  - Send command to user's agent

### 11.8 Agents Page (`AgentsPage.tsx`)

**Features:**
- Grid/table of all registered endpoint agents from `agents` collection
- Columns: Machine Name, Agent ID, Status, Current User, Last Heartbeat, Scan Count
- Status indicators:
  - 🟢 Online — heartbeat within last 60 seconds
  - 🟡 Warning — heartbeat 1-5 minutes ago
  - 🔴 Offline — heartbeat > 5 minutes ago
- Actions: Ping agent, Send scan-now command, send policy update
- Auto-refresh every 30 seconds

### 11.9 Audit Log Page (`AuditLogPage.tsx`)

**Features:**
- Read-only immutable audit trail from `auditLogs` collection
- Columns: Timestamp, Action, Channel, Target, Details, Risk Score, User
- Filter by: action type, channel, date range, user
- Cannot edit or delete (enforced by Firestore rules + UI)
- Export to CSV/PDF

### 11.10 Risk Analytics Page (`RiskAnalyticsPage.tsx`)

**Features:**
- **Upload Volume Trends** — Line chart: uploads per day/week/month
- **Channel Breakdown** — Pie chart: Browser vs USB vs Clipboard vs AI vs Email vs FTP
- **Sensitivity Distribution** — Bar chart: Public vs Internal vs Confidential vs Restricted
- **TRS Distribution** — Histogram: risk score distribution across all events
- **BRS Distribution** — Histogram: behavioral risk scores across all users
- **Time Heatmap** — When uploads happen (hour of day vs day of week)
- **Top Destinations** — Bar chart: most common upload destinations
- **Top File Types** — Bar chart: most common file categories
- **Risk Escalation Timeline** — Timeline of escalation events
- **Department Risk Comparison** — Bar chart: average BRS per department

### 11.11 Policy Page (`PolicyPage.tsx`)

**Features:**
- **Destination Trust Management** — CRUD for trusted/suspicious/blacklisted domains
  - Domain, Trust Category (Trusted/Known/Unknown/Suspicious/Blacklisted), Trust Score (0-100)
  - Push updates to agents via SignalR `BroadcastPolicyUpdate`
- **Risk Threshold Configuration** — Edit TRS/BRS thresholds
  - Alert threshold (default: 70)
  - Block threshold (default: 90)
  - Risk level boundaries
- **Monitoring Feature Toggles** — Enable/disable per agent:
  - Browser monitoring, Clipboard, USB, File System, AI Apps, Cloud Sync, FTP, Email
- **Sensitivity Keywords** — Manage confidential keyword lists

### 11.12 Settings Page (`SettingsPage.tsx`)

**Features:**
- **Admin Profile** — View admin email, role, last login
- **Change Admin Password** — Current password + new password form with validation
- **Dashboard Preferences** — Theme, refresh interval, notification sound, auto-acknowledge
- **Firebase Configuration** — View project ID, connection status
- **SignalR Connection** — View hub URL, connection status, reconnection history
- **About** — Version info, documentation links

---

## 13. Component Architecture

### 12.1 Reusable Data Table

All event tables use a shared `DataTable` component built with TanStack Table:

```typescript
// src/components/common/DataTable.tsx
// Features:
// - Column sorting (multi-column)
// - Column filtering (per-column search/dropdown)
// - Global search
// - Pagination (page size: 10/25/50/100)
// - Column visibility toggle
// - Row selection (for bulk actions)
// - Column resizing
// - Export selection to CSV
// - Responsive (stacks on mobile)
```

### 12.2 Sensitivity Badge

```typescript
// Color mapping for file sensitivity levels
const sensitivityColors = {
  Public: "bg-green-100 text-green-800",      // Green
  Internal: "bg-blue-100 text-blue-800",       // Blue
  Confidential: "bg-orange-100 text-orange-800", // Orange
  Restricted: "bg-red-100 text-red-800",       // Red
};
```

### 12.3 Risk Level Badge

```typescript
// Color mapping for risk levels
const riskColors = {
  Low: "bg-green-100 text-green-800",       // 0-30: Green
  Medium: "bg-yellow-100 text-yellow-800",  // 31-60: Yellow
  High: "bg-orange-100 text-orange-800",    // 61-80: Orange
  Critical: "bg-red-100 text-red-800",      // 81-100: Red
};
```

---

## 14. API Endpoints (SignalR Hub Server)

### 13.1 REST API Endpoints

The hub server also exposes REST endpoints for dashboard data access:

| Method | Endpoint | Purpose |
|--------|---------|---------|
| `POST` | `/api/auth/login` | Admin login |
| `POST` | `/api/auth/change-password` | Change admin password |
| `GET` | `/api/auth/profile` | Get admin profile |
| `GET` | `/api/users` | Get all users (paginated) |
| `GET` | `/api/users/{id}` | Get user by ID |
| `DELETE` | `/api/users/{id}` | Remove user and all data |
| `PATCH` | `/api/users/{id}/status` | Update user status |
| `GET` | `/api/users/{id}/risk-profile` | Get user risk profile |
| `GET` | `/api/events/uploads` | Get upload events (paginated, filtered) |
| `GET` | `/api/events/clipboard` | Get clipboard events |
| `GET` | `/api/events/usb` | Get USB events |
| `GET` | `/api/events/ai` | Get AI application events |
| `GET` | `/api/alerts` | Get alerts (paginated, filtered) |
| `PATCH` | `/api/alerts/{id}/resolve` | Resolve an alert |
| `PATCH` | `/api/alerts/{id}/notes` | Add investigation notes |
| `GET` | `/api/agents` | Get all agents |
| `POST` | `/api/agents/{id}/command` | Send command to agent |
| `GET` | `/api/audit-logs` | Get audit logs (paginated) |
| `GET` | `/api/analytics/overview` | Dashboard KPI stats |
| `GET` | `/api/analytics/trends` | Upload volume trends |
| `GET` | `/api/analytics/channels` | Channel breakdown |
| `GET` | `/api/analytics/risk-distribution` | Risk level distribution |
| `GET` | `/api/settings` | Get monitoring settings |
| `PUT` | `/api/settings` | Update monitoring settings |
| `GET` | `/api/settings/destinations` | Get destination trust list |
| `POST` | `/api/settings/destinations` | Add trusted/blocked domain |
| `DELETE` | `/api/settings/destinations/{domain}` | Remove domain |

### 13.2 SignalR Hub Methods

**Agent → Hub (from endpoint agents):**

| Hub Method | Payload | Broadcasts To |
|-----------|---------|--------------|
| `SendAlert` | `DlpAlert` + `userId` | `dashboard` group → `ReceiveAlert` |
| `SendUploadEvent` | `UploadEvent` | `dashboard` → `ReceiveUploadEvent` |
| `SendRiskProfileUpdate` | `UserRiskProfile` + `BrsUpdateResult` | `dashboard` → `ReceiveRiskUpdate` |
| `SendEscalation` | `userId, username, brs, reason, riskLevel` | `dashboard` → `ReceiveEscalation` |
| `AgentHeartbeat` | heartbeat object | `dashboard` → `AgentStatusUpdate` |
| `RegisterAgent` | agent info | `dashboard` → `AgentConnected` |

**Dashboard → Hub → Agent (commands):**

| Hub Method | Payload | Broadcasts To |
|-----------|---------|--------------|
| `JoinDashboard` | — | Adds connection to `dashboard` group |
| `SendCommandToAgent` | `agentId, commandType, payload` | `agent_{agentId}` → `ReceiveCommand` |
| `BroadcastPolicyUpdate` | policy JSON | `agents` group → `PolicyUpdate` |
| `PingAgent` | `agentId` | `agent_{agentId}` → `Ping` |

---

## 15. State Management

### 14.1 Zustand Auth Store

```typescript
// src/store/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: { uid: string; email: string; role: string } | null;
  login: (admin: any) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: true,
      admin: null,
      login: (admin) => set({ isAuthenticated: true, admin, isLoading: false }),
      logout: () => set({ isAuthenticated: false, admin: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "dataguard-auth" }
  )
);
```

### 14.2 Zustand Alert Store (Real-Time)

```typescript
// src/store/alert-store.ts
import { create } from "zustand";
import type { DlpAlert } from "../types/dlp-alert";
import type { UploadEvent } from "../types/upload-event";

interface AlertState {
  liveAlerts: DlpAlert[];
  liveUploadEvents: UploadEvent[];
  unreadCount: number;
  addAlert: (alert: DlpAlert) => void;
  addUploadEvent: (event: UploadEvent) => void;
  updateRiskProfile: (profile: any, brsResult: any) => void;
  addEscalation: (data: any) => void;
  updateAgentStatus: (heartbeat: any) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  liveAlerts: [],
  liveUploadEvents: [],
  unreadCount: 0,
  addAlert: (alert) =>
    set((state) => ({
      liveAlerts: [alert, ...state.liveAlerts].slice(0, 100),
      unreadCount: state.unreadCount + 1,
    })),
  addUploadEvent: (event) =>
    set((state) => ({
      liveUploadEvents: [event, ...state.liveUploadEvents].slice(0, 100),
    })),
  updateRiskProfile: () => {},
  addEscalation: (data) =>
    set((state) => ({
      liveAlerts: [{ ...data, type: "Critical", isEscalation: true }, ...state.liveAlerts],
      unreadCount: state.unreadCount + 1,
    })),
  updateAgentStatus: () => {},
  clearAlerts: () => set({ liveAlerts: [], unreadCount: 0 }),
}));
```

### 14.3 React Query for Server State

```typescript
// All Firestore data fetching uses React Query for:
// - Automatic caching
// - Background refetching
// - Pagination support
// - Optimistic updates
// - Stale-while-revalidate pattern
// - Query invalidation after mutations

// Example: Upload events query
const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["uploadEvents", filters],
  queryFn: ({ pageParam }) => eventService.getUploadEvents(filters, pageParam),
  getNextPageParam: (lastPage) => lastPage.lastDoc,
});
```

---

## 16. Charts, Pie Charts & Bar Charts — Full Analytics

### 16.1 Chart Components Summary

| # | Chart | Component | Data Source | Chart Type | Where Used |
|---|-------|----------|------------|------------|------------|
| 1 | Upload volume trend | `UploadTrendChart` | `uploadEvents` aggregated by day | **Area / Line** | Dashboard, Analytics |
| 2 | Channel breakdown | `ChannelPieChart` | `uploadEvents` grouped by channel | **Pie / Donut** | Dashboard, Analytics, User Detail |
| 3 | Sensitivity distribution | `SensitivityBarChart` | `uploadEvents` grouped by sensitivity | **Horizontal Bar** | Dashboard, Analytics |
| 4 | Risk level distribution | `RiskDistributionChart` | `riskProfiles` grouped by risk level | **Bar** | Dashboard, Analytics |
| 5 | TRS score histogram | `TrsHistogram` | `uploadEvents` TRS in bins (0-10, 10-20, ...) | **Bar** | Analytics |
| 6 | BRS score histogram | `BrsHistogram` | `riskProfiles` BRS in bins | **Bar** | Analytics |
| 7 | Upload time heatmap | `TimeHeatmap` | `uploadEvents` (hour × day-of-week) | **Heatmap grid** | Analytics |
| 8 | BRS trend per user | `BrsTrendChart` | `riskProfiles` violation history | **Line** | User Detail |
| 9 | TRS component breakdown | `TrsBreakdownRadar` | Single `UploadEvent` TRS weights | **Radar** | Event Detail Modal |
| 10 | Department risk comparison | `DeptRiskBarChart` | `riskProfiles` avg BRS per dept | **Bar** | Analytics |
| 11 | Top destinations | `TopDestinationsChart` | `uploadEvents` grouped by domain | **Horizontal Bar** | Analytics |
| 12 | Top file types | `FileTypePieChart` | `uploadEvents` grouped by category | **Pie** | Analytics |
| 13 | Blocked vs allowed | `BlockedAllowedChart` | `uploadEvents` blocked/allowed counts | **Donut** | Dashboard |
| 14 | Alert severity breakdown | `AlertSeverityChart` | `alerts` grouped by type | **Pie** | Analytics |
| 15 | Agent status overview | `AgentStatusDonut` | `agents` online/offline/warning | **Donut** | Dashboard, Agents |
| 16 | Monthly comparison | `MonthlyComparisonChart` | `uploadEvents` month-over-month | **Grouped Bar** | Reports |
| 17 | Escalation timeline | `EscalationTimeline` | `alerts` where isEscalation=true | **Line (scatter)** | Analytics |

### 16.2 Chart Design Guidelines

| Rule | Specification |
|------|---------------|
| Border radius | `rounded-lg` on chart container card only; chart content fills full area |
| Background | White card (`bg-white border border-slate-200`) |
| Padding | 20px inside card, 0px inside chart area |
| Min height | 280px for standard charts, 200px for small dashboard charts |
| Colors | Use semantic color palette (see 4.2); never random colors |
| Legend | Below chart, horizontal, `text-xs`, max 6 items before truncating |
| Tooltip | Simple white card with `shadow-lg rounded-md`, shows exact value + label |
| Axis labels | `text-xs text-slate-500`, no axis title unless ambiguous |
| Grid lines | Light horizontal only (`stroke: #e2e8f0`), no vertical grid |
| Animation | **None** — `isAnimationActive={false}` on all Recharts components |
| Responsive | `<ResponsiveContainer width="100%" height={280}>` |
| Empty state | Gray dashed border box with "No data for selected period" |

### 16.3 Pie Charts — Implementation

#### 16.3.1 Channel Breakdown Pie Chart

Shows the distribution of upload events across monitoring channels.

```tsx
// src/components/charts/ChannelPieChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CHANNEL_COLORS } from "../../utils/risk-colors";

interface ChannelData {
  name: string;
  value: number;
  percentage: number;
}

interface Props {
  data: ChannelData[];
  height?: number;
}

export function ChannelPieChart({ data, height = 280 }: Props) {
  const COLORS: Record<string, string> = {
    Browser: "#3b82f6",
    Clipboard: "#8b5cf6",
    USB: "#f97316",
    AiApplication: "#ef4444",
    FileSystem: "#6b7280",
    Email: "#14b8a6",
    FTP: "#eab308",
    CloudSync: "#06b6d4",
  };

  const renderLabel = ({ name, percentage }: any) =>
    percentage > 5 ? `${percentage}%` : "";

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Upload Channels</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={renderLabel}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "13px",
            }}
            formatter={(value: number, name: string) => [`${value} events`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Sample data structure:**
```typescript
const channelData: ChannelData[] = [
  { name: "Browser",       value: 523, percentage: 45 },
  { name: "USB",           value: 232, percentage: 20 },
  { name: "Clipboard",     value: 174, percentage: 15 },
  { name: "AiApplication", value: 139, percentage: 12 },
  { name: "FileSystem",    value: 58,  percentage: 5 },
  { name: "CloudSync",     value: 35,  percentage: 3 },
];
```

#### 16.3.2 File Type Pie Chart

```tsx
// src/components/charts/FileTypePieChart.tsx
// Same structure as ChannelPieChart but with FileCategory data:
// Document, Spreadsheet, Archive, Code, Database, Image, Video, Other
// Colors:
const FILE_TYPE_COLORS = {
  Document: "#3b82f6",    // Blue
  Spreadsheet: "#22c55e", // Green
  Archive: "#f97316",     // Orange
  Code: "#6366f1",        // Indigo
  Database: "#ef4444",    // Red
  Image: "#ec4899",       // Pink
  Video: "#8b5cf6",       // Purple
  Other: "#94a3b8",       // Gray
};
```

#### 16.3.3 Alert Severity Pie Chart

```tsx
// src/components/charts/AlertSeverityChart.tsx
// Donut chart showing alerts by severity: Info, Warning, Block, Critical
const ALERT_SEVERITY_COLORS = {
  Info: "#3b82f6",
  Warning: "#eab308",
  Block: "#f97316",
  Critical: "#ef4444",
};
```

#### 16.3.4 Blocked vs Allowed Donut Chart

```tsx
// src/components/charts/BlockedAllowedChart.tsx
// Simple donut: Blocked (red) vs Allowed (green)
// Center label showing block rate: "12% blocked"
const data = [
  { name: "Allowed", value: 1100, color: "#22c55e" },
  { name: "Blocked", value: 147,  color: "#ef4444" },
];
```

#### 16.3.5 Agent Status Donut

```tsx
// src/components/charts/AgentStatusDonut.tsx
// Small donut chart: Online (green), Warning (yellow), Offline (red)
const data = [
  { name: "Online",  value: 10, color: "#22c55e" },
  { name: "Warning", value: 2,  color: "#eab308" },
  { name: "Offline", value: 1,  color: "#ef4444" },
];
```

### 16.4 Bar Charts — Implementation

#### 16.4.1 Risk Level Distribution Bar Chart

```tsx
// src/components/charts/RiskDistributionChart.tsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface Props {
  data: { level: string; count: number; color: string }[];
}

export function RiskDistributionChart({ data }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Risk Level Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={48}>
          <XAxis
            dataKey="level"
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            gridLine={{ stroke: "#e2e8f0" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Sample data:**
```typescript
const riskDistribution = [
  { level: "Low",      count: 487, color: "#22c55e" },
  { level: "Medium",   count: 312, color: "#eab308" },
  { level: "High",     count: 134, color: "#f97316" },
  { level: "Critical", count: 67,  color: "#ef4444" },
];
```

#### 16.4.2 Sensitivity Distribution — Horizontal Bar Chart

```tsx
// src/components/charts/SensitivityBarChart.tsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const SENS_COLORS: Record<string, string> = {
  Public: "#22c55e",
  Internal: "#3b82f6",
  Confidential: "#f97316",
  Restricted: "#ef4444",
};

export function SensitivityBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Sensitivity Classification</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={24}>
          <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={SENS_COLORS[entry.name] || "#94a3b8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### 16.4.3 Top Destinations — Horizontal Bar

```tsx
// src/components/charts/TopDestinationsChart.tsx
// Horizontal bar chart showing top 10 upload destination domains
// Data: [{ domain: "drive.google.com", count: 89 }, ...]
// All bars same color: brand-primary (#3b82f6)
// Sorted descending by count
```

#### 16.4.4 Department Risk Comparison — Grouped Bar

```tsx
// src/components/charts/DeptRiskBarChart.tsx
// Vertical bar chart — one bar per department
// Y-axis: Average BRS (0-100)
// X-axis: Department names
// Bar color based on risk level of the average score
// Data: [{ dept: "Engineering", avgBrs: 35 }, { dept: "Sales", avgBrs: 62 }, ...]
```

#### 16.4.5 TRS Score Histogram

```tsx
// src/components/charts/TrsHistogram.tsx
// Bar chart with 10 bins: 0-10, 11-20, ..., 91-100
// Y-axis: event count per bin
// X-axis: score range labels
// Colors: gradient from green (low scores) to red (high scores)
const BIN_COLORS = [
  "#22c55e", "#4ade80", "#86efac", // 0-30: greens
  "#fde047", "#facc15", "#eab308", // 31-60: yellows
  "#fb923c", "#f97316",             // 61-80: oranges
  "#f87171", "#ef4444",             // 81-100: reds
];
```

#### 16.4.6 Monthly Comparison — Grouped Bar

```tsx
// src/components/charts/MonthlyComparisonChart.tsx
// Two adjacent bars per month: Current month (blue) vs Previous month (slate-300)
// X-axis: week or date range
// Y-axis: event count
// Used in the Reports page for month-over-month analysis
```

### 16.5 Line / Area Charts — Implementation

#### 16.5.1 Upload Volume Trend — Area Chart

```tsx
// src/components/charts/UploadTrendChart.tsx
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";

interface TrendData {
  date: string;      // "2026-02-20"
  total: number;
  blocked: number;
}

interface Props {
  data: TrendData[];
  period: "7d" | "30d" | "90d";
  onPeriodChange: (p: "7d" | "30d" | "90d") => void;
}

export function UploadTrendChart({ data, period, onPeriodChange }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-900">Upload Volume</h3>
        <div className="flex gap-1">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors duration-150 ${
                period === p
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
            tickFormatter={(d) => format(new Date(d), "MMM d")}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "13px",
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#totalGrad)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="blocked"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#blockedGrad)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### 16.5.2 BRS Trend Line Chart (Per-User)

```tsx
// src/components/charts/BrsTrendChart.tsx
// Line chart on UserDetailPage showing BRS score over time
// X-axis: dates (from violation history timestamps)
// Y-axis: BRS score (0-100)
// Single line, colored by risk zones:
//   - Green zone (0-30), Yellow zone (30-60), Orange zone (60-85), Red zone (85-100)
//   shown as horizontal background bands
// Data source: user's ViolationHistory mapped to cumulative BRS
```

#### 16.5.3 Escalation Timeline

```tsx
// src/components/charts/EscalationTimeline.tsx
// Scatter plot overlaid on line chart
// X-axis: dates
// Y-axis: BRS at escalation time
// Each dot = one escalation event, size proportional to violation count
// Color: red for critical, orange for high
// Hover shows: username, BRS, reason, timestamp
```

### 16.6 Radar Chart — TRS Breakdown

```tsx
// src/components/charts/TrsBreakdownRadar.tsx
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

// Shows the 5 weighted components of a Transaction Risk Score:
// Sensitivity (40%), Destination Trust (25%), File Size (15%), Time Pattern (10%), File Type (10%)
// Each axis shows the component's contribution (0-100 before weighting)
// Filled area shows the actual risk profile shape

interface TrsComponent {
  component: string;          // "Sensitivity", "Destination", etc.
  score: number;              // Raw score (0-100)
  weight: number;             // e.g., 40, 25, 15, 10, 10
  weightedScore: number;      // score * weight / 100
}

export function TrsBreakdownRadar({ data }: { data: TrsComponent[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">TRS Component Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="component"
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
          />
          <Radar
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 16.7 Analytics Page — Full Layout

The Analytics page arranges all charts in a clean grid:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Risk Analytics                    [Date Range: Last 30 days ▾]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UPLOAD VOLUME TREND (Area chart — full width)               │  │
│  │  ▓▓▓▓▓░░░░▓▓▓▓░░▓▓▓▓▓▓▓░░░▓▓▓▓▓▓   [7d] [30d] [90d]     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐         │
│  │  CHANNEL BREAKDOWN       │  │  RISK DISTRIBUTION       │         │
│  │  (Donut / Pie Chart)     │  │  (Vertical Bar Chart)    │         │
│  │                          │  │  ▐█▌                     │         │
│  │    ┌──/(pie)\──┐        │  │  ▐█▌ ▐█▌                 │         │
│  │    │   45%     │        │  │  ▐█▌ ▐█▌ ▐█▌             │         │
│  │    └───────────┘        │  │  ▐█▌ ▐█▌ ▐█▌ ▐█▌         │         │
│  │  Browser USB Clip AI     │  │  Low Med High Crit        │         │
│  └─────────────────────────┘  └─────────────────────────┘         │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐         │
│  │  SENSITIVITY BREAKDOWN   │  │  FILE TYPE DISTRIBUTION   │         │
│  │  (Horizontal Bar Chart)  │  │  (Pie Chart)              │         │
│  │  Restricted  ████ 45     │  │                           │         │
│  │  Confidential ██████ 89  │  │    ┌──/(pie)\──┐         │         │
│  │  Internal    █████████ 156│  │    │  Document  │         │         │
│  │  Public      ██████████ 210│ │    └───────────┘         │         │
│  └─────────────────────────┘  └─────────────────────────┘         │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐         │
│  │  TRS SCORE HISTOGRAM     │  │  BRS SCORE HISTOGRAM     │         │
│  │  (Bar — 10 bins)         │  │  (Bar — 10 bins)         │         │
│  │  ▐█▌▐█▌▐█▌▐█▌▐█▌▐█▌    │  │  ▐█▌▐█▌▐█▌▐█▌▐█▌       │         │
│  │  0  20  40  60  80  100  │  │  0  20  40  60  80  100  │         │
│  └─────────────────────────┘  └─────────────────────────┘         │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐         │
│  │  TOP DESTINATIONS        │  │  DEPT RISK COMPARISON    │         │
│  │  (Horizontal Bar Top 10) │  │  (Vertical Grouped Bar)  │         │
│  │  drive.google.com  ██ 89 │  │  ▐█▌▐█▌                  │         │
│  │  chatgpt.com      ██ 76  │  │  Eng Sales HR Finance    │         │
│  │  outlook.com      █ 45   │  │                           │         │
│  └─────────────────────────┘  └─────────────────────────┘         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UPLOAD TIME HEATMAP (hour of day × day of week)             │  │
│  │       Mon  Tue  Wed  Thu  Fri  Sat  Sun                      │  │
│  │  00:  ░░   ░░   ░░   ░░   ░░   ░░   ░░                      │  │
│  │  06:  ░▒   ▒▒   ▒▒   ▒▓   ▒▒   ░░   ░░                      │  │
│  │  09:  ▓▓   ▓█   ██   █▓   ▓▓   ░▒   ░░                      │  │
│  │  12:  ▓█   ██   ██   ██   ▓█   ░░   ░░                      │  │
│  │  15:  ▓▓   ▓█   ▓█   ▓▓   ▓▒   ░░   ░░                      │  │
│  │  18:  ▒▒   ▒▒   ▒▓   ▒▒   ▒░   ░░   ░░                      │  │
│  │  21:  ░▒   ░▒   ░▒   ░░   ░░   ░░   ░░                      │  │
│  │  Legend: ░ Low  ▒ Medium  ▓ High  █ Very High                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 16.8 Color Palette Reference

```typescript
// src/utils/risk-colors.ts
export const RISK_COLORS = {
  LOW: "#22c55e",        // Green (0-30)
  MEDIUM: "#eab308",     // Yellow (31-60)
  HIGH: "#f97316",       // Orange (61-80)
  CRITICAL: "#ef4444",   // Red (81-100)
};

export const SENSITIVITY_COLORS = {
  Public: "#22c55e",       // Green
  Internal: "#3b82f6",     // Blue
  Confidential: "#f97316", // Orange
  Restricted: "#ef4444",   // Red
};

export const CHANNEL_COLORS = {
  Browser: "#3b82f6",      // Blue
  Clipboard: "#8b5cf6",   // Purple
  USB: "#f97316",          // Orange
  AiApplication: "#ef4444",// Red
  FileSystem: "#6b7280",  // Gray
  Email: "#14b8a6",        // Teal
  FTP: "#eab308",          // Yellow
  CloudSync: "#06b6d4",   // Cyan
};

export const ALERT_COLORS = {
  Info: "#3b82f6",         // Blue
  Warning: "#eab308",     // Yellow
  Block: "#f97316",        // Orange
  Critical: "#ef4444",     // Red
};

export const FILE_TYPE_COLORS = {
  Document: "#3b82f6",    // Blue
  Spreadsheet: "#22c55e", // Green
  Archive: "#f97316",     // Orange
  Code: "#6366f1",        // Indigo
  Database: "#ef4444",    // Red
  Image: "#ec4899",       // Pink
  Video: "#8b5cf6",       // Purple
  Other: "#94a3b8",       // Gray
};
```

---

## 17. Monthly Reports with Customization

### 17.1 Overview

The Reports page allows admins to generate **customizable monthly reports** in PDF or CSV format. Reports aggregate data from all Firestore collections for a selected time period and include charts, tables, and summary statistics.

### 17.2 Report Page UI — `ReportsPage.tsx`

```
┌─────────────────────────────────────────────────────────────────────┐
│  Monthly Reports                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─── REPORT CONFIGURATION ────────────────────────────────────┐   │
│  │                                                              │   │
│  │  Report Period:  [February 2026  ▾]   or  Custom Range:      │   │
│  │                  [2026-02-01] → [2026-02-28]                 │   │
│  │                                                              │   │
│  │  Include Sections:                                           │   │
│  │  ☑ Executive Summary          ☑ Upload Events Analysis       │   │
│  │  ☑ Risk Score Overview         ☑ Clipboard Events Analysis   │   │
│  │  ☑ User Risk Profiles          ☑ USB Events Analysis         │   │
│  │  ☑ Alert Summary               ☑ AI Application Events       │   │
│  │  ☑ Agent Health Report          ☐ Email Events (no data)     │   │
│  │  ☑ Top Risk Users               ☐ FTP Events (no data)       │   │
│  │  ☑ Channel Breakdown Charts    ☑ Audit Log Summary           │   │
│  │  ☑ Sensitivity Analysis        ☑ Policy Violations           │   │
│  │                                                              │   │
│  │  Filter by:                                                  │   │
│  │  Department: [All Departments ▾]                             │   │
│  │  User:       [All Users ▾]                                   │   │
│  │  Channel:    [All Channels ▾]                                │   │
│  │  Risk Level: [All Levels ▾]                                  │   │
│  │                                                              │   │
│  │  Format: ○ PDF Report    ○ CSV Data Export    ○ Both         │   │
│  │                                                              │   │
│  │         [Preview Report]              [Generate & Download]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─── REPORT PREVIEW ──────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  (Live preview of the report renders here when clicked)      │   │
│  │  Shows all selected sections with real data                  │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─── PREVIOUSLY GENERATED REPORTS ────────────────────────────┐   │
│  │  Date         Period           Sections    Format    Action  │   │
│  │  Feb 25, 2026 Feb 2026         12/14       PDF       ⬇ Re   │   │
│  │  Jan 31, 2026 Jan 2026         14/14       PDF+CSV   ⬇ Re   │   │
│  │  Jan 15, 2026 Dec 15-Jan 15    8/14        CSV       ⬇ Re   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 17.3 Report Sections — Detailed Specification

Each section below is a toggleable part of the report. The admin selects which sections to include.

#### Section 1: Executive Summary

| Metric | Source | Display |
|--------|--------|---------|
| Total events in period | Count `uploadEvents` by date range | Large number |
| Events blocked | Count `uploadEvents` where `isBlocked=true` | Number + % |
| Average TRS | Mean of `transactionRiskScore` | Number |
| Critical alerts | Count `alerts` where `type=Critical` | Number |
| High-risk users | Count `riskProfiles` where `BRS ≥ 60` | Number |
| Active agents | Count `agents` with recent heartbeat | Number |
| Comparison vs previous period | Calculate % change for each metric | ▲/▼ indicator |

#### Section 2: Risk Score Overview

- **TRS Distribution Bar Chart** — bins of 0-10, 11-20, ..., 91-100
- **Average TRS by Channel** — horizontal bar chart
- **BRS Distribution Bar Chart** — bins across all users
- **Risk Level Pie Chart** — Low / Medium / High / Critical user counts
- **Table:** Top 5 highest TRS events (file, user, channel, destination, TRS)

#### Section 3: User Risk Profiles

- **Table** of all users (or filtered subset) with columns:
  - Username, Employee ID, Department, BRS, Risk Level, Total Uploads, Blocked, Violations
- Sorted by BRS descending
- Risk level color badges in PDF
- BRS trend sparklines (optional)

#### Section 4: Alert Summary

- **Alert Severity Pie Chart** — Info / Warning / Block / Critical counts
- **Alerts Over Time** — Line chart: alert count per day
- **Table:** All unresolved alerts with details
- **Escalation count** — number of repeat-offender escalations

#### Section 5: Upload Events Analysis

- **Upload Volume Area Chart** — daily upload count over report period
- **Channel Breakdown Pie Chart** — Browser / USB / Clipboard / AI / etc.
- **Top 10 Destinations Horizontal Bar** — most common upload domains
- **Sensitivity Distribution Bar Chart** — Public / Internal / Confidential / Restricted
- **File Type Pie Chart** — Document / Spreadsheet / Code / Database / etc.
- **Table:** All blocked events with reason

#### Section 6: Clipboard Events Analysis

- Total clipboard events, events with sensitive data, events targeting AI apps
- **Pie chart:** Sensitive vs Non-sensitive
- **Bar chart:** Top source processes
- **Table:** Events with matched patterns (credit cards, API keys, SSN, etc.)

#### Section 7: USB Events Analysis

- Total USB events, files blocked, drives detected
- **Pie chart:** Blocked vs Allowed
- **Bar chart:** Events by sensitivity level
- **Table:** All blocked USB transfers

#### Section 8: AI Application Events

- Detected AI applications and processes
- **Bar chart:** Events by application name (ChatGPT, Claude, Copilot, etc.)
- **Pie chart:** Event types (Process Detected / Network / Clipboard Paste / etc.)
- **Table:** All paste-to-AI events with content preview

#### Section 9: Agent Health Report

- **Table:** All agents with status, uptime %, scan count, last heartbeat
- Offline incidents count per agent
- Average response time

#### Section 10: Audit Log Summary

- Total audit log entries in period
- **Bar chart:** Actions by category
- Most recent 50 entries (or filtered)

#### Section 11: Policy Violations

- **Bar chart:** Violations by type (UnauthorizedDestination, SensitiveDataUpload, etc.)
- **Table:** All violations with user, type, description, timestamp
- Repeat offenders list (users with 3+ violations)

### 17.4 Report Customization Options

```typescript
// src/types/report-config.ts
export interface ReportConfig {
  // Time period
  periodType: "monthly" | "custom";
  month?: string;           // "2026-02" for monthly
  startDate?: Date;         // Custom range start
  endDate?: Date;           // Custom range end

  // Sections to include (toggle each)
  sections: {
    executiveSummary: boolean;
    riskScoreOverview: boolean;
    userRiskProfiles: boolean;
    alertSummary: boolean;
    uploadEventsAnalysis: boolean;
    clipboardEventsAnalysis: boolean;
    usbEventsAnalysis: boolean;
    aiApplicationEvents: boolean;
    agentHealthReport: boolean;
    topRiskUsers: boolean;
    channelBreakdownCharts: boolean;
    sensitivityAnalysis: boolean;
    auditLogSummary: boolean;
    policyViolations: boolean;
  };

  // Filters
  filters: {
    department?: string;     // Filter by department
    userId?: string;         // Filter to specific user
    channel?: string;        // Filter by upload channel
    riskLevel?: string;      // Filter by risk level
    sensitivityLevel?: string; // Filter by sensitivity
  };

  // Output format
  format: "pdf" | "csv" | "both";

  // PDF options
  pdfOptions: {
    includeCharts: boolean;  // Include chart images in PDF
    pageSize: "A4" | "Letter";
    orientation: "portrait" | "landscape";
    showPageNumbers: boolean;
    headerLogo: boolean;     // Include DataGuard logo
  };

  // CSV options
  csvOptions: {
    delimiter: "," | ";" | "\t";
    includeHeaders: boolean;
    separateSheets: boolean; // Each section as separate CSV file (zipped)
  };
}
```

### 17.5 Report Service

```typescript
// src/services/report-service.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { utils as xlsxUtils, writeFile } from "xlsx";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import type { ReportConfig } from "../types/report-config";

export const reportService = {
  /**
   * Fetch all data needed for the report based on config
   */
  async fetchReportData(config: ReportConfig) {
    const startDate = config.periodType === "monthly"
      ? new Date(`${config.month}-01`)
      : config.startDate!;
    const endDate = config.periodType === "monthly"
      ? getLastDayOfMonth(config.month!)
      : config.endDate!;

    const start = Timestamp.fromDate(startDate);
    const end = Timestamp.fromDate(endDate);

    // Fetch data from each collection in parallel
    const [uploads, clipboard, usb, alerts, riskProfiles, agents, auditLogs] =
      await Promise.all([
        this.queryByDateRange("uploadEvents", "timestamp", start, end, config.filters),
        this.queryByDateRange("clipboardEvents", "timestamp", start, end, config.filters),
        this.queryByDateRange("usbEvents", "timestamp", start, end, config.filters),
        this.queryByDateRange("alerts", "timestamp", start, end, config.filters),
        getDocs(collection(db, "riskProfiles")),
        getDocs(collection(db, "agents")),
        this.queryByDateRange("auditLogs", "timestamp", start, end, {}),
      ]);

    return { uploads, clipboard, usb, alerts, riskProfiles, agents, auditLogs };
  },

  /**
   * Generate PDF report
   */
  async generatePdf(config: ReportConfig, previewElement: HTMLElement): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: config.pdfOptions.orientation,
      unit: "mm",
      format: config.pdfOptions.pageSize.toLowerCase(),
    });

    // Capture the preview HTML as canvas images
    const canvas = await html2canvas(previewElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // 10mm margin each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    // Add header
    if (config.pdfOptions.headerLogo) {
      pdf.setFontSize(18);
      pdf.text("DataGuard Sentinel — Security Report", 10, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, 22);
      pdf.text(`Period: ${config.month || `${config.startDate} — ${config.endDate}`}`, 10, 27);
      position = 35;
    }

    // Add content pages
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - position;

    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Page numbers
    if (config.pdfOptions.showPageNumbers) {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pageHeight - 5);
      }
    }

    return pdf.output("blob");
  },

  /**
   * Generate CSV export (single file or zipped multi-sheet)
   */
  async generateCsv(config: ReportConfig, data: any): Promise<Blob> {
    const workbook = xlsxUtils.book_new();

    if (config.sections.uploadEventsAnalysis) {
      const wsData = data.uploads.map((e: any) => ({
        Timestamp: e.timestamp,
        User: e.userId,
        FileName: e.fileName,
        Channel: e.channel,
        Destination: e.destinationDomain,
        Sensitivity: e.sensitivityLevel,
        TRS: e.transactionRiskScore,
        Blocked: e.isBlocked ? "Yes" : "No",
        BlockReason: e.blockReason || "",
      }));
      const ws = xlsxUtils.json_to_sheet(wsData);
      xlsxUtils.book_append_sheet(workbook, ws, "Upload Events");
    }

    if (config.sections.clipboardEventsAnalysis) {
      const wsData = data.clipboard.map((e: any) => ({
        Timestamp: e.timestamp,
        SourceProcess: e.sourceProcess,
        ContentLength: e.contentLength,
        SensitiveData: e.containsSensitiveData ? "Yes" : "No",
        AiTarget: e.isTargetingAiApp ? e.targetAiAppName : "No",
        RiskScore: e.riskScore,
        MatchedPatterns: (e.matchedPatterns || []).join("; "),
      }));
      const ws = xlsxUtils.json_to_sheet(wsData);
      xlsxUtils.book_append_sheet(workbook, ws, "Clipboard Events");
    }

    if (config.sections.usbEventsAnalysis) {
      const wsData = data.usb.map((e: any) => ({
        Timestamp: e.timestamp,
        Drive: e.driveLetter,
        FileName: e.fileName,
        FileSize: e.fileSizeBytes,
        Sensitivity: e.sensitivityLevel,
        Blocked: e.isBlocked ? "Yes" : "No",
        BlockReason: e.blockReason || "",
      }));
      const ws = xlsxUtils.json_to_sheet(wsData);
      xlsxUtils.book_append_sheet(workbook, ws, "USB Events");
    }

    if (config.sections.alertSummary) {
      const wsData = data.alerts.map((a: any) => ({
        Timestamp: a.timestamp,
        Type: a.type,
        Channel: a.channel,
        Title: a.title,
        RiskScore: a.riskScore,
        Resolved: a.isResolved ? "Yes" : "No",
      }));
      const ws = xlsxUtils.json_to_sheet(wsData);
      xlsxUtils.book_append_sheet(workbook, ws, "Alerts");
    }

    if (config.sections.userRiskProfiles) {
      const wsData = data.riskProfiles.docs.map((d: any) => {
        const p = d.data();
        return {
          Username: p.username,
          EmployeeId: p.userId,
          Department: p.department,
          BRS: p.behavioralRiskScore,
          RiskLevel: p.currentRiskLevel,
          TotalUploads: p.totalUploads,
          BlockedUploads: p.blockedUploads,
          Violations: (p.violationHistory || []).length,
        };
      });
      const ws = xlsxUtils.json_to_sheet(wsData);
      xlsxUtils.book_append_sheet(workbook, ws, "User Risk Profiles");
    }

    // Convert to blob  
    const arrayBuffer = xlsxUtils.book_to_array(workbook);
    return new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },

  // Helper: Query Firestore collection by date range with optional filters
  async queryByDateRange(
    collectionName: string,
    dateField: string,
    start: Timestamp,
    end: Timestamp,
    filters: any
  ) {
    let q = query(
      collection(db, collectionName),
      where(dateField, ">=", start),
      where(dateField, "<=", end)
    );
    // Additional filters applied client-side after fetch
    const snapshot = await getDocs(q);
    let docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (filters.department) {
      docs = docs.filter((d: any) => d.department === filters.department);
    }
    if (filters.userId) {
      docs = docs.filter((d: any) => d.userId === filters.userId || d.employeeId === filters.userId);
    }
    if (filters.channel) {
      docs = docs.filter((d: any) => d.channel === filters.channel);
    }
    if (filters.riskLevel) {
      docs = docs.filter((d: any) => d.riskLevel === filters.riskLevel);
    }
    return docs;
  },
};
```

### 17.6 Report Preview Component

```tsx
// src/components/reports/ReportPreview.tsx
// This component renders the selected report sections as HTML
// that is both viewable in the browser and capturable by html2canvas for PDF

// Structure:
// <div ref={reportRef} className="bg-white p-8 max-w-[210mm] mx-auto">
//   {config.sections.executiveSummary && <ExecutiveSummarySection data={...} />}
//   {config.sections.riskScoreOverview && <RiskOverviewSection data={...} />}
//   {config.sections.userRiskProfiles && <UserProfilesTable data={...} />}
//   {config.sections.alertSummary && <AlertSummarySection data={...} />}
//   {config.sections.uploadEventsAnalysis && <UploadAnalysisSection data={...} />}
//   ... etc.
// </div>
```

Each section component includes:
- Section header with title and description
- Summary stat cards (inline, no grid for PDF compatibility)
- Charts rendered with `<ResponsiveContainer>` at fixed pixel widths for PDF
- Data tables with clean borders (no hover effects for print)

### 17.7 Report Page Implementation

```tsx
// src/pages/ReportsPage.tsx
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/report-service";
import { ReportPreview } from "../components/reports/ReportPreview";
import type { ReportConfig } from "../types/report-config";
import { toast } from "sonner";

const DEFAULT_CONFIG: ReportConfig = {
  periodType: "monthly",
  month: "2026-02",
  sections: {
    executiveSummary: true,
    riskScoreOverview: true,
    userRiskProfiles: true,
    alertSummary: true,
    uploadEventsAnalysis: true,
    clipboardEventsAnalysis: true,
    usbEventsAnalysis: true,
    aiApplicationEvents: true,
    agentHealthReport: true,
    topRiskUsers: true,
    channelBreakdownCharts: true,
    sensitivityAnalysis: true,
    auditLogSummary: true,
    policyViolations: true,
  },
  filters: {},
  format: "pdf",
  pdfOptions: {
    includeCharts: true,
    pageSize: "A4",
    orientation: "portrait",
    showPageNumbers: true,
    headerLogo: true,
  },
  csvOptions: {
    delimiter: ",",
    includeHeaders: true,
    separateSheets: true,
  },
};

export function ReportsPage() {
  const [config, setConfig] = useState<ReportConfig>(DEFAULT_CONFIG);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch report data when preview is requested
  const { data: reportData, refetch, isLoading } = useQuery({
    queryKey: ["reportData", config.month, config.startDate, config.endDate, config.filters],
    queryFn: () => reportService.fetchReportData(config),
    enabled: showPreview,
  });

  const handlePreview = () => {
    setShowPreview(true);
    refetch();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (config.format === "pdf" || config.format === "both") {
        if (reportRef.current) {
          const pdfBlob = await reportService.generatePdf(config, reportRef.current);
          downloadBlob(pdfBlob, `DataGuard-Report-${config.month || "custom"}.pdf`);
        }
      }
      if (config.format === "csv" || config.format === "both") {
        const csvBlob = await reportService.generateCsv(config, reportData);
        downloadBlob(csvBlob, `DataGuard-Report-${config.month || "custom"}.xlsx`);
      }
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report");
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Monthly Reports</h1>

      {/* Report Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
        {/* Period selection, section toggles, filters, format — as per wireframe */}
        {/* ... form controls ... */}

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handlePreview}
            className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors duration-150"
          >
            Preview Report
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors duration-150 disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate & Download"}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {showPreview && reportData && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Report Preview</span>
            <span className="text-xs text-slate-400">
              {Object.values(config.sections).filter(Boolean).length} sections selected
            </span>
          </div>
          <div ref={reportRef}>
            <ReportPreview config={config} data={reportData} />
          </div>
        </div>
      )}
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### 17.8 PDF Report Layout

The generated PDF follows this structure:

```
┌─────────────────────────────────────────────┐
│  PAGE 1 — COVER                              │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  DataGuard Sentinel                   │   │
│  │  Security Monitoring Report           │   │
│  │                                       │   │
│  │  Period: February 2026                │   │
│  │  Generated: Feb 25, 2026 14:30        │   │
│  │  Organization: [Org Name]             │   │
│  │  Classification: CONFIDENTIAL         │   │
│  └──────────────────────────────────────┘   │
│                                              │
├─────────────────────────────────────────────┤
│  PAGE 2 — EXECUTIVE SUMMARY                  │
│                                              │
│  Total Events: 1,247     Blocked: 147 (12%) │
│  Average TRS: 42         Critical Alerts: 8  │
│  High-Risk Users: 3      Active Agents: 12   │
│  vs Last Month: ▲ 15% events ▼ 3% blocked   │
│                                              │
├─────────────────────────────────────────────┤
│  PAGE 3 — RISK OVERVIEW                      │
│                                              │
│  [TRS Distribution Bar Chart]                │
│  [Risk Level Pie Chart]                      │
│  [Top 5 Highest TRS Events Table]            │
│                                              │
├─────────────────────────────────────────────┤
│  PAGE 4-5 — UPLOAD ANALYSIS                  │
│                                              │
│  [Upload Volume Area Chart]                  │
│  [Channel Pie Chart]                         │
│  [Top Destinations Bar]                      │
│  [Sensitivity Bar]                           │
│  [Blocked Events Table]                      │
│                                              │
├─────────────────────────────────────────────┤
│  PAGE 6 — USER RISK PROFILES                 │
│                                              │
│  [Full Users Table sorted by BRS]            │
│  [Top 5 Risk Users highlighted]              │
│                                              │
├─────────────────────────────────────────────┤
│  PAGE 7 — ALERTS & ESCALATIONS               │
│                                              │
│  [Alert Severity Pie Chart]                  │
│  [Alerts Over Time Line Chart]               │
│  [Unresolved Alerts Table]                   │
│                                              │
├─────────────────────────────────────────────┤
│  PAGES 8+ — REMAINING SECTIONS               │
│  (Clipboard, USB, AI, Agents, Audit, etc.)   │
│                                              │
├─────────────────────────────────────────────┤
│  LAST PAGE — FOOTER                          │
│  Generated by DataGuard Sentinel v1.0        │
│  Page X of Y                                 │
└─────────────────────────────────────────────┘
```

### 17.9 Scheduled Reports (Optional Enhancement)

```typescript
// Future enhancement: auto-generate and email monthly reports
// Can be implemented as a Firebase Cloud Function that runs on the 1st of each month
// exports.generateMonthlyReport = functions.pubsub
//   .schedule("0 6 1 * *")  // 6 AM on 1st of every month
//   .onRun(async () => {
//     const config = await getDefaultReportConfig();
//     const report = await generateReport(config);
//     await emailReport(report, adminEmails);
//   });
```

---

## 18. Notification System

### 18.1 Real-Time Toast Notifications

When a new alert arrives via SignalR:

```typescript
// In useSignalR hook:
connection.on("ReceiveAlert", (alert: DlpAlert) => {
  addAlert(alert);

  // Show toast notification based on severity
  if (alert.type === "Critical") {
    toast.error(`CRITICAL: ${alert.title}`, {
      description: alert.message,
      duration: 10000, // Stay 10 seconds
      action: { label: "View", onClick: () => navigate(`/alerts/${alert.alertId}`) },
    });
  } else if (alert.type === "Block") {
    toast.warning(`BLOCKED: ${alert.title}`, { description: alert.message });
  } else if (alert.type === "Warning") {
    toast.warning(alert.title, { description: alert.message });
  } else {
    toast.info(alert.title);
  }
});

connection.on("ReceiveEscalation", (data) => {
  toast.error(`ESCALATION: ${data.username} (BRS: ${data.brs})`, {
    description: data.reason,
    duration: 15000,
  });
});
```

### 16.2 Notification Bell (Header)

- Badge showing unread alert count
- Dropdown with last 10 alerts
- "Mark all as read" button
- Click alert → navigate to alert detail

### 16.3 Browser Notifications

```typescript
// Request permission on first login, then show browser notifications for critical alerts
if (Notification.permission === "granted" && alert.type === "Critical") {
  new Notification("DataGuard Sentinel — Critical Alert", {
    body: alert.message,
    icon: "/logo.svg",
    tag: alert.alertId,
  });
}
```

---

## 19. Routing Structure

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes (require admin auth) */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/alerts/:alertId" element={<AlertDetailPage />} />
          <Route path="/events/uploads" element={<UploadEventsPage />} />
          <Route path="/events/clipboard" element={<ClipboardEventsPage />} />
          <Route path="/events/usb" element={<UsbEventsPage />} />
          <Route path="/events/ai" element={<AiEventsPage />} />
          <Route path="/events/email" element={<EmailEventsPage />} />
          <Route path="/events/ftp" element={<FtpEventsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
          <Route path="/analytics" element={<RiskAnalyticsPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Sidebar Navigation

```
📊 Dashboard           /dashboard
🔔 Alerts              /alerts           (badge: unread count)
📤 Upload Events       /events/uploads
📋 Clipboard Events    /events/clipboard
💾 USB Events          /events/usb
🤖 AI App Events       /events/ai
📧 Email Events        /events/email
📁 FTP Events          /events/ftp
👥 Users               /users
🖥️ Agents              /agents
📜 Audit Log           /audit-log
📈 Analytics           /analytics
🛡️ Policy              /policy
⚙️ Settings            /settings
```

---

## 20. Security Considerations

### 18.1 Authentication

- Firebase Auth with email/password
- Admin role verified against Firestore `admins` collection (server-side only access)
- JWT tokens with expiration
- Re-authentication required for password change
- Session timeout after inactivity

### 18.2 Authorization

- All Firestore rules enforce `request.auth.token.role == 'admin'`
- Client-side route guards (`ProtectedRoute` component)
- API endpoints require valid auth token
- Dashboard admin password stored as SHA256 hash with salt `"DataGuardSalt2026"`
  - **Recommendation:** Upgrade to BCrypt/Argon2 for production

### 18.3 Data Protection

- Firestore security rules block all non-admin access
- Audit logs are immutable (no update/delete allowed)
- Admin credentials collection (`admins`) blocks all client-side reads
- SignalR connections authenticated with JWT
- CORS policy restricts dashboard origin

### 18.4 Password Requirements (for Change Password)

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot be same as current password
- Current password verification required

---

## 21. Environment Configuration

### `.env` File

```env
# Firebase Web App Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=dataguard-sentinel.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dataguard-sentinel
VITE_FIREBASE_STORAGE_BUCKET=dataguard-sentinel.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=https://dataguard-sentinel-default-rtdb.firebaseio.com

# SignalR Hub Server
VITE_SIGNALR_HUB_URL=https://api.dataguard.com/hubs/monitoring

# API Base URL (for REST endpoints)
VITE_API_BASE_URL=https://api.dataguard.com/api

# Dashboard Settings
VITE_APP_NAME=DataGuard Sentinel
VITE_APP_VERSION=1.0.0
VITE_AGENT_HEARTBEAT_TIMEOUT_SECONDS=60
VITE_DASHBOARD_REFRESH_INTERVAL_MS=30000
```

---

## 22. Deployment

### 20.1 Firebase Hosting (Frontend)

```bash
# Build the React app
cd dataguard-dashboard
npm run build

# Deploy to Firebase Hosting
firebase init hosting  # Select dataguard-sentinel project
firebase deploy --only hosting
```

### 20.2 SignalR Hub Server Deployment

```bash
# Build and publish the ASP.NET Core hub server
cd src/DataGuard.DashboardApi
dotnet publish -c Release -o ../../publish/DashboardApi

# Deploy to Azure App Service / IIS / Docker
# The hub server must be accessible from both:
# 1. Endpoint agents (for sending data)
# 2. Dashboard browsers (for receiving real-time updates)
```

### 20.3 Docker Compose (Optional)

```yaml
version: "3.8"
services:
  dashboard-api:
    build: ./src/DataGuard.DashboardApi
    ports:
      - "5000:80"
    environment:
      - Firebase__ProjectId=dataguard-sentinel
      - Firebase__CredentialsPath=/config/firebase-service-account.json
    volumes:
      - ./config:/config:ro

  dashboard-web:
    build: ./dataguard-dashboard
    ports:
      - "3000:80"
    depends_on:
      - dashboard-api
```

---

## 23. Testing Strategy

### 21.1 Unit Tests

| Area | Tool | Tests |
|------|------|-------|
| React components | Vitest + React Testing Library | Render tests, user interaction |
| Services | Vitest + MSW (Mock Service Worker) | API calls, Firestore queries |
| Zustand stores | Vitest | State changes, actions |
| Form validation | Vitest + Zod | Schema validation |
| Utility functions | Vitest | Formatters, validators |

### 21.2 Integration Tests

| Area | Tool | Tests |
|------|------|-------|
| Firebase Firestore | Firebase Emulator Suite | CRUD operations, security rules |
| SignalR connection | Integration tests | Hub connection, message flow |
| Authentication | Firebase Auth Emulator | Login, password change, role check |

### 21.3 E2E Tests

| Area | Tool | Tests |
|------|------|-------|
| Full user flows | Playwright | Login → Dashboard → Alerts → Users → Settings |
| Responsive design | Playwright | Mobile, tablet, desktop viewports |
| Accessibility | axe-core + Playwright | WCAG 2.1 AA compliance |

### 21.4 Performance Tests

- Lighthouse CI (Core Web Vitals)
- Bundle size analysis (rollup-plugin-visualizer)
- Firestore query performance (index optimization)
- SignalR load testing (100+ concurrent connections)

---

## 24. Development Milestones

### Phase 1 — Foundation (Week 1-2)

| Task | Description | Deliverable |
|------|-------------|-------------|
| 1.1 | Create React project with Vite + TypeScript | Scaffolded project |
| 1.2 | Set up Tailwind CSS + shadcn/ui | Styling system |
| 1.3 | Firebase SDK initialization | `firebase.ts` config |
| 1.4 | TypeScript interfaces for all data models | `types/` directory |
| 1.5 | Admin login page + Firebase Auth | `LoginPage.tsx` |
| 1.6 | Protected route + auth store | `ProtectedRoute.tsx` |
| 1.7 | Main layout (sidebar + header) | `MainLayout.tsx` |
| 1.8 | Routing setup | `App.tsx` routes |

### Phase 2 — Core Dashboard (Week 3-4)

| Task | Description | Deliverable |
|------|-------------|-------------|
| 2.1 | ASP.NET Core SignalR hub server project | `DataGuard.DashboardApi` |
| 2.2 | `MonitoringHub` implementation | Hub server |
| 2.3 | React SignalR client hook | `useSignalR.ts` |
| 2.4 | Dashboard overview page with KPI cards | `DashboardPage.tsx` |
| 2.5 | Live alert feed component | `AlertFeed.tsx` |
| 2.6 | Agent status grid | `AgentStatusGrid.tsx` |
| 2.7 | Reusable data table component | `DataTable.tsx` |

### Phase 3 — Event Viewers (Week 5-6)

| Task | Description | Deliverable |
|------|-------------|-------------|
| 3.1 | Upload events service + page | `UploadEventsPage.tsx` |
| 3.2 | Clipboard events page | `ClipboardEventsPage.tsx` |
| 3.3 | USB events page | `UsbEventsPage.tsx` |
| 3.4 | AI application events page | `AiEventsPage.tsx` |
| 3.5 | Event detail modal with TRS breakdown | `EventDetailModal.tsx` |
| 3.6 | Event filters (channel, sensitivity, date range) | `EventFilters.tsx` |

### Phase 4 — User & Alert Management (Week 7-8)

| Task | Description | Deliverable |
|------|-------------|-------------|
| 4.1 | User list page with search + filter | `UsersPage.tsx` |
| 4.2 | User detail page with risk profile | `UserDetailPage.tsx` |
| 4.3 | Remove user functionality (after uninstall) | `RemoveUserDialog.tsx` |
| 4.4 | Alert management page | `AlertsPage.tsx` |
| 4.5 | Alert resolve + investigation notes | `AlertActions.tsx` |
| 4.6 | Agents monitoring page | `AgentsPage.tsx` |
| 4.7 | Audit log viewer | `AuditLogPage.tsx` |

### Phase 5 — Analytics, Charts & Reports (Week 9-11)

| Task | Description | Deliverable |
|------|-------------|-------------|
| 5.1 | Risk analytics page layout | `RiskAnalyticsPage.tsx` |
| 5.2 | Upload trend area chart | `UploadTrendChart.tsx` |
| 5.3 | Channel breakdown pie/donut chart | `ChannelPieChart.tsx` |
| 5.4 | Risk level distribution bar chart | `RiskDistributionChart.tsx` |
| 5.5 | Sensitivity horizontal bar chart | `SensitivityBarChart.tsx` |
| 5.6 | File type pie chart | `FileTypePieChart.tsx` |
| 5.7 | TRS/BRS score histograms | `TrsHistogram.tsx`, `BrsHistogram.tsx` |
| 5.8 | TRS component breakdown radar chart | `TrsBreakdownRadar.tsx` |
| 5.9 | Top destinations horizontal bar chart | `TopDestinationsChart.tsx` |
| 5.10 | Department risk comparison bar chart | `DeptRiskBarChart.tsx` |
| 5.11 | Blocked vs allowed donut chart | `BlockedAllowedChart.tsx` |
| 5.12 | Agent status donut chart | `AgentStatusDonut.tsx` |
| 5.13 | Upload time heatmap | `TimeHeatmap.tsx` |
| 5.14 | BRS trend per-user line chart | `BrsTrendChart.tsx` |
| 5.15 | Monthly comparison grouped bar chart | `MonthlyComparisonChart.tsx` |
| 5.16 | Report configuration UI | `ReportsPage.tsx` |
| 5.17 | Report preview component | `ReportPreview.tsx` |
| 5.18 | PDF generation service (jsPDF + html2canvas) | `report-service.ts` |
| 5.19 | CSV/Excel export service (xlsx) | `report-service.ts` |
| 5.20 | Report section components (11 sections) | `components/reports/` |
| 5.21 | Previously generated reports table | Report history in Firestore |

### Phase 6 — Settings & Admin (Week 12)

| Task | Description | Deliverable |
|------|-------------|-------------|
| 6.1 | Admin password change | `ChangePasswordForm.tsx` |
| 6.2 | Policy management page | `PolicyPage.tsx` |
| 6.3 | Settings page | `SettingsPage.tsx` |

### Phase 7 — Polish & Testing (Week 13-14)

| Task | Description | Deliverable |
|------|-------------|-------------|
| 7.1 | Toast notification system | Sonner integration |
| 7.2 | Browser notifications for critical alerts | Notification API |
| 7.3 | UI/UX design system implementation | CSS variables, Tailwind config |
| 7.4 | Responsive design (tablet/mobile) | CSS adjustments, sidebar collapse |
| 7.5 | Dark mode toggle (optional) | Theme provider |
| 7.6 | Unit + integration tests | Test suites |
| 7.7 | Firestore security rules testing | Emulator tests |
| 7.8 | Performance optimization | Lazy loading, memoization |
| 7.9 | Accessibility audit (WCAG 2.1 AA) | a11y fixes |
| 7.10 | Firebase Hosting deployment | Production build |

---

## Appendix A: Existing Data Models Reference

These C# models from the endpoint agent codebase define the data structure stored in Firestore:

| Model | Source File | Firestore Collection |
|-------|-----------|---------------------|
| `UploadEvent` | `src/DataGuard.Core/Models/UploadEvent.cs` | `uploadEvents` |
| `DlpAlert` | `src/DataGuard.Core/Models/DlpAlert.cs` | `alerts` |
| `UserRiskProfile` | `src/DataGuard.Core/Models/UserRiskProfile.cs` | `riskProfiles` |
| `ClipboardEvent` | `src/DataGuard.Core/Models/ClipboardEvent.cs` | `clipboardEvents` |
| `RemovableMediaEvent` | `src/DataGuard.Core/Models/RemovableMediaEvent.cs` | `usbEvents` |
| `AiApplicationEvent` | `src/DataGuard.Core/Models/AiApplicationEvent.cs` | (via alerts) |
| `RiskScoringConfig` | `src/DataGuard.Core/Models/RiskScoringConfig.cs` | `settings` |

## Appendix B: SignalR Hub Protocol Reference

### Methods Agent Invokes on Hub

| Method | Parameters | Description |
|--------|-----------|-------------|
| `SendAlert` | `alert: DlpAlert, userId: string` | New DLP alert from agent |
| `SendUploadEvent` | `uploadEvent: UploadEvent` | File upload detected |
| `SendRiskProfileUpdate` | `profile: UserRiskProfile, brsResult: BrsUpdateResult` | Risk score changed |
| `SendEscalation` | `userId, username, brs, reason, riskLevel` | Repeat offender escalation |
| `AgentHeartbeat` | `heartbeat: { scanCount, currentUserId, ... }` | Agent alive signal |
| `RegisterAgent` | `agentInfo: { agentId, machineName, orgId }` | Agent connected |
| `Pong` | — | Response to Ping |

### Methods Hub Sends to Dashboard

| Event | Payload | Description |
|-------|---------|-------------|
| `ReceiveAlert` | `DlpAlert` | New alert to display |
| `ReceiveUploadEvent` | `UploadEvent` | New upload event |
| `ReceiveRiskUpdate` | `UserRiskProfile, BrsUpdateResult` | Risk profile changed |
| `ReceiveEscalation` | `{ userId, username, brs, reason, riskLevel, timestamp }` | Escalation notification |
| `AgentStatusUpdate` | Heartbeat data | Agent status changed |
| `AgentConnected` | Agent info | New agent online |

### Methods Dashboard Sends to Hub

| Method | Parameters | Description |
|--------|-----------|-------------|
| `JoinDashboard` | — | Subscribe to dashboard broadcasts |
| `SendCommandToAgent` | `agentId, commandType, payload` | Remote agent command |
| `BroadcastPolicyUpdate` | `policyJson` | Push policy to all agents |
| `PingAgent` | `agentId` | Health check ping |

### Dashboard Command Types

| Command | Payload | Effect |
|---------|---------|--------|
| `scan-now` | — | Force immediate scan cycle |
| `update-policy` | Policy JSON | Update agent monitoring config |
| `restart-service` | — | Restart endpoint agent service |
| `refresh-config` | — | Reload `appsettings.json` |
| `enable-monitoring` | Channel name | Enable specific monitor |
| `disable-monitoring` | Channel name | Disable specific monitor |

## Appendix C: Firestore Security Rules Summary

| Collection | Dashboard Admin Read | Dashboard Admin Write | System Create | System Update | Immutable |
|-----------|-----------|-------------|---------------|---------------|-----------|
| `dashboardAdmins` | ✅ (own doc) | ✅ (own doc, email/metadata) | Setup script | — | No |
| `admins` | ✅ | ✅ (password/email change) | ConfigUI | ConfigUI | No |
| `users` | ✅ | ✅ (CUD) | — | — | No |
| `uploadEvents` | ✅ | ✅ (UD) | ✅ | — | No |
| `riskProfiles` | ✅ | ✅ (D) | ✅ | ✅ | No |
| `alerts` | ✅ | ✅ (UD) | ✅ | — | No |
| `clipboardEvents` | ✅ | ✅ (UD) | ✅ | — | No |
| `usbEvents` | ✅ | ✅ (UD) | ✅ | — | No |
| `auditLogs` | ✅ | ❌ | ✅ | ❌ | **Yes** |
| `agents` | ✅ | ✅ (D) | ✅ | ✅ | No |
| `settings` | ✅ | ✅ | — | — | No |

> **Note:** `dashboardAdmins` and `admins` are completely separate collections.
> Dashboard admin accounts authenticate dashboard logins only.
> Agent admin accounts (`admins`) are managed by ConfigUI and can be viewed/edited from the dashboard.

---

*This document provides the complete specification for building the DataGuard Sentinel Admin Dashboard. All data models, API contracts, and Firestore schemas are derived from the existing endpoint agent codebase and proposal requirements.*
