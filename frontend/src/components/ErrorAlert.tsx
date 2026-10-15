import React from 'react'

interface ErrorAlertProps {
  error: string | null
  onDismiss: () => void
  onRetry?: () => void
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss, onRetry }) => {
  if (!error) return null

  return (
    <div className="error-alert-bar" role="alert">
      <div className="error-alert-content">
        <span className="error-icon" aria-hidden="true">
          ⚠️
        </span>
        <span className="error-message">{error}</span>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button type="button" className="retry-btn" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
        <button
          type="button"
          className="dismiss-btn"
          onClick={onDismiss}
          aria-label="Fechar aviso de erro"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
