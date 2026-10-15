import { useState, useEffect, useRef } from 'react'
import type { ChatMessage, Subject } from './types'
import { checkBackendHealth, fetchSubjects, sendChatMessage } from './services/api'
import { Header } from './components/Header'
import { SubjectSelector } from './components/SubjectSelector'
import { ChatMessageBubble } from './components/ChatMessageBubble'
import { WelcomePrompt } from './components/WelcomePrompt'
import { ChatInput } from './components/ChatInput'
import { LoadingIndicator } from './components/LoadingIndicator'
import { ErrorAlert } from './components/ErrorAlert'
import './App.css'

const FALLBACK_SUBJECTS: Subject[] = [
  {
    id: 'programacao',
    name: 'Programação',
    icon: '💻',
    description: 'Lógica, algoritmos, Python, estruturas de dados e desenvolvimento web',
  },
  {
    id: 'matematica',
    name: 'Matemática',
    icon: '📐',
    description: 'Cálculo diferencial e integral, álgebra linear, geometria e estatística',
  },
  {
    id: 'fisica',
    name: 'Física',
    icon: '⚛️',
    description: 'Mecânica clássica, eletromagnetismo, termodinâmica e ótica',
  },
  {
    id: 'quimica',
    name: 'Química',
    icon: '🧪',
    description: 'Estequiometria, ligações químicas, termoquímica e química orgânica',
  },
  {
    id: 'engenharia',
    name: 'Engenharia e Hardware',
    icon: '⚡',
    description: 'Circuitos elétricos, arquitetura de computadores e sistemas digitais',
  },
  {
    id: 'geral',
    name: 'Geral / Metodologia',
    icon: '📚',
    description: 'Técnicas de estudo, organização de rotina e dúvidas multidisciplinares',
  },
]

export function App() {
  const [subjects, setSubjects] = useState<Subject[]>(FALLBACK_SUBJECTS)
  const [selectedSubject, setSelectedSubject] = useState<string>('Programação')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Rolagem suave até a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Verificação inicial de saúde do backend e carregamento de matérias
  const testConnection = async () => {
    setIsCheckingHealth(true)
    try {
      await checkBackendHealth()
      setBackendConnected(true)
      setErrorMessage(null)

      // Carrega lista oficial de matérias da API
      try {
        const fetched = await fetchSubjects()
        if (fetched && fetched.length > 0) {
          setSubjects(fetched)
        }
      } catch {
        // Mantém as matérias locais de fallback se a rota falhar
      }
    } catch (err: unknown) {
      setBackendConnected(false)
      const msg = err instanceof Error ? err.message : 'Backend offline'
      setErrorMessage(`Aviso: ${msg}`)
    } finally {
      setIsCheckingHealth(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? input).trim()
    if (!textToSend || isLoading) return

    const now = new Date()
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: formattedTime,
      subject: selectedSubject,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await sendChatMessage(textToSend, selectedSubject)

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: response.subject,
        isDemo: response.is_demo,
        provider: response.provider,
      }

      setMessages((prev) => [...prev, tutorMsg])
      setIsDemoMode(response.is_demo)
      setBackendConnected(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha desconhecida na comunicação.'
      setErrorMessage(msg)
      setBackendConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    if (window.confirm('Deseja limpar todo o histórico desta conversa?')) {
      setMessages([])
      setErrorMessage(null)
    }
  }

  return (
    <div className="app-container">
      <Header
        backendConnected={backendConnected}
        isCheckingHealth={isCheckingHealth}
        onRetryConnection={testConnection}
        isDemoMode={isDemoMode}
      />

      <main className="main-content">
        <SubjectSelector
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
          disabled={isLoading}
        />

        <ErrorAlert
          error={errorMessage}
          onDismiss={() => setErrorMessage(null)}
          onRetry={testConnection}
        />

        <div className="chat-window-wrapper">
          <div className="chat-toolbar">
            <span className="chat-toolbar-info">
              Conversando sobre: <strong>{selectedSubject}</strong> ({messages.length}{' '}
              {messages.length === 1 ? 'mensagem' : 'mensagens'})
            </span>

            {messages.length > 0 && (
              <button
                type="button"
                className="clear-chat-btn"
                onClick={handleClearChat}
                disabled={isLoading}
                title="Limpar mensagens da tela"
              >
                🗑️ Limpar conversa
              </button>
            )}
          </div>

          <div className="messages-scroll-area">
            {messages.length === 0 ? (
              <WelcomePrompt
                currentSubject={selectedSubject}
                onSelectSuggestion={(suggestion) => handleSend(suggestion)}
              />
            ) : (
              messages.map((msg) => <ChatMessageBubble key={msg.id} message={msg} />)
            )}

            {isLoading && <LoadingIndicator subject={selectedSubject} />}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            input={input}
            onChange={setInput}
            onSend={() => handleSend()}
            isLoading={isLoading}
            selectedSubject={selectedSubject}
          />
        </div>
      </main>
    </div>
  )
}

export default App
