import os
import json
import re
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# ── Medibank guide document ────────────────────────────────────────────────────
GUIDE_PATH = Path(__file__).parent / "medibank_guide.txt"
MEDIBANK_GUIDE = GUIDE_PATH.read_text(encoding="utf-8") if GUIDE_PATH.exists() else ""

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
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory stores (replaced by a DB in production) ─────────────────────────
videos_db: dict[str, dict] = {}
quizzes_db: dict[str, dict] = {}
packages_db: dict[str, dict] = {}


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
        "guide_loaded": bool(MEDIBANK_GUIDE),
    }


# ── Prompts ────────────────────────────────────────────────────────────────────
def build_video_prompt() -> str:
    guide_section = f"\n\nREFERENCE DOCUMENT (use only facts from this):\n{MEDIBANK_GUIDE}" if MEDIBANK_GUIDE else ""
    return f"""
You are an instructional content designer for Medibank, creating very short 5-10 second
educational reels for international students on OSHC (Overseas Student Health Cover) topics.

Your content MUST be grounded in the reference document below. Do not invent facts.{guide_section}

Given a topic prompt from the admin, return a JSON object with this exact shape:
{{
  "title": "<concise title for the reel, max 50 chars>",
  "duration_seconds": <integer between 5 and 10>,
  "storyboard": [
    "Scene 1 — <scene heading>: <one very short sentence, max 15 words>",
    "Scene 2 — <scene heading>: <one very short sentence, max 15 words>"
  ]
}}

Rules:
- Always produce exactly 2 scenes (one opening, one key takeaway).
- Each scene is max 15 words — this is a 5-10 second reel, keep it punchy.
- Keep language simple and friendly for international students.
- Respond with raw JSON only — no markdown fences, no extra text.
"""


def build_quiz_prompt() -> str:
    guide_section = f"\n\nREFERENCE DOCUMENT (base all questions and answers on this):\n{MEDIBANK_GUIDE}" if MEDIBANK_GUIDE else ""
    return f"""
You are a quiz designer for Medibank, creating short knowledge-check quizzes for international
students on OSHC (Overseas Student Health Cover) topics.

Your questions and correct answers MUST be grounded in the reference document below.{guide_section}

Given a topic prompt from the admin, return a JSON object with this exact shape:
{{
  "title": "<concise quiz title, max 60 chars>",
  "questions": [
    {{
      "q": "<question text>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "answer": <0-based index of the correct option>
    }}
  ]
}}

Rules:
- Always produce exactly 3 questions — no more, no less.
- Each question must have exactly 4 options.
- Only one option is correct per question.
- Keep questions short and clear.
- Respond with raw JSON only — no markdown fences, no extra text.
"""


def extract_json(text: str) -> dict:
    """
    Best-effort JSON extraction from Gemini output.
    1. Try direct parse first (happens when response_mime_type works).
    2. Strip markdown fences and retry.
    3. Find the first {...} block and parse that.
    """
    text = text.strip()

    # 1. Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Strip ```json ... ``` fences
    cleaned = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3. Extract first {...} block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group())

    raise json.JSONDecodeError("No JSON object found in Gemini response", text, 0)


# ── Generate ───────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    type: str   # "video" | "quiz"
    prompt: str


@app.post("/api/v1/generate", tags=["Generate"])
async def generate_content(body: GenerateRequest):
    if body.type not in ("video", "quiz"):
        raise HTTPException(status_code=400, detail="type must be 'video' or 'quiz'")

    if not GEMINI_API_KEY or GEMINI_API_KEY == "your-gemini-api-key-here":
        raise HTTPException(
            status_code=503,
            detail="Gemini API key not configured. Add GEMINI_API_KEY to backend/.env",
        )

    system_prompt = build_video_prompt() if body.type == "video" else build_quiz_prompt()
    user_message = f"Topic: {body.prompt.strip()}"

    try:
        model = genai.GenerativeModel(
            model_name="models/gemini-3.5-flash",
            system_instruction=system_prompt,
        )
        response = model.generate_content(
            user_message,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.4,
            ),
        )
        result = extract_json(response.text)
        return result

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Gemini returned non-JSON output: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini error: {str(e)}")


# ── Videos CRUD ───────────────────────────────────────────────────────────────
class VideoCreate(BaseModel):
    title: str
    prompt: str
    storyboard: list[str]
    duration_seconds: Optional[int] = None


@app.get("/api/v1/videos", tags=["Videos"])
def list_videos():
    return {"data": list(videos_db.values())}


@app.post("/api/v1/videos", tags=["Videos"], status_code=201)
def create_video(body: VideoCreate):
    vid_id = str(uuid.uuid4())
    record = {
        "id": vid_id,
        "title": body.title,
        "prompt": body.prompt,
        "storyboard": body.storyboard,
        "duration_seconds": body.duration_seconds,
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }
    videos_db[vid_id] = record
    return record


@app.get("/api/v1/videos/{vid_id}", tags=["Videos"])
def get_video(vid_id: str):
    if vid_id not in videos_db:
        raise HTTPException(status_code=404, detail="Video not found")
    return videos_db[vid_id]


@app.delete("/api/v1/videos/{vid_id}", tags=["Videos"], status_code=204)
def delete_video(vid_id: str):
    if vid_id not in videos_db:
        raise HTTPException(status_code=404, detail="Video not found")
    del videos_db[vid_id]


# ── Quizzes CRUD ───────────────────────────────────────────────────────────────
class QuizCreate(BaseModel):
    title: str
    prompt: str
    questions: list[dict]


@app.get("/api/v1/quizzes", tags=["Quizzes"])
def list_quizzes():
    return {"data": list(quizzes_db.values())}


@app.post("/api/v1/quizzes", tags=["Quizzes"], status_code=201)
def create_quiz(body: QuizCreate):
    qid = str(uuid.uuid4())
    record = {
        "id": qid,
        "title": body.title,
        "prompt": body.prompt,
        "questions": body.questions,
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }
    quizzes_db[qid] = record
    return record


@app.get("/api/v1/quizzes/{qid}", tags=["Quizzes"])
def get_quiz(qid: str):
    if qid not in quizzes_db:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quizzes_db[qid]


@app.delete("/api/v1/quizzes/{qid}", tags=["Quizzes"], status_code=204)
def delete_quiz(qid: str):
    if qid not in quizzes_db:
        raise HTTPException(status_code=404, detail="Quiz not found")
    del quizzes_db[qid]


# ── Packages CRUD ──────────────────────────────────────────────────────────────
class PackageCreate(BaseModel):
    videoId: str
    quizId: str
    timing: str   # "1_week" | "3_weeks"


class PackagePatch(BaseModel):
    active: Optional[bool] = None


@app.get("/api/v1/packages", tags=["Packages"])
def list_packages():
    return {"data": list(packages_db.values())}


@app.post("/api/v1/packages", tags=["Packages"], status_code=201)
def create_package(body: PackageCreate):
    if body.videoId not in videos_db:
        raise HTTPException(status_code=404, detail="Video not found")
    if body.quizId not in quizzes_db:
        raise HTTPException(status_code=404, detail="Quiz not found")
    if body.timing not in ("1_week", "3_weeks"):
        raise HTTPException(status_code=400, detail="timing must be '1_week' or '3_weeks'")

    pkg_id = str(uuid.uuid4())
    record = {
        "id": pkg_id,
        "videoId": body.videoId,
        "videoTitle": videos_db[body.videoId]["title"],
        "quizId": body.quizId,
        "quizTitle": quizzes_db[body.quizId]["title"],
        "timing": body.timing,
        "active": True,
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }
    packages_db[pkg_id] = record
    return record


@app.patch("/api/v1/packages/{pkg_id}", tags=["Packages"])
def update_package(pkg_id: str, body: PackagePatch):
    if pkg_id not in packages_db:
        raise HTTPException(status_code=404, detail="Package not found")
    if body.active is not None:
        packages_db[pkg_id]["active"] = body.active
    return packages_db[pkg_id]


@app.delete("/api/v1/packages/{pkg_id}", tags=["Packages"], status_code=204)
def delete_package(pkg_id: str):
    if pkg_id not in packages_db:
        raise HTTPException(status_code=404, detail="Package not found")
    del packages_db[pkg_id]
