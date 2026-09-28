import React from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

export default function Quizzes() {
  const { quizzes } = useAppStore()

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Quizzes</h1>
          <p>All AI-generated quizzes</p>
        </div>
        <Link to="/studio" className="btn btn-primary btn-sm">
          <ArrowRight size={13} /> New quiz
        </Link>
      </div>
      <div className="page-body">
        {quizzes.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <ClipboardList size={40} />
              <p>No quizzes yet — go to Content Studio to generate one.</p>
              <Link to="/studio" className="btn btn-primary" style={{ marginTop: 16 }}>
                Content Studio
              </Link>
            </div>
          </div>
        ) : (
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Questions</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q, i) => (
                  <tr key={q.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td className="font-semibold">{q.title}</td>
                    <td>{q.questions?.length ?? '—'} questions</td>
                    <td className="text-muted text-sm">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
