import React from 'react'

interface HeaderProps {
  backendConnected: boolean | null
  isCheckingHealth: boolean
  onRetryConnection: () => void
  isDemoMode: boolean
}

export const Header: React.FC<HeaderProps> = ({
  backendConnected,
  isCheckingHealth,
  onRetryConnection,
  isDemoMode,
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo" aria-hidden="true">
          🎓
        </div>
        <div className="header-titles">
          <h1>Tutor de Estudos com IA</h1>
          <p className="header-subtitle">
            Plataforma educacional para tirar dúvidas, aprender passo a passo e exercitar
          </p>
        </div>
      </div>

      <div className="header-status-area">
        {isDemoMode && (
          <span className="status-badge demo" title="O sistema está operando em modo de demonstração identificado">
            <span className="status-dot demo-dot"></span>
            Modo Demonstração
          </span>
        )}

        {isCheckingHealth ? (
          <span className="status-badge checking">
            <span className="status-dot checking-dot"></span>
            Verificando API...
          </span>
        ) : backendConnected === true ? (
          <span className="status-badge online" title="Backend FastAPI respondendo normalmente">
            <span className="status-dot online-dot"></span>
            API Conectada
          </span>
        ) : backendConnected === false ? (
          <button
            type="button"
            className="status-badge offline-btn"
            onClick={onRetryConnection}
            title="Clique para tentar reconectar ao backend"
          >
            <span className="status-dot offline-dot"></span>
            Backend Desconectado (Tentar de novo)
          </button>
        ) : null}
      </div>
    </header>
  )
}
