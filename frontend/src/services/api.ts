import type { ChatApiResponse, HealthResponse, SessionDetail, SessionSummary, Subject } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function checkBackendHealth(): Promise<HealthResponse> {
  const url = `${API_BASE_URL}/api/health`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Servidor respondeu com status ${response.status}`)
    }
    return (await response.json()) as HealthResponse
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Servidor backend offline. Inicie o FastAPI em http://127.0.0.1:8000')
    }
    throw error
  }
}

export async function fetchSubjects(): Promise<Subject[]> {
  const url = `${API_BASE_URL}/api/subjects`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Falha ao obter matérias (status ${response.status})`)
    }
    return (await response.json()) as Subject[]
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Não foi possível carregar as matérias: backend inacessível.')
    }
    throw error
  }
}

export async function fetchSessions(): Promise<SessionSummary[]> {
  const url = `${API_BASE_URL}/api/sessions`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Falha ao carregar histórico de sessões (status ${response.status})`)
    }
    return (await response.json()) as SessionSummary[]
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Não foi possível carregar o histórico de estudos: backend offline.')
    }
    throw error
  }
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  const url = `${API_BASE_URL}/api/sessions/${sessionId}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Não foi possível carregar a conversa (status ${response.status})`)
  }
  return (await response.json()) as SessionDetail
}

export async function createSession(subject: string, title?: string): Promise<SessionSummary> {
  const url = `${API_BASE_URL}/api/sessions`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, title }),
  })
  if (!response.ok) {
    throw new Error(`Falha ao criar nova sessão (status ${response.status})`)
  }
  return (await response.json()) as SessionSummary
}

export async function deleteSession(sessionId: string): Promise<void> {
  const url = `${API_BASE_URL}/api/sessions/${sessionId}`
  const response = await fetch(url, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Falha ao excluir sessão (status ${response.status})`)
  }
}

export async function sendChatMessage(
  message: string,
  subject: string,
  sessionId?: string | null,
): Promise<ChatApiResponse> {
  const url = `${API_BASE_URL}/api/chat`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        subject,
        session_id: sessionId || undefined,
      }),
    })

    if (!response.ok) {
      let errorDetail = `Erro HTTP ${response.status}`
      try {
        const data = await response.json()
        if (data.detail) {
          errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
        }
      } catch {
        // Ignora falha de parse do erro
      }
      throw new Error(errorDetail)
    }

    return (await response.json()) as ChatApiResponse
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'Falha de conexão com a API. Certifique-se de que o backend FastAPI está rodando na porta 8000.'
      )
    }
    throw error
  }
}
