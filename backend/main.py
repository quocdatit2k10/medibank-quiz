from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Medibank Quiz API",
    description="Backend API for the OSHC Educational Platform",
    version="0.1.0",
)

# Allow requests from the admin portal and user app during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # React admin portal
        "http://localhost:4200",  # Angular user app
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    return {"message": "Medibank Quiz API is running"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "medibank-quiz-api"}


# ---------------------------------------------------------------------------
# Placeholder routers — to be implemented in later iterations
# ---------------------------------------------------------------------------

@app.get("/api/v1/videos", tags=["Videos"])
def list_videos():
    """Return all video records (placeholder)."""
    return {"data": [], "message": "Videos endpoint — not yet implemented"}


@app.get("/api/v1/quizzes", tags=["Quizzes"])
def list_quizzes():
    """Return all quiz records (placeholder)."""
    return {"data": [], "message": "Quizzes endpoint — not yet implemented"}


@app.get("/api/v1/content", tags=["Content"])
def list_content():
    """Return all video+quiz combinations (placeholder)."""
    return {"data": [], "message": "Content endpoint — not yet implemented"}
