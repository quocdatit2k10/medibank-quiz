import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Play, Pause, ChevronRight, CheckCircle2, Trophy, ArrowLeft, Clock } from 'lucide-react'
import { getPackageContent } from '../api'

const TIMING_LABEL = {
  '1_week':  '1 week after arrival',
  '3_weeks': '3 weeks after arrival',
}

/* ── Reel player (scene-by-scene storyboard) ─────────────────── */
function ReelPlayer({ video, onDone }) {
  const [scene, setScene] = useState(0)
  const [playing, setPlaying] = useState(false)

  const total = video?.storyboard?.length ?? 0
  const duration = video?.duration_seconds ?? 8
  const perScene = total > 0 ? duration / total : 4

  // Auto-advance when playing
  useEffect(() => {
    if (!playing) return
    if (scene >= total - 1) {
      const t = setTimeout(() => {
        setPlaying(false)
        onDone()
      }, perScene * 1000)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setScene(s => s + 1), perScene * 1000)
    return () => clearTimeout(t)
  }, [playing, scene, total, perScene, onDone])

  if (!video) return null

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* "Video" screen — storyboard scene card */}
      <div
        style={{
          aspectRatio: '9/16',
          maxWidth: 320,
          margin: '0 auto',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #003087 0%, #0066cc 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: 32,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 20 }}>🎬</div>
        <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4, maxWidth: 260 }}>
          {video.storyboard[scene]}
        </p>
        {/* Progress dots */}
        <div style={{ position: 'absolute', bottom: 20, display: 'flex', gap: 8 }}>
          {video.storyboard.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === scene ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i <= scene ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
        {!playing ? (
          <button
            className="btn btn-primary"
            onClick={() => {
              if (scene >= total - 1) setScene(0)
              setPlaying(true)
            }}
          >
            <Play size={15} /> {scene > 0 && scene < total ? 'Resume' : 'Play reel'}
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => setPlaying(false)}>
            <Pause size={15} /> Pause
          </button>
        )}
        <button
          className="btn btn-secondary"
          onClick={() => { setPlaying(false); onDone() }}
        >
          Skip to quiz <ChevronRight size={15} />
        </button>
      </div>

      <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 8 }}>
        Scene {scene + 1} of {total} · ~{duration}s total
      </p>
    </div>
  )
}

/* ── Quiz component ─────────────────────────────────────────── */
function QuizPlayer({ quiz, onDone }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  if (!quiz) return null

  const total = quiz.questions.length
  const score = quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0)
  const perfect = score === total

  if (submitted) {
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: perfect ? 'var(--green-light)' : 'var(--gray-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          {perfect ? <Trophy size={40} style={{ color: 'var(--green)' }} /> : <CheckCircle2 size={40} style={{ color: 'var(--gray-400)' }} />}
        </div>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>
          {perfect ? 'Perfect score!' : `You scored ${score}/${total}`}
        </h2>
        {perfect ? (
          <div style={{ background: 'var(--green-light)', border: '1px solid var(--green)', borderRadius: 12, padding: 24, margin: '20px 0' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>🎉 $50 Campus Café Voucher Unlocked!</p>
            <p className="text-sm" style={{ marginTop: 8 }}>Your voucher code will be emailed to you shortly.</p>
          </div>
        ) : (
          <p className="text-muted">Review the reel and try again to earn your voucher.</p>
        )}

        {/* Answer review */}
        <div style={{ textAlign: 'left', marginTop: 24 }}>
          {quiz.questions.map((q, i) => (
            <div key={i} style={{
              padding: 14,
              borderRadius: 8,
              marginBottom: 10,
              background: answers[i] === q.answer ? 'var(--green-light)' : 'var(--red-light)',
              border: `1px solid ${answers[i] === q.answer ? 'var(--green)' : 'var(--red)'}`,
            }}>
              <p className="font-semibold" style={{ marginBottom: 6 }}>Q{i + 1}. {q.q}</p>
              <p className="text-sm" style={{ color: answers[i] === q.answer ? 'var(--green)' : 'var(--red)' }}>
                {answers[i] === q.answer ? '✓ Correct' : `✗ Correct answer: ${q.options[q.answer]}`}
              </p>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={onDone} style={{ marginTop: 20 }}>
          Done
        </button>
      </div>
    )
  }

  const q = quiz.questions[current]
  const isLast = current === total - 1

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="badge badge-blue">Question {current + 1} of {total}</span>
        <span className="text-sm text-muted">{Object.keys(answers).length} answered</span>
      </div>

      <div className="card">
        <div className="card-body">
          <p className="font-semibold" style={{ fontSize: 16, marginBottom: 16 }}>{q.q}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, j) => (
              <button
                key={j}
                onClick={() => setAnswers(a => ({ ...a, [current]: j }))}
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: `2px solid ${answers[current] === j ? 'var(--blue)' : 'var(--gray-200)'}`,
                  background: answers[current] === j ? 'var(--blue-light)' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: answers[current] === j ? 'var(--blue)' : 'var(--gray-700)',
                  fontWeight: answers[current] === j ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {String.fromCharCode(65 + j)}. {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          <ArrowLeft size={14} /> Back
        </button>
        {isLast ? (
          <button
            className="btn btn-success"
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < total}
          >
            Submit quiz <CheckCircle2 size={14} />
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setCurrent(c => c + 1)}
            disabled={answers[current] === undefined}
          >
            Next <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Main viewer page ──────────────────────────────────────── */
export default function PackageViewer() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [phase, setPhase] = useState('reel') // 'reel' | 'quiz' | 'done'

  useEffect(() => {
    getPackageContent(id)
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <span className="spinner spinner-blue" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>😕</p>
        <p className="font-semibold" style={{ marginBottom: 8 }}>Could not load this package</p>
        <p className="text-sm text-muted" style={{ marginBottom: 20 }}>{error}</p>
        <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    )
  }

  if (!data?.active) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>🔒</p>
        <p className="font-semibold" style={{ marginBottom: 8 }}>This package is not active</p>
        <p className="text-sm text-muted" style={{ marginBottom: 20 }}>An admin needs to activate it before students can view it.</p>
        <Link to="/packages" className="btn btn-primary">Back to Packages</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ maxWidth: 560, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/packages" className="btn btn-secondary btn-sm">
          <ArrowLeft size={13} /> Back
        </Link>
        <span className="badge badge-blue">
          <Clock size={11} /> {TIMING_LABEL[data.timing]}
        </span>
      </div>

      {/* Phase indicator */}
      <div style={{ maxWidth: 560, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span className={`badge ${phase === 'reel' ? 'badge-blue' : 'badge-gray'}`}>1. Watch</span>
        <ChevronRight size={14} style={{ color: 'var(--gray-300)' }} />
        <span className={`badge ${phase === 'quiz' ? 'badge-blue' : 'badge-gray'}`}>2. Quiz</span>
        <ChevronRight size={14} style={{ color: 'var(--gray-300)' }} />
        <span className={`badge ${phase === 'done' ? 'badge-green' : 'badge-gray'}`}>3. Voucher</span>
      </div>

      {/* Content */}
      {phase === 'reel' && (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: 20, fontSize: 18 }}>{data.video?.title}</h2>
          <ReelPlayer video={data.video} onDone={() => setPhase('quiz')} />
        </div>
      )}

      {phase === 'quiz' && (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: 20, fontSize: 18 }}>{data.quiz?.title}</h2>
          <QuizPlayer quiz={data.quiz} onDone={() => setPhase('done')} />
        </div>
      )}

      {phase === 'done' && (
        <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--green)', margin: '0 auto 16px' }} />
          <p className="font-semibold" style={{ fontSize: 20, marginBottom: 8 }}>Episode complete!</p>
          <p className="text-muted" style={{ marginBottom: 24 }}>Thanks for learning about OSHC with Medibank.</p>
          <Link to="/packages" className="btn btn-primary">Back to Packages</Link>
        </div>
      )}
    </div>
  )
}
