import React, { useState } from 'react'
import { Wand2, Video, FileQuestion, Link2, Clock, CheckCircle2, ChevronRight, BookmarkPlus } from 'lucide-react'
import { useAppStore } from '../store/AppContext'
import { generateContent } from '../api'

/* ── Step indicator ──────────────────────────────────────── */
function Steps({ current }) {
  const steps = [
    { num: 1, label: 'Generate content' },
    { num: 2, label: 'Link & schedule' },
  ]
  return (
    <div className="steps">
      {steps.map((s, i) => {
        const state = s.num < current ? 'done' : s.num === current ? 'active' : ''
        return (
          <React.Fragment key={s.num}>
            <div className={`step ${state}`}>
              <div className="step-num">
                {s.num < current ? <CheckCircle2 size={12} /> : s.num}
              </div>
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={14} style={{ color: 'var(--gray-300)', flexShrink: 0 }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ── Error box ───────────────────────────────────────────── */
function ErrorBox({ message }) {
  if (!message) return null
  return (
    <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 6, fontSize: 12.5, color: 'var(--red)' }}>
      ⚠ {message}
    </div>
  )
}

/* ── Step 1: Generate ────────────────────────────────────── */
function StepGenerate({ onDone }) {
  const { addVideo, addQuiz } = useAppStore()
  const [videoPrompt, setVideoPrompt] = useState('')
  const [quizPrompt, setQuizPrompt]   = useState('')
  const [generating, setGenerating]   = useState(null) // 'video' | 'quiz' | null
  const [saving, setSaving]           = useState(null) // 'video' | 'quiz' | null
  const [generatedVideo, setGeneratedVideo] = useState(null)
  const [generatedQuiz, setGeneratedQuiz]   = useState(null)
  const [savedVideo, setSavedVideo]   = useState(false)
  const [savedQuiz, setSavedQuiz]     = useState(false)
  const [errors, setErrors] = useState({})

  async function handleGenerate(type) {
    const prompt = type === 'video' ? videoPrompt : quizPrompt
    if (!prompt.trim()) return
    setGenerating(type)
    setErrors(prev => ({ ...prev, [type]: undefined }))
    // Reset saved state when regenerating
    if (type === 'video') setSavedVideo(false)
    else setSavedQuiz(false)
    try {
      const result = await generateContent(type, prompt)
      result.prompt = prompt
      if (type === 'video') setGeneratedVideo(result)
      else setGeneratedQuiz(result)
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message }))
    } finally {
      setGenerating(null)
    }
  }

  async function handleSaveToLibrary(type) {
    setSaving(type)
    setErrors(prev => ({ ...prev, [type]: undefined }))
    try {
      if (type === 'video') {
        await addVideo({
          title:            generatedVideo.title,
          prompt:           generatedVideo.prompt,
          storyboard:       generatedVideo.storyboard,
          duration_seconds: generatedVideo.duration_seconds ?? null,
        })
        setSavedVideo(true)
      } else {
        await addQuiz({
          title:     generatedQuiz.title,
          prompt:    generatedQuiz.prompt,
          questions: generatedQuiz.questions,
        })
        setSavedQuiz(true)
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message }))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      <div className="two-col">
        {/* ── Video card ── */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Video size={15} style={{ color: 'var(--blue)' }} /> Video prompt
            </h2>
            {generatedVideo && <span className="badge badge-green">Generated</span>}
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Describe the video topic</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Explain what OSHC covers for international students arriving in Australia for the first time…"
                value={videoPrompt}
                onChange={e => setVideoPrompt(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleGenerate('video')}
              disabled={!videoPrompt.trim() || generating === 'video'}
            >
              {generating === 'video'
                ? <><span className="spinner" /> Generating…</>
                : <><Wand2 size={14} /> Generate video</>}
            </button>
            <ErrorBox message={errors.video} />

            {generatedVideo && (
              <div className="preview-card mt-4">
                <div className="preview-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    📹 Storyboard — {generatedVideo.title}
                    {generatedVideo.duration_seconds && (
                      <span className="badge badge-blue" style={{ marginLeft: 8 }}>
                        ⏱ {generatedVideo.duration_seconds}s
                      </span>
                    )}
                  </span>
                  {savedVideo ? (
                    <span className="badge badge-green"><CheckCircle2 size={11} /> Saved</span>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSaveToLibrary('video')}
                      disabled={saving === 'video'}
                    >
                      {saving === 'video' ? <><span className="spinner spinner-blue" style={{ width: 12, height: 12 }} /> Saving…</> : <><BookmarkPlus size={13} /> Save to library</>}
                    </button>
                  )}
                </div>
                <div className="preview-card-body">
                  {generatedVideo.storyboard.map((scene, i) => (
                    <p key={i} style={{ marginBottom: i < generatedVideo.storyboard.length - 1 ? 8 : 0 }}>
                      {scene}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Quiz card ── */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <FileQuestion size={15} style={{ color: 'var(--blue)' }} /> Quiz prompt
            </h2>
            {generatedQuiz && <span className="badge badge-green">Generated</span>}
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Describe the quiz topic</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Test students on key OSHC facts — what's covered, how to claim, and when to activate…"
                value={quizPrompt}
                onChange={e => setQuizPrompt(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleGenerate('quiz')}
              disabled={!quizPrompt.trim() || generating === 'quiz'}
            >
              {generating === 'quiz'
                ? <><span className="spinner" /> Generating…</>
                : <><Wand2 size={14} /> Generate quiz</>}
            </button>
            <ErrorBox message={errors.quiz} />

            {generatedQuiz && (
              <div className="preview-card mt-4">
                <div className="preview-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📝 Quiz — {generatedQuiz.title}</span>
                  {savedQuiz ? (
                    <span className="badge badge-green"><CheckCircle2 size={11} /> Saved</span>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSaveToLibrary('quiz')}
                      disabled={saving === 'quiz'}
                    >
                      {saving === 'quiz' ? <><span className="spinner spinner-blue" style={{ width: 12, height: 12 }} /> Saving…</> : <><BookmarkPlus size={13} /> Save to library</>}
                    </button>
                  )}
                </div>
                <div className="preview-card-body">
                  {generatedQuiz.questions.map((q, i) => (
                    <div key={i} style={{ marginBottom: i < generatedQuiz.questions.length - 1 ? 12 : 0 }}>
                      <p className="font-semibold" style={{ marginBottom: 4 }}>Q{i + 1}. {q.q}</p>
                      {q.options.map((opt, j) => (
                        <p key={j} style={{ paddingLeft: 12, color: j === q.answer ? 'var(--green)' : 'var(--gray-500)', fontSize: 13 }}>
                          {j === q.answer ? '✓' : '○'} {opt}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {generatedVideo && generatedQuiz && (
        <div className="mt-6" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-success" onClick={() => onDone(generatedVideo, generatedQuiz)}>
            Next: Link &amp; schedule <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Step 2: Link & Schedule ─────────────────────────────── */
const TIMING_OPTIONS = [
  { value: '1_week',  label: '1 week after arrival' },
  { value: '3_weeks', label: '3 weeks after arrival' },
]

function StepSchedule({ generatedVideo, generatedQuiz, onSaved }) {
  const { videos, quizzes, addVideo, addQuiz, addPackage } = useAppStore()

  const [videoSource, setVideoSource]     = useState('new')
  const [quizSource, setQuizSource]       = useState('new')
  const [existingVideoId, setExistingVideoId] = useState('')
  const [existingQuizId, setExistingQuizId]   = useState('')
  const [timing, setTiming]   = useState('1_week')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      // 1. Persist video if new
      let videoRecord
      if (videoSource === 'new') {
        videoRecord = await addVideo({
          title:            generatedVideo.title,
          prompt:           generatedVideo.prompt,
          storyboard:       generatedVideo.storyboard,
          duration_seconds: generatedVideo.duration_seconds ?? null,
        })
      } else {
        videoRecord = videos.find(v => v.id === existingVideoId)
      }

      // 2. Persist quiz if new
      let quizRecord
      if (quizSource === 'new') {
        quizRecord = await addQuiz({
          title:     generatedQuiz.title,
          prompt:    generatedQuiz.prompt,
          questions: generatedQuiz.questions,
        })
      } else {
        quizRecord = quizzes.find(q => q.id === existingQuizId)
      }

      // 3. Create package linking the two
      await addPackage({
        videoId: videoRecord.id,
        quizId:  quizRecord.id,
        timing,
      })

      setSaved(true)
      setTimeout(() => onSaved(), 1200)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <CheckCircle2 size={40} style={{ color: 'var(--green)', margin: '0 auto 12px' }} />
        <p className="font-semibold" style={{ fontSize: 16, marginBottom: 4 }}>Package saved!</p>
        <p className="text-muted text-sm">Redirecting…</p>
      </div>
    )
  }

  const canSave =
    (videoSource === 'new' || existingVideoId) &&
    (quizSource  === 'new' || existingQuizId)  &&
    timing

  return (
    <div className="two-col" style={{ alignItems: 'start' }}>
      {/* Left: link */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Link2 size={15} style={{ color: 'var(--blue)' }} /> Pair video &amp; quiz
          </h2>
        </div>
        <div className="card-body">
          {/* Video */}
          <div className="form-group">
            <label className="form-label">Video</label>
            <div className="row" style={{ marginBottom: 8, gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" value="new" checked={videoSource === 'new'} onChange={() => setVideoSource('new')} />
                Use just-generated
              </label>
              {videos.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="radio" value="existing" checked={videoSource === 'existing'} onChange={() => setVideoSource('existing')} />
                  Pick from library
                </label>
              )}
            </div>
            {videoSource === 'new' ? (
              <div className="preview-card">
                <div className="preview-card-header">Selected</div>
                <div className="preview-card-body text-sm">{generatedVideo.title}</div>
              </div>
            ) : (
              <select className="form-select" value={existingVideoId} onChange={e => setExistingVideoId(e.target.value)}>
                <option value="">— select a video —</option>
                {videos.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
              </select>
            )}
          </div>

          <hr className="divider" />

          {/* Quiz */}
          <div className="form-group">
            <label className="form-label">Quiz</label>
            <div className="row" style={{ marginBottom: 8, gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" value="new" checked={quizSource === 'new'} onChange={() => setQuizSource('new')} />
                Use just-generated
              </label>
              {quizzes.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="radio" value="existing" checked={quizSource === 'existing'} onChange={() => setQuizSource('existing')} />
                  Pick from library
                </label>
              )}
            </div>
            {quizSource === 'new' ? (
              <div className="preview-card">
                <div className="preview-card-header">Selected</div>
                <div className="preview-card-body text-sm">{generatedQuiz.title}</div>
              </div>
            ) : (
              <select className="form-select" value={existingQuizId} onChange={e => setExistingQuizId(e.target.value)}>
                <option value="">— select a quiz —</option>
                {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Right: timing + save */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Clock size={15} style={{ color: 'var(--blue)' }} /> Send timing
            </h2>
          </div>
          <div className="card-body">
            <p className="text-sm text-muted" style={{ marginBottom: 14 }}>
              Only active combinations for the selected timing appear in the student app.
            </p>
            {TIMING_OPTIONS.map(opt => (
              <label
                key={opt.value}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  border: `2px solid ${timing === opt.value ? 'var(--blue)' : 'var(--gray-200)'}`,
                  borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                  background: timing === opt.value ? 'var(--blue-light)' : 'white',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio" name="timing" value={opt.value}
                  checked={timing === opt.value}
                  onChange={() => setTiming(opt.value)}
                  style={{ accentColor: 'var(--blue)' }}
                />
                <span style={{ fontSize: 13.5, fontWeight: timing === opt.value ? 600 : 400, color: timing === opt.value ? 'var(--blue)' : 'var(--gray-700)' }}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <ErrorBox message={saveError} />

        <button
          className="btn btn-success"
          style={{ justifyContent: 'center', padding: '11px 20px' }}
          onClick={handleSave}
          disabled={!canSave || saving}
        >
          {saving
            ? <><span className="spinner" /> Saving…</>
            : <><CheckCircle2 size={15} /> Save package</>}
        </button>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────── */
export default function ContentStudio() {
  const [step, setStep]                   = useState(1)
  const [generatedVideo, setGeneratedVideo] = useState(null)
  const [generatedQuiz, setGeneratedQuiz]   = useState(null)

  function handleGenerateDone(video, quiz) {
    setGeneratedVideo(video)
    setGeneratedQuiz(quiz)
    setStep(2)
  }

  function handleSaved() {
    setStep(1)
    setGeneratedVideo(null)
    setGeneratedQuiz(null)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Content Studio</h1>
          <p>Generate a reel &amp; quiz with Gemini AI, then schedule delivery to students.</p>
        </div>
      </div>
      <div className="page-body">
        <Steps current={step} />
        {step === 1 && <StepGenerate onDone={handleGenerateDone} />}
        {step === 2 && (
          <StepSchedule
            generatedVideo={generatedVideo}
            generatedQuiz={generatedQuiz}
            onSaved={handleSaved}
          />
        )}
      </div>
    </>
  )
}
