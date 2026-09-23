# Gym Tracker

A lightweight strength-tracking app built for people who want to log workouts, monitor consistency, and review progress without juggling spreadsheets or notes apps.

The project helps lifters track exercises, monitor weekly training volume, and review performance trends over time. It is designed around a simple workflow: log a workout, add set-by-set details, and quickly check how training is progressing.

## Why this app exists

Most gym tracking tools either feel too heavy or too basic. This app is built to stay simple:

- log workouts in a few clicks
- keep training data organized by exercise
- review volume and workout frequency
- track progress with estimated strength markers
- keep each user’s data private and scoped to their own account

## Features

- create and manage exercises
- log workouts with multiple sets per exercise
- review weekly total volume and workout count
- track current and longest streaks
- inspect exercise progress over time
- estimate training strength using a simple 1RM-style calculation
- secure multi-user access with Supabase auth
- run locally with Docker or as a normal frontend/backend setup

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database and auth: Supabase
- Dev workflow: Docker, npm scripts, GitHub Actions-ready setup

## Typical user flow

1. Create exercises for the movements you train most often.
2. Log a workout and assign sets to the relevant exercises.
3. Review your dashboard for volume, streaks, and recent activity.
4. Open an exercise to compare recent performances and progression.
5. Keep a consistent routine without losing track of training history.

## Setup

### 1. Create a Supabase project

1. Create a new project on supabase.com.
2. Run the SQL in `supabase/schema.sql`.
3. Copy the project URL, anon key, and service role key from the Supabase API settings.

### 2. Configure environment variables

Backend (`backend/.env`):
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=http://localhost:5173
```

Frontend (`frontend/.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
```

### 3. Run locally

```bash
# backend
cd backend
npm install
npm run dev

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173

### 4. Run with Docker

```bash
docker-compose up --build
```

## Deployment notes

- Frontend: deploy to Vercel with the app root set to `frontend`
- Backend: deploy to Render or Railway with the app root set to `backend`
- Docker image: push to Docker Hub for containerized deployment
- CI/CD: the project is structured to support GitHub Actions automation

## Project structure

- `backend/` – Express API and Supabase integration
- `frontend/` – React client and dashboard UI
- `supabase/` – database schema and setup SQL

## Submission checklist

```text
Frontend URL:
Backend/API URL:
Docker Hub:
GitHub:
CI/CD:
```

## Notes

This is a practical training log focused on real workout tracking rather than a polished fitness brand product. The app keeps the core experience simple, fast, and easy to extend as the feature set grows.
