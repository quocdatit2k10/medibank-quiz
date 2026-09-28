import os
import json
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# ── Gemini setup ───────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

@asynccontextmanager
async def lifespan(app: FastAPI):
    if GEMINI_API_KEY and GEMINI_API_KEY != "your-gemini-api-key-here":
        genai.configure(api_key=GEMINI_API_KEY)
    yield

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Medibank Quiz API",
    description="Backend API for the OSHC Educational Platform",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",  # Vite fallback port
        "http://localhost:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"message": "Medibank Quiz API is running"}


@app.get("/health", tags=["Health"])
def health_check():
    api_key_set = bool(GEMINI_API_KEY and GEMINI_API_KEY != "your-gemini-api-key-here")
    return {
        "status": "ok",
        "service": "medibank-quiz-api",
        "gemini": "configured" if api_key_set else "not configured — set GEMINI_API_KEY in backend/.env",
    }


# ── Generate ───────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    type: str   # "video" | "quiz"
    prompt: str


VIDEO_SYSTEM_PROMPT = """
You are an instructional content designer for Medibank, creating short educational reels
for international students on OSHC (Overseas Student Health Cover) topics.

Given a topic prompt, return a JSON object with this exact shape:
{
  "title": "<concise title for the reel, max 60 chars>",
  "storyboard": [
    "Scene 1 — <scene heading>: <one clear sentence describing what appears on screen and what the narrator says>",
    "Scene 2 — ...",
    "Scene 3 — ...",
    "Scene 4 — ..."
  ]
}

Rules:
- Always produce exactly 4 scenes.
- Each scene description must be a single sentence, max 30 words.
- Keep language simple, friendly, and practical for international students.
- Respond with raw JSON only — no markdown fences, no extra text.
"""

QUIZ_SYSTEM_PROMPT = """
You are a quiz designer for Medibank, creating short knowledge-check quizzes for international
students on OSHC (Overseas Student Health Cover) topics.

Given a topic prompt, return a JSON object with this exact shape:
{
  "title": "<concise quiz title, max 60 chars>",
  "questions": [
    {
      "q": "<question text>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "answer": <0-based index of the correct option>
    }
  ]
}

Rules:
- Always produce exactly 4 questions.
- Each question must have exactly 4 options.
- Only one option is correct.
- Keep questions clear and unambiguous.
- Respond with raw JSON only — no markdown fences, no extra text.
"""


def extract_json(text: str) -> dict:
    """Strip markdown fences if Gemini returns them, then parse JSON."""
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)
    return json.loads(cleaned)


@app.post("/api/v1/generate", tags=["Generate"])
async def generate_content(body: GenerateRequest):
    if body.type not in ("video", "quiz"):
        raise HTTPException(status_code=400, detail="type must be 'video' or 'quiz'")

    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key-here":
        raise HTTPException(
            status_code=503,
            detail="Gemini API key not configured. Add GEMINI_API_KEY to backend/.env",
        )

    system_prompt = VIDEO_SYSTEM_PROMPT if body.type == "video" else QUIZ_SYSTEM_PROMPT
    user_message = f"Topic: {body.prompt.strip()}"

    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system_prompt,
        )
        response = model.generate_content(user_message)
        result = extract_json(response.text)
        return result

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini returned non-JSON output: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini error: {str(e)}")


# ── Placeholder CRUD routes (to be implemented) ────────────────────────────────
@app.get("/api/v1/videos", tags=["Videos"])
def list_videos():
    return {"data": [], "message": "Videos endpoint — not yet implemented"}


@app.get("/api/v1/quizzes", tags=["Quizzes"])
def list_quizzes():
    return {"data": [], "message": "Quizzes endpoint — not yet implemented"}


@app.get("/api/v1/content", tags=["Content"])
def list_content():
    return {"data": [], "message": "Content endpoint — not yet implemented"}
