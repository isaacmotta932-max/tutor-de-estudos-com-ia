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
}

export interface HealthResponse {
  status: string
  service: string
}
