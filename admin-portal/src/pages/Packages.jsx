import React from 'react'
import { Link } from 'react-router-dom'
import { PackageCheck, Trash2, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

const TIMING_LABEL = {
  '1_week':  '1 week after arrival',
  '3_weeks': '3 weeks after arrival',
}

export default function Packages() {
  const { packages, togglePackage, deletePackage } = useAppStore()

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
        {packages.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <PackageCheck size={40} />
              <p>No packages yet — create one in Content Studio.</p>
              <Link to="/studio" className="btn btn-primary" style={{ marginTop: 16 }}>
                Content Studio
              </Link>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h2>{packages.length} package{packages.length !== 1 ? 's' : ''}</h2>
              <span className="text-sm text-muted">
                {packages.filter(p => p.active).length} active
              </span>
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
                        <input
                          type="checkbox"
                          checked={pkg.active}
                          onChange={() => togglePackage(pkg.id)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.confirm('Delete this package?')) deletePackage(pkg.id)
                        }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
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
