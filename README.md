# Medibank Quiz — OSHC Educational Platform (MVP)

## Project Structure

```
medibank-quiz/
├── backend/          # Python (FastAPI) — shared API for admin and user app
├── admin-portal/     # React — admin interface for managing content
└── user-app/         # Angular — student-facing app
```

## Getting Started

### 1. Backend (Python / FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 2. Admin Portal (React)

```bash
cd admin-portal
npm install
npm run dev
```

Runs at: http://localhost:5173

---

### 3. User App (Angular)

```bash
cd user-app
npm install
npm start
```

Runs at: http://localhost:4200

---

## Ports Summary

| Service       | Port  |
|---------------|-------|
| Backend API   | 8000  |
| Admin Portal  | 5173  |
| User App      | 4200  |
