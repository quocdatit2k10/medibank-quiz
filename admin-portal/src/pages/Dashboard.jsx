import React, { useEffect, useState } from 'react'

export default function Dashboard() {
  const [apiStatus, setApiStatus] = useState('checking…')

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setApiStatus(d.status === 'ok' ? '✅ Connected' : '⚠️ Unexpected response'))
      .catch(() => setApiStatus('❌ Offline — start the backend'))
  }, [])

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Welcome to the Medibank Quiz Admin Portal</p>

      <div className="card-grid">
        <div className="card">
          <div className="card-icon">🎬</div>
          <div className="card-label">Videos</div>
          <div className="card-value">0</div>
        </div>
        <div className="card">
          <div className="card-icon">📝</div>
          <div className="card-label">Quizzes</div>
          <div className="card-value">0</div>
        </div>
        <div className="card">
          <div className="card-icon">📦</div>
          <div className="card-label">Content Packages</div>
          <div className="card-value">0</div>
        </div>
        <div className="card">
          <div className="card-icon">🔌</div>
          <div className="card-label">API Status</div>
          <div style={{ fontSize: '0.95rem', marginTop: 8 }}>{apiStatus}</div>
        </div>
      </div>
    </div>
  )
}
