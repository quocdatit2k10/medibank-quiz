import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from '../api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [videos, setVideos]     = useState([])
  const [quizzes, setQuizzes]   = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(null)

  // ── Bootstrap: load all data from backend on mount ──────────────────────────
  useEffect(() => {
    async function bootstrap() {
      try {
        const [vRes, qRes, pRes] = await Promise.all([
          api.listVideos(),
          api.listQuizzes(),
          api.listPackages(),
        ])
        setVideos(vRes.data)
        setQuizzes(qRes.data)
        setPackages(pRes.data)
      } catch (err) {
        setLoadError(err.message)
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  // ── Videos ───────────────────────────────────────────────────────────────────
  const addVideo = useCallback(async (video) => {
    const record = await api.createVideo(video)
    setVideos(prev => [...prev, record])
    return record
  }, [])

  const removeVideo = useCallback(async (id) => {
    await api.deleteVideo(id)
    setVideos(prev => prev.filter(v => v.id !== id))
  }, [])

  // ── Quizzes ──────────────────────────────────────────────────────────────────
  const addQuiz = useCallback(async (quiz) => {
    const record = await api.createQuiz(quiz)
    setQuizzes(prev => [...prev, record])
    return record
  }, [])

  const removeQuiz = useCallback(async (id) => {
    await api.deleteQuiz(id)
    setQuizzes(prev => prev.filter(q => q.id !== id))
  }, [])

  // ── Packages ─────────────────────────────────────────────────────────────────
  const addPackage = useCallback(async (pkg) => {
    const record = await api.createPackage(pkg)
    setPackages(prev => [...prev, record])
    return record
  }, [])

  const togglePackage = useCallback(async (id, currentActive) => {
    const updated = await api.patchPackage(id, { active: !currentActive })
    setPackages(prev => prev.map(p => p.id === id ? updated : p))
  }, [])

  const removePackage = useCallback(async (id) => {
    await api.deletePackage(id)
    setPackages(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      videos, quizzes, packages,
      loading, loadError,
      addVideo, removeVideo,
      addQuiz, removeQuiz,
      addPackage, togglePackage, removePackage,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used inside AppProvider')
  return ctx
}
