import React, { useRef, useEffect } from 'react'

interface ChatInputProps {
  input: string
  onChange: (val: string) => void
  onSend: () => void
  isLoading: boolean
  disabled?: boolean
  selectedSubject: string
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onChange,
  onSend,
  isLoading,
  disabled = false,
  selectedSubject,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Ajusta altura do textarea automaticamente até um limite razoável
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && !isLoading && input.trim()) {
        onSend()
      }
    }
  }

  const charCount = input.length
  const maxChars = 2000

  return (
    <footer className="chat-input-container">
      <form
        className="chat-input-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!disabled && !isLoading && input.trim()) {
            onSend()
          }
        }}
      >
        <div className="input-field-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder={`Digite sua dúvida sobre ${selectedSubject}... (Pressione Enter para enviar, Shift+Enter para nova linha)`}
            value={input}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            rows={1}
            maxLength={maxChars}
            aria-label="Campo para digitar a pergunta"
          />

          <div className="input-meta-bar">
            <span className={`char-counter ${charCount > maxChars * 0.9 ? 'limit-warning' : ''}`}>
              {charCount} / {maxChars}
            </span>
            <span className="keyboard-tip">Pressione ↵ Enter para enviar</span>
          </div>
        </div>

        <button
          type="submit"
          className="send-button"
          disabled={disabled || isLoading || !input.trim()}
          aria-label="Enviar pergunta"
        >
          {isLoading ? (
            <span className="spinner-indicator" aria-hidden="true">
              ⏳
            </span>
          ) : (
            <span className="send-icon" aria-hidden="true">
              ➤
            </span>
          )}
          <span className="send-text">{isLoading ? 'Processando...' : 'Enviar'}</span>
        </button>
      </form>
    </footer>
  )
}
