import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Videos from './pages/Videos'
import Quizzes from './pages/Quizzes'
import Content from './pages/Content'
import './App.css'

function NavBar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">🏥 Medibank Quiz — Admin</span>
      <ul className="nav-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/videos">Videos</Link></li>
        <li><Link to="/quizzes">Quizzes</Link></li>
        <li><Link to="/content">Content</Link></li>
      </ul>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/content" element={<Content />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
