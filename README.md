# Medibank Quiz — OSHC Educational Platform (MVP)

## Project Structure

```
medibank-quiz/
├── backend/          # Python (FastAPI) — shared API for admin and user app
├── admin-portal/     # React — admin interface for managing content
└── user-app/         # Angular — student-facing app
```

## Getting Started

# Tab 1 — Backend API
cd backend && source venv/bin/activate && uvicorn main:app --reload
# → http://localhost:8000  |  Swagger docs: http://localhost:8000/docs

# Tab 2 — Admin Portal
cd admin-portal && npm run dev
# → http://localhost:5173

# Tab 3 — User App
cd user-app && npm start
# → http://localhost:4200


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




## Video prompt example
What is a GP and when should an international student see one?

How does Medibank OSHC help pay for GP visits in Australia?

What is the Online Doctor service and how can students use it 24/7?

What's the difference between a public and private hospital in Australia?

## Quiz prompt example
Test students on what a GP is, what they treat, and how to find one in Australia.

Quiz students on how Medibank OSHC covers GP visit costs and what an out-of-pocket expense is.

Check students understand the Online Doctor service — availability, cost, and who can use it.

Test knowledge of hospital types in Australia and how Medibank's Members' Choice network helps.