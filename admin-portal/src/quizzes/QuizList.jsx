import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Trash2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

function QuizRow({ quiz, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr>
        <td className="font-semibold">{quiz.title}</td>
        <td className="text-muted text-sm" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {quiz.prompt}
        </td>
        <td>{quiz.questions?.length ?? 0} questions</td>
        <td className="text-muted text-sm">
          {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : '—'}
        </td>
        <td>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setExpanded(e => !e)}
              title={expanded ? 'Collapse' : 'Preview questions'}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Preview
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(quiz.id)}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} style={{ padding: '0 16px 16px' }}>
            <div className="preview-card">
              <div className="preview-card-header">📝 Questions</div>
              <div className="preview-card-body">
                {quiz.questions?.map((q, i) => (
                  <div key={i} style={{ marginBottom: i < quiz.questions.length - 1 ? 14 : 0 }}>
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
          </td>
        </tr>
      )}
    </>
  )
}

export default function QuizList() {
  const { quizzes, removeQuiz, loading, loadError } = useAppStore()

  async function handleDelete(id) {
    if (!window.confirm('Delete this quiz? Any packages using it may break.')) return
    try {
      await removeQuiz(id)
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Quizzes</h1>
          <p>All AI-generated quizzes, grounded in the Medibank guide</p>
        </div>
        <Link to="/studio" className="btn btn-primary btn-sm">
          <ArrowRight size={13} /> New quiz
        </Link>
      </div>
      <div className="page-body">
        {loading && (
          <div className="card"><div className="empty-state"><span className="spinner spinner-blue" style={{ width: 24, height: 24 }} /></div></div>
        )}
        {loadError && (
          <div style={{ padding: '12px 16px', background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 8, color: 'var(--red)', marginBottom: 16 }}>
            ⚠ Could not load quizzes: {loadError}. Is the backend running?
          </div>
        )}
        {!loading && quizzes.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <ClipboardList size={40} />
              <p>No quizzes yet — go to Content Studio to generate one.</p>
              <Link to="/studio" className="btn btn-primary" style={{ marginTop: 16 }}>Content Studio</Link>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="card">
              <div className="card-header">
                <h2>{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}</h2>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Prompt</th>
                    <th>Questions</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map(q => (
                    <QuizRow key={q.id} quiz={q} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </>
  )
}
