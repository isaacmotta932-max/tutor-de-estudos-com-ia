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

export type DifficultyLevel = 'Iniciante' | 'Intermediário' | 'Avançado'

export interface Exercise {
  id: string
  subject: string
  difficulty: DifficultyLevel
  topic: string
  question: string
  options: string[]
  correct_option_index: number
  explanation: string
  is_demo: boolean
  provider: string
}

export interface ExerciseEvaluateResponse {
  is_correct: boolean
  feedback: string
  explanation: string
  score_points: number
}

export interface HealthResponse {
  status: string
  service: string
}
