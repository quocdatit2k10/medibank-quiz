import React from 'react'
import { Link } from 'react-router-dom'
import { PackageCheck, Trash2, ArrowRight, Link2, Check, Play, Star } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

const TIMING_LABEL = {
  '1_week':  '1 week after arrival',
  '3_weeks': '3 weeks after arrival',
}

// ── Pinned demo row — always first, always visible ───────────────────────────
const DEMO_PACKAGE = {
  id: '__demo__',
  videoTitle: 'OSHC Mini-Series — Episode 1 (Demo Reel)',
  quizTitle:  'OSHC Knowledge Check (Demo Quiz)',
  timing: '1_week',
  active: true,
  isDemo: true,
}
const DEMO_LINK = 'http://localhost:4200/video'

export default function Packages() {
  const { packages, togglePackage, removePackage, loading, loadError } = useAppStore()
  const [copiedId, setCopiedId] = React.useState(null)

  async function handleToggle(pkg) {
    try {
      await togglePackage(pkg.id, pkg.active)
    } catch (err) {
      alert(`Update failed: ${err.message}`)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this package?')) return
    try {
      await removePackage(id)
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  function handleCopyLink(pkg) {
    const url = pkg.isDemo ? DEMO_LINK : `${window.location.origin}/view/${pkg.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(pkg.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  // Always render the table — the demo row is always there
  const showEmptyState = !loading && packages.length === 0 && !DEMO_PACKAGE
  const totalActive = packages.filter(p => p.active).length + (DEMO_PACKAGE.active ? 1 : 0)

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Packages</h1>
          <p>Manage video + quiz combinations and their delivery schedule</p>
        </div>
        <Link to="/studio" className="btn btn-primary btn-sm">
          <ArrowRight size={13} /> New package
        </Link>
      </div>
      <div className="page-body">
        {loading && (
          <div className="card"><div className="empty-state"><span className="spinner spinner-blue" style={{ width: 24, height: 24 }} /></div></div>
        )}
        {loadError && (
          <div style={{ padding: '12px 16px', background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 8, color: 'var(--red)', marginBottom: 16 }}>
            ⚠ Could not load packages: {loadError}. Is the backend running?
          </div>
        )}

        {/* Demo banner */}
        {!loading && (
          <div style={{
            padding: '10px 16px',
            background: 'var(--blue-light)',
            border: '1px solid var(--blue)',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
            color: 'var(--blue)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Star size={14} />
            <span><strong>Demo reel</strong> is pinned to the top — use it for your presentation.
            Copy the link to open it in the student app at <code>localhost:4200/video</code>.</span>
          </div>
        )}

        {!loading && (
          <div className="card">
            <div className="card-header">
              <h2>{packages.length + 1} package{packages.length + 1 !== 1 ? 's' : ''} (1 demo + {packages.length} generated)</h2>
              <span className="text-sm text-muted">{totalActive} active</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Quiz</th>
                  <th>Timing</th>
                  <th>Status</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* ── Demo row (always first) ── */}
                <tr key="__demo__" style={{ background: 'var(--blue-light)' }}>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge badge-amber" style={{ flexShrink: 0 }}>
                        <Star size={10} /> Demo
                      </span>
                      <span className="font-semibold">{DEMO_PACKAGE.videoTitle}</span>
                    </span>
                  </td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {DEMO_PACKAGE.quizTitle}
                  </td>
                  <td>
                    <span className="badge badge-blue">{TIMING_LABEL[DEMO_PACKAGE.timing]}</span>
                  </td>
                  <td>
                    <span className="badge badge-green">Active</span>
                  </td>
                  <td>
                    <label className="toggle">
                      <input type="checkbox" checked={DEMO_PACKAGE.active} readOnly />
                      <span className="toggle-slider" style={{ cursor: 'default' }} />
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a
                        href={DEMO_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                        title="Open in student app"
                      >
                        <Play size={13} />
                      </a>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCopyLink(DEMO_PACKAGE)}
                        title="Copy student app link"
                      >
                        {copiedId === '__demo__' ? <Check size={13} style={{ color: 'var(--green)' }} /> : <Link2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* ── Generated packages ── */}
                {packages.map(pkg => (
                  <tr key={pkg.id}>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pkg.videoTitle}
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pkg.quizTitle}
                    </td>
                    <td>
                      <span className="badge badge-blue">{TIMING_LABEL[pkg.timing]}</span>
                    </td>
                    <td>
                      <span className={`badge ${pkg.active ? 'badge-green' : 'badge-gray'}`}>
                        {pkg.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <label className="toggle">
                        <input type="checkbox" checked={pkg.active} onChange={() => handleToggle(pkg)} />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleCopyLink(pkg)}
                          title="Copy viewing link"
                        >
                          {copiedId === pkg.id ? <Check size={13} style={{ color: 'var(--green)' }} /> : <Link2 size={13} />}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(pkg.id)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
