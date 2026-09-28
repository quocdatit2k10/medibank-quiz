# Project Overview — OSHC Educational Platform (MVP)

**Analyse the existing project before making any changes.**

## What This App Is

This application is an MVP for an OSHC (Overseas Student Health Cover) educational platform.

---

## Admin Portal

- Admin can use an integrated AI agent to generate videos.
- Admin can use an integrated AI agent to generate quizzes.
- Admin links a video with a quiz.
- A video + quiz combination can be tagged as:
  - 1 week after arrival
  - 3 weeks after arrival
- Each combination has an active/inactive flag.
- Content is persisted for later retrieval.

---

## User App

- Student arrival date is already known by the system.
- Student receives a push notification 1 week or 3 weeks after arrival.
- Opening the notification retrieves the appropriate active video + quiz.
- Student watches the video.
- Student completes the linked quiz.
- A score of 100% gives the student a $50 campus cafe voucher.

---

## Project Structure

```
medibank-quiz/
├── backend/              # Python 3.13 + FastAPI — shared API (port 8000)
│   ├── main.py           # App entry point + placeholder routes
│   ├── requirements.txt  # fastapi, uvicorn, python-dotenv
│   └── venv/             # Local virtual environment (git-ignored)
├── admin-portal/         # React 18 + Vite — Admin UI (port 5173)
│   ├── src/
│   │   ├── App.jsx
│   │   └── pages/        # Dashboard, Videos, Quizzes, Content
│   └── vite.config.js    # Proxies /api → backend
└── user-app/             # Angular 18 (standalone) — Student UI (port 4200)
    ├── src/
    │   ├── main.ts
    │   └── app/
    │       └── pages/    # home, quiz
    └── proxy.conf.json   # Proxies /api → backend
```

### Running Locally

| Service      | Command                                               | Port |
|--------------|-------------------------------------------------------|------|
| Backend      | `cd backend && source venv/bin/activate && uvicorn main:app --reload` | 8000 |
| Admin Portal | `cd admin-portal && npm run dev`                      | 5173 |
| User App     | `cd user-app && npm start`                            | 4200 |

API docs (Swagger): http://localhost:8000/docs

---

## Before Making Any Changes

1. Analyse the existing architecture.
2. Identify what has already been implemented.
3. Identify what is missing.
4. Propose the MVP architecture.
5. Do not modify any files until the analysis and proposal are reviewed and approved.
