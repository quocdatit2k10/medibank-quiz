import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clapperboard, ClipboardList, PackageCheck, Wifi, WifiOff, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

export default function Dashboard() {
  const { videos, quizzes, packages, loading } = useAppStore()
  const [apiStatus, setApiStatus] = useState('checking')
  const [geminiStatus, setGeminiStatus] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => {
        setApiStatus(d.status === 'ok' ? 'online' : 'error')
        setGeminiStatus(d.gemini)
      })
      .catch(() => setApiStatus('offline'))
  }, [])

  const activePackages = packages.filter(p => p.active).length

  const stats = [
    { label: 'Videos',          value: videos.length,   icon: <Clapperboard size={18} />, color: '#003087', bg: '#e8edf7', to: '/videos'   },
    { label: 'Quizzes',         value: quizzes.length,  icon: <ClipboardList size={18} />, color: '#0066cc', bg: '#dbeafe', to: '/quizzes'  },
    { label: 'Active packages', value: activePackages,  icon: <PackageCheck  size={18} />, color: '#16a34a', bg: '#dcfce7', to: '/packages' },
    { label: 'Total packages',  value: packages.length, icon: <PackageCheck  size={18} />, color: '#d97706', bg: '#fef3c7', to: '/packages' },
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to the Medibank Quiz Admin Portal</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {apiStatus === 'checking' && <span className="badge badge-gray"><span className="spinner spinner-blue" style={{ width: 10, height: 10 }} /> API…</span>}
          {apiStatus === 'online'  && <span className="badge badge-green"><Wifi size={11} /> API connected</span>}
          {apiStatus === 'offline' && <span className="badge badge-red"><WifiOff size={11} /> API offline — start the backend</span>}
          {geminiStatus && (
            <span className={`badge ${geminiStatus === 'configured' ? 'badge-green' : 'badge-amber'}`}>
              {geminiStatus === 'configured' ? '✦ Gemini ready' : '⚠ Gemini not configured'}
            </span>
          )}
        </div>
      </div>

      <div className="page-body">
        {/* Stat cards */}
        <div className="stat-grid">
          {stats.map(s => (
            <Link key={s.label} to={s.to} style={{ textDecoration: 'none' }}>
              <div
                className="stat-card"
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
              >
                <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value">
                  {loading ? <span className="spinner spinner-blue" style={{ width: 18, height: 18 }} /> : s.value}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Gemini not configured banner */}
        {geminiStatus && geminiStatus !== 'configured' && (
          <div style={{ padding: '12px 16px', background: 'var(--amber-light)', border: '1px solid var(--amber)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#92400e' }}>
            <strong>Gemini not configured.</strong> Add your API key to <code>backend/.env</code>:
            &nbsp;<code>GEMINI_API_KEY=your-key-here</code>, then restart the backend.
            &nbsp;<a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--amber)' }}>Get a free key →</a>
          </div>
        )}

        {/* Recent packages table */}
        {!loading && packages.length === 0 ? (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🎬</p>
              <p className="font-semibold" style={{ marginBottom: 6 }}>No content yet</p>
              <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
                Use Content Studio to generate your first reel + quiz episode.
              </p>
              <Link to="/studio" className="btn btn-primary">
                Go to Content Studio <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="card">
              <div className="card-header">
                <h2>Recent packages</h2>
                <Link to="/packages" className="btn btn-secondary btn-sm">View all</Link>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Quiz</th>
                    <th>Timing</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.slice(-5).reverse().map(pkg => (
                    <tr key={pkg.id}>
                      <td>{pkg.videoTitle}</td>
                      <td>{pkg.quizTitle}</td>
                      <td>
                        <span className="badge badge-blue">
                          {pkg.timing === '1_week' ? '1 week' : '3 weeks'} after arrival
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${pkg.active ? 'badge-green' : 'badge-gray'}`}>
                          {pkg.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
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
