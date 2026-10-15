export interface Subject {
  id: string
  name: string
  icon: string
  description: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'tutor'
  text: string
  timestamp: string
  subject?: string
  isDemo?: boolean
  provider?: string
}

export interface ChatApiResponse {
  reply: string
  subject: string
  is_demo: boolean
  provider: string
  session_id: string
}

export interface SessionSummary {
  id: string
  title: string
  subject: string
  created_at: string
  updated_at: string
  message_count: number
}

export interface SessionDetail {
  id: string
  title: string
  subject: string
  created_at: string
  updated_at: string
  messages: Array<{
    id: string
    session_id: string
    sender: 'user' | 'tutor'
    text: string
    timestamp: string
    subject: string
    is_demo: boolean
    provider: string
    created_at: string
  }>
}

export interface HealthResponse {
  status: string
  service: string
}
