import { useState, useEffect, useRef } from 'react'
import type { ChatMessage, SessionSummary, Subject } from './types'
import {
  checkBackendHealth,
  deleteSession,
  fetchSessionDetail,
  fetchSessions,
  fetchSubjects,
  sendChatMessage,
} from './services/api'
import { Header } from './components/Header'
import { SubjectSelector } from './components/SubjectSelector'
import { ChatMessageBubble } from './components/ChatMessageBubble'
import { WelcomePrompt } from './components/WelcomePrompt'
import { ChatInput } from './components/ChatInput'
import { LoadingIndicator } from './components/LoadingIndicator'
import { ErrorAlert } from './components/ErrorAlert'
import { SessionsSidebar } from './components/SessionsSidebar'
import { ExerciseModule } from './components/ExerciseModule'
import { exportNotesAsMarkdown, exportNotesAsTxt } from './utils/exportNotes'
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

  // Estados de persistência SQLite
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  // Aba ativa: Chat ou Exercícios
  const [activeTab, setActiveTab] = useState<'chat' | 'exercises'>('chat')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Rolagem suave até a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Carrega lista de sessões do backend
  const loadSessions = async () => {
    try {
      const data = await fetchSessions()
      setSessions(data)
    } catch {
      // Ignora erro silencioso de listagem se offline
    }
  }

  // Verificação inicial de saúde do backend, carregamento de matérias e sessões
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

      // Carrega histórico de sessões salvas no SQLite
      await loadSessions()
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

  // Seleciona e carrega uma sessão existente do banco de dados
  const handleSelectSession = async (sessionId: string) => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const detail = await fetchSessionDetail(sessionId)

      const convertedMessages: ChatMessage[] = detail.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp,
        subject: m.subject,
        isDemo: m.is_demo,
        provider: m.provider,
      }))

      setMessages(convertedMessages)
      setSelectedSubject(detail.subject)
      setCurrentSessionId(detail.id)
      setIsSidebarOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar a conversa.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Inicia uma nova conversa limpa
  const handleNewSession = () => {
    setMessages([])
    setCurrentSessionId(null)
    setErrorMessage(null)
    setIsSidebarOpen(false)
  }

  // Exclui uma sessão do banco SQLite
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))

      if (currentSessionId === sessionId) {
        setMessages([])
        setCurrentSessionId(null)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao excluir a sessão.'
      setErrorMessage(msg)
    }
  }

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
      const response = await sendChatMessage(textToSend, selectedSubject, currentSessionId)

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

      // Atualiza o session_id ativo e sincroniza a lista de sessões salvas
      if (response.session_id) {
        setCurrentSessionId(response.session_id)
        await loadSessions()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha desconhecida na comunicação.'
      setErrorMessage(msg)
      setBackendConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const currentSession = sessions.find((s) => s.id === currentSessionId)

  return (
    <div className="app-container">
      <SessionsSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      <Header
        backendConnected={backendConnected}
        isCheckingHealth={isCheckingHealth}
        onRetryConnection={testConnection}
        isDemoMode={isDemoMode}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        sessionCount={sessions.length}
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

        {/* Barra de Navegação entre Chat e Exercícios */}
        <div className="tab-navigation-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Conversar com o Tutor
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercises')}
          >
            📝 Exercícios de Fixação
          </button>
        </div>

        {activeTab === 'chat' ? (
          <div className="chat-window-wrapper">
            <div className="chat-toolbar">
              <span className="chat-toolbar-info">
                {currentSession ? (
                  <>
                    Conversa: <strong>{currentSession.title}</strong> &bull; Matéria:{' '}
                    <strong>{selectedSubject}</strong> ({messages.length}{' '}
                    {messages.length === 1 ? 'mensagem' : 'mensagens'})
                  </>
                ) : (
                  <>
                    Nova conversa sobre: <strong>{selectedSubject}</strong> ({messages.length}{' '}
                    {messages.length === 1 ? 'mensagem' : 'mensagens'})
                  </>
                )}
              </span>

              <div className="chat-toolbar-actions">
                <button
                  type="button"
                  className="new-chat-toolbar-btn"
                  onClick={handleNewSession}
                  disabled={isLoading && messages.length === 0}
                  title="Começar uma nova conversa de estudos"
                >
                  ✨ Nova conversa
                </button>

                {messages.length > 0 && (
                  <>
                    <button
                      type="button"
                      className="export-toolbar-btn"
                      onClick={() =>
                        exportNotesAsMarkdown(
                          currentSession?.title || `Estudos de ${selectedSubject}`,
                          selectedSubject,
                          messages
                        )
                      }
                      disabled={isLoading}
                      title="Baixar caderno de estudos formatado em Markdown (.md)"
                    >
                      📄 Baixar .MD
                    </button>

                    <button
                      type="button"
                      className="export-toolbar-btn"
                      onClick={() =>
                        exportNotesAsTxt(
                          currentSession?.title || `Estudos de ${selectedSubject}`,
                          selectedSubject,
                          messages
                        )
                      }
                      disabled={isLoading}
                      title="Baixar caderno de estudos em texto puro (.txt)"
                    >
                      📝 Baixar .TXT
                    </button>

                    <button
                      type="button"
                      className="clear-chat-btn"
                      onClick={handleNewSession}
                      disabled={isLoading}
                      title="Limpar mensagens da tela e iniciar nova"
                    >
                      🗑️ Limpar
                    </button>
                  </>
                )}
              </div>
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
        ) : (
          <ExerciseModule
            selectedSubject={selectedSubject}
            onError={(msg) => setErrorMessage(msg)}
          />
        )}
      </main>
    </div>
  )
}

export default App
