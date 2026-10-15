import React from 'react'

interface LoadingIndicatorProps {
  subject: string
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ subject }) => {
  return (
    <div className="message-row tutor-row loading-row" aria-live="polite">
      <div className="message-avatar tutor-avatar" aria-hidden="true">
        🤖
      </div>
      <div className="message-bubble tutor-bubble loading-bubble">
        <div className="loading-header">
          <span className="loading-label">O Tutor está formulando uma resposta didática em {subject}...</span>
        </div>
        <div className="typing-dots-container">
          <span className="dot dot-1"></span>
          <span className="dot dot-2"></span>
          <span className="dot dot-3"></span>
        </div>
      </div>
    </div>
  )
}
