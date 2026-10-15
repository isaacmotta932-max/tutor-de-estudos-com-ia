import React, { useState } from 'react'
import type { ChatMessage } from '../types'
import { FormattedContent } from './FormattedContent'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false)
  const isUser = message.sender === 'user'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback simples
    }
  }

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'tutor-row'}`}>
      <div className={`message-avatar ${isUser ? 'user-avatar' : 'tutor-avatar'}`} aria-hidden="true">
        {isUser ? '🧑‍🎓' : '🤖'}
      </div>

      <div className={`message-bubble ${isUser ? 'user-bubble' : 'tutor-bubble'}`}>
        <div className="message-header-meta">
          <span className="message-author">{isUser ? 'Você' : 'Tutor com IA'}</span>
          {message.subject && (
            <span className="message-subject-badge">{message.subject}</span>
          )}
          {message.isDemo && (
            <span className="demo-indicator-pill">Demonstração</span>
          )}
          <span className="message-time">{message.timestamp}</span>
        </div>

        <div className="message-body">
          {isUser ? (
            <p className="user-text">{message.text}</p>
          ) : (
            <FormattedContent content={message.text} />
          )}
        </div>

        {!isUser && (
          <div className="message-footer-actions">
            <button
              type="button"
              className="copy-button"
              onClick={handleCopy}
              title="Copiar explicação"
            >
              {copied ? '✓ Copiado!' : '📋 Copiar'}
            </button>
            {message.provider && (
              <span className="provider-tag">Provedor: {message.provider}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
