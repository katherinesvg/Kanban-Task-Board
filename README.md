# Kanban Style Task Board

A beautiful, fully-featured Kanban-style task board built with **React + TypeScript + Supabase**. Inspired by Linear and Asana.

## Features

- **Drag-and-drop** task cards between columns (To Do, In Progress, In Review, Done)
- **Guest accounts** via Supabase anonymous auth — no signup required
- **Real-time updates** via Supabase subscriptions
- **Task detail panel** with inline editing (slide-over)
- **Team members** with color-coded avatars
- **Labels / tags** with custom colors and board filtering
- **Comments** on tasks with timestamps
- **Activity log** tracking status/priority/assignee changes
- **Due date indicators** (overdue, today, tomorrow, upcoming)
- **Priority levels** (Low / Normal / High) with visual badges
- **Search & filtering** by title, priority, assignee, and label
- **Board stats** — total, in-progress, completed, overdue + completion %
- **Row Level Security** — each user only sees their own data

## Tech Stack

| Layer     | Tech                        |
|-----------|-----------------------------|
| Frontend  | React 18 + TypeScript       |
| Styling   | Tailwind CSS (dark theme)   |
| DnD       | @dnd-kit/core + sortable    |
| Database  | Supabase (PostgreSQL)       |
| Auth      | Supabase Anonymous Auth     |
| Build     | Vite 5                      |
| Hosting   | Vercel / Netlify / Cloudflare Pages |

### Tables

| Table | Purpose |
|---|---|
| `tasks` | Core task records (title, status, priority, due_date, …) |
| `team_members` | Virtual team members created by each guest user |
| `labels` | Custom labels/tags |
| `task_labels` | Many-to-many junction: tasks ↔ labels |
| `comments` | Comments on tasks |
| `activity_log` | Audit trail of task changes |

All tables use **Row Level Security (RLS)** — users can only read/write their own data.