import React from 'react'

interface WelcomePromptProps {
  currentSubject: string
  onSelectSuggestion: (question: string) => void
}

const SUGGESTIONS_BY_SUBJECT: Record<string, string[]> = {
  programação: [
    'O que é recursão e como posso usá-la com um exemplo prático?',
    'Qual a diferença entre listas e tuplas em Python?',
    'Como funciona a busca binária e qual a sua complexidade?',
  ],
  matemática: [
    'Como resolver uma equação do 2º grau passo a passo?',
    'O que representa a derivada de uma função graficamente?',
    'Explique o Teorema de Pitágoras com uma aplicação do dia a dia.',
  ],
  física: [
    'Qual é a diferença entre massa e peso segundo a mecânica de Newton?',
    'O que diz a 1ª Lei da Termodinâmica e como ela se aplica?',
    'Como funciona o efeito Doppler em ondas sonoras?',
  ],
  química: [
    'O que é estequiometria e como balancear uma reação química?',
    'Qual a diferença entre ligação iônica e ligação covalente?',
    'O que define o pH de uma solução aquosa?',
  ],
  'engenharia e hardware': [
    'Qual a diferença entre a Lei de Ohm e a Lei das Malhas de Kirchhoff?',
    'O que é uma porta lógica AND e como construir sua tabela-verdade?',
    'Como a memória RAM se comunica com a CPU do computador?',
  ],
  'geral / metodologia': [
    'Quais técnicas práticas posso usar para revisar matérias de exatas?',
    'O que é o método de estudos Feynman e como aplicá-lo?',
    'Como organizar meu tempo para provas usando blocos de estudo?',
  ],
}

export const WelcomePrompt: React.FC<WelcomePromptProps> = ({
  currentSubject,
  onSelectSuggestion,
}) => {
  const normalized = currentSubject.toLowerCase()
  const suggestions =
    SUGGESTIONS_BY_SUBJECT[normalized] || SUGGESTIONS_BY_SUBJECT['geral / metodologia']

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-icon">👋</div>
        <h2>Olá! Sou o seu Tutor de Estudos</h2>
        <p>
          Estou pronto para ajudar você a entender conceitos difíceis, resolver problemas passo a
          passo e praticar exercícios na matéria de <strong>{currentSubject}</strong>.
        </p>

        <div className="suggestions-section">
          <span className="suggestions-title">💡 Sugestões de perguntas para começar:</span>
          <div className="suggestions-grid">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                className="suggestion-chip"
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <span className="chip-arrow">→</span>
                <span className="chip-text">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
