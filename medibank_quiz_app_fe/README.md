# Medibank OSHC — Video + Quiz

An Angular 22 app (standalone components, signals, lazy routes) that walks a member through:

**Home → push notification → watch video → Start quiz → Kahoot-style questions → result**

## Requirements

- Node.js **22.22.3+** or **24.15+** (required by Angular CLI 22)
- npm

## Run it

```bash
npm install
npm start          # http://localhost:4200
npm test           # unit tests (Vitest)
npm run build      # production build → dist/medibank-quiz
```

## How the journey works

| Step | Route | What happens |
|---|---|---|
| Home | `/` | Welcome screen from the mockup. Press **Simulate push notification** (right of the phone) and tap the banner. |
| Video | `/video` | Plays `public/videos/intro.mp4`, or any video picked with **Choose video from device**. Learners can rewind but can't skip ahead. **Start quiz** stays disabled until the video ends. |
| Quiz | `/quiz` | Guarded — redirects to `/video` until the video is finished. Timed questions, four coloured answer tiles, instant feedback. Faster correct answers score more (500–1000 pts). |
| Result | `/result` | Score ring, pass/fail against the pass mark, per-question review, retake / rewatch. |

## Change the content

- **Video:** replace `public/videos/intro.mp4` (MP4 H.264 or WebM). The bundled one is a 12-second placeholder.
- **Questions:** edit `public/data/questions.json` — `passMark`, `secondsPerQuestion`, and the `questions` array (`answerIndex` is 0-based). The sample questions are placeholder content and should be reviewed by Medibank before real use.
- **Backend later:** point `QuizService` (`src/app/core/quiz.service.ts`) at an API instead of the JSON file — no screen changes needed.

## Project layout

```
src/app/
  app.*                      phone frame, status bar, push notification, demo controls
  app.routes.ts              lazy routes + guards
  core/
    journey.service.ts       journey state (video source, completion, answers, score)
    journey.guards.ts        quiz locked until video watched
    quiz.service.ts          loads questions, scoring
    quiz.models.ts
  features/
    home/                    welcome screen
    video-player/            custom player (local file / bundled video)
    quiz/                    timed question screen
    result/                  score + review
public/
  videos/intro.mp4
  data/questions.json
```

Note: build-time font inlining is turned off in `angular.json` (`optimization.fonts: false`) so production builds work on networks that block Google Fonts; the Inter font still loads in the browser.
