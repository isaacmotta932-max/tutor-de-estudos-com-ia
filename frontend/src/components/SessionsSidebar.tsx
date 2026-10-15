import React from 'react'
import type { SessionSummary } from '../types'

interface SessionsSidebarProps {
  sessions: SessionSummary[]
  currentSessionId: string | null
  isOpen: boolean
  onClose: () => void
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: string) => void
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 2) return 'Agora mesmo'
    if (diffMins < 60) return `Há ${diffMins} min`
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return `Hoje às ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
    if (diffDays === 1) {
      return `Ontem às ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}

export function SessionsSidebar({
  sessions,
  currentSessionId,
  isOpen,
  onClose,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SessionsSidebarProps) {
  const handleDelete = (e: React.MouseEvent, sessionId: string, title: string) => {
    e.stopPropagation()
    if (window.confirm(`Deseja excluir a conversa "${title}"?`)) {
      onDeleteSession(sessionId)
    }
  }

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside className={`sessions-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title-area">
            <span className="sidebar-icon">📚</span>
            <h2>Histórico de Estudos</h2>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            title="Fechar histórico"
            aria-label="Fechar histórico"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-actions">
          <button
            type="button"
            className="new-chat-btn"
            onClick={onNewSession}
          >
            <span className="btn-icon">✨</span>
            <span>Nova Conversa</span>
          </button>
        </div>

        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="empty-sessions">
              <span className="empty-icon">📝</span>
              <p>Nenhuma conversa salva ainda.</p>
              <small>Faça uma pergunta ao tutor para começar seu histórico!</small>
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === currentSessionId
              return (
                <div
                  key={sess.id}
                  className={`session-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectSession(sess.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectSession(sess.id)
                    }
                  }}
                >
                  <div className="session-item-header">
                    <span className="session-subject-badge">{sess.subject}</span>
                    <span className="session-time">{formatRelativeTime(sess.updated_at)}</span>
                  </div>

                  <h3 className="session-item-title" title={sess.title}>
                    {sess.title}
                  </h3>

                  <div className="session-item-footer">
                    <span className="session-msg-count">
                      {sess.message_count} {sess.message_count === 1 ? 'mensagem' : 'mensagens'}
                    </span>
                    <button
                      type="button"
                      className="session-delete-btn"
                      onClick={(e) => handleDelete(e, sess.id, sess.title)}
                      title="Excluir conversa"
                      aria-label={`Excluir conversa ${sess.title}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>
    </>
  )
}
