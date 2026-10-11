import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clapperboard, Trash2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

function VideoRow({ video, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr>
        <td className="font-semibold">{video.title}</td>
        <td className="text-muted text-sm" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {video.prompt}
        </td>
        <td>{video.storyboard?.length ?? 0} scenes{video.duration_seconds ? ` · ${video.duration_seconds}s` : ''}</td>
        <td className="text-muted text-sm">
          {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : '—'}
        </td>
        <td>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setExpanded(e => !e)}
              title={expanded ? 'Collapse' : 'Preview storyboard'}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Preview
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(video.id)}
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
              <div className="preview-card-header">📹 Storyboard</div>
              <div className="preview-card-body">
                {video.storyboard?.map((scene, i) => (
                  <p key={i} style={{ marginBottom: i < video.storyboard.length - 1 ? 8 : 0 }}>
                    {scene}
                  </p>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function VideoList() {
  const { videos, removeVideo, loading, loadError } = useAppStore()

  async function handleDelete(id) {
    if (!window.confirm('Delete this video? Any packages using it may break.')) return
    try {
      await removeVideo(id)
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Videos</h1>
          <p>All AI-generated video storyboards, grounded in the Medibank guide</p>
        </div>
        <Link to="/studio" className="btn btn-primary btn-sm">
          <ArrowRight size={13} /> New video
        </Link>
      </div>
      <div className="page-body">
        {loading && (
          <div className="card"><div className="empty-state"><span className="spinner spinner-blue" style={{ width: 24, height: 24 }} /></div></div>
        )}
        {loadError && (
          <div style={{ padding: '12px 16px', background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 8, color: 'var(--red)', marginBottom: 16 }}>
            ⚠ Could not load videos: {loadError}. Is the backend running?
          </div>
        )}
        {!loading && videos.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Clapperboard size={40} />
              <p>No videos yet — go to Content Studio to generate one.</p>
              <Link to="/studio" className="btn btn-primary" style={{ marginTop: 16 }}>Content Studio</Link>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="card">
              <div className="card-header">
                <h2>{videos.length} video{videos.length !== 1 ? 's' : ''}</h2>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Prompt</th>
                    <th>Scenes</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map(v => (
                    <VideoRow key={v.id} video={v} onDelete={handleDelete} />
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
