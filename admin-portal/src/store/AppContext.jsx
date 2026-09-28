import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [videos, setVideos] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [packages, setPackages] = useState([])

  const addVideo = useCallback((video) => {
    setVideos(prev => [...prev, { ...video, id: crypto.randomUUID() }])
  }, [])

  const addQuiz = useCallback((quiz) => {
    setQuizzes(prev => [...prev, { ...quiz, id: crypto.randomUUID() }])
  }, [])

  const addPackage = useCallback((pkg) => {
    setPackages(prev => [...prev, { ...pkg, id: crypto.randomUUID(), active: true }])
  }, [])

  const togglePackage = useCallback((id) => {
    setPackages(prev =>
      prev.map(p => p.id === id ? { ...p, active: !p.active } : p)
    )
  }, [])

  const deletePackage = useCallback((id) => {
    setPackages(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      videos, quizzes, packages,
      addVideo, addQuiz, addPackage, togglePackage, deletePackage,
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
