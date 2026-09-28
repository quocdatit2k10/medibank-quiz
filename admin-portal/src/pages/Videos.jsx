import React from 'react'
import { Link } from 'react-router-dom'
import { Clapperboard, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

export default function Videos() {
  const { videos } = useAppStore()

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Videos</h1>
          <p>All AI-generated video storyboards</p>
        </div>
        <Link to="/studio" className="btn btn-primary btn-sm">
          <ArrowRight size={13} /> New video
        </Link>
      </div>
      <div className="page-body">
        {videos.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Clapperboard size={40} />
              <p>No videos yet — go to Content Studio to generate one.</p>
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
                  <th>Scenes</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v, i) => (
                  <tr key={v.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td className="font-semibold">{v.title}</td>
                    <td>{v.storyboard?.length ?? '—'} scenes</td>
                    <td className="text-muted text-sm">
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '—'}
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
