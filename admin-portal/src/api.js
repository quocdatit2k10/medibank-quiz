/**
 * Thin API client — all fetch calls to the FastAPI backend go here.
 * Vite proxies /api → http://localhost:8000
 */

const BASE = '/api/v1'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  let res
  try {
    res = await fetch(`${BASE}${path}`, opts)
  } catch (networkErr) {
    throw new Error('Cannot reach the backend — is it running on port 8000?')
  }

  if (res.status === 204) return null

  // Safely parse JSON — guard against empty bodies
  const text = await res.text()
  if (!text) {
    if (!res.ok) throw new Error(`Server error ${res.status} (empty response)`)
    return null
  }

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON from server (status ${res.status}): ${text.slice(0, 120)}`)
  }

  if (!res.ok) throw new Error(data.detail ?? `HTTP ${res.status}`)
  return data
}

// ── Generate (Gemini) ──────────────────────────────────────────────────────────
export const generateContent = (type, prompt) =>
  request('POST', '/generate', { type, prompt })

// ── Videos ─────────────────────────────────────────────────────────────────────
export const listVideos   = ()        => request('GET',    '/videos')
export const createVideo  = (body)    => request('POST',   '/videos', body)
export const deleteVideo  = (id)      => request('DELETE', `/videos/${id}`)

// ── Quizzes ────────────────────────────────────────────────────────────────────
export const listQuizzes  = ()        => request('GET',    '/quizzes')
export const createQuiz   = (body)    => request('POST',   '/quizzes', body)
export const deleteQuiz   = (id)      => request('DELETE', `/quizzes/${id}`)

// ── Packages ───────────────────────────────────────────────────────────────────
export const listPackages   = ()           => request('GET',    '/packages')
export const createPackage  = (body)       => request('POST',   '/packages', body)
export const patchPackage   = (id, body)   => request('PATCH',  `/packages/${id}`, body)
export const deletePackage  = (id)         => request('DELETE', `/packages/${id}`)
