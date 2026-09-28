import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Clapperboard,
  ClipboardList,
  PackageCheck,
  Wand2,
} from 'lucide-react'

import Dashboard from './pages/Dashboard'
import ContentStudio from './pages/ContentStudio'
import Videos from './pages/Videos'
import Quizzes from './pages/Quizzes'
import Packages from './pages/Packages'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🏥</div>
        <div>
          <div className="sidebar-brand-text">Medibank Quiz</div>
          <div className="sidebar-brand-sub">Admin Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Overview</div>
        <NavLink to="/" end className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <LayoutDashboard size={15} /> Dashboard
        </NavLink>

        <div className="sidebar-section-label">Content</div>
        <NavLink to="/studio" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <Wand2 size={15} /> Content Studio
        </NavLink>
        <NavLink to="/videos" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <Clapperboard size={15} /> Videos
        </NavLink>
        <NavLink to="/quizzes" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <ClipboardList size={15} /> Quizzes
        </NavLink>
        <NavLink to="/packages" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <PackageCheck size={15} /> Packages
        </NavLink>
      </nav>
    </aside>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="page-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/studio" element={<ContentStudio />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/packages" element={<Packages />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
