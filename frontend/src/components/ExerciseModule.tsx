import { useState, useEffect, useCallback } from 'react'
import type { DifficultyLevel, Exercise, ExerciseEvaluateResponse } from '../types'
import { evaluateExercise, generateExercise } from '../services/api'
import { FormattedContent } from './FormattedContent'

interface ExerciseModuleProps {
  selectedSubject: string
  onError: (message: string) => void
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function ExerciseModule({ selectedSubject, onError }: ExerciseModuleProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediário')
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [evaluation, setEvaluation] = useState<ExerciseEvaluateResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)

  // Estatísticas de desempenho do estudante
  const [stats, setStats] = useState({
    totalAnswered: 0,
    correctCount: 0,
    totalScore: 0,
  })

  // Gera um novo exercício
  const handleGenerate = useCallback(
    async (targetDifficulty: DifficultyLevel = difficulty) => {
      setIsLoading(true)
      setSelectedOption(null)
      setEvaluation(null)

      try {
        const data = await generateExercise(selectedSubject, targetDifficulty)
        setExercise(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Falha ao gerar o exercício.'
        onError(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedSubject, difficulty, onError]
  )

  // Gera automaticamente um exercício ao montar ou trocar de matéria
  useEffect(() => {
    handleGenerate(difficulty)
  }, [selectedSubject, handleGenerate, difficulty])

  const handleSelectOption = (index: number) => {
    if (evaluation) return // Bloqueia troca de opção após envio
    setSelectedOption(index)
  }

  const handleSubmit = async () => {
    if (selectedOption === null || !exercise || isEvaluating) return

    setIsEvaluating(true)
    try {
      const result = await evaluateExercise(
        exercise.id,
        exercise.subject,
        selectedOption,
        exercise.correct_option_index,
        exercise.explanation
      )
      setEvaluation(result)

      setStats((prev) => ({
        totalAnswered: prev.totalAnswered + 1,
        correctCount: prev.correctCount + (result.is_correct ? 1 : 0),
        totalScore: prev.totalScore + result.score_points,
      }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao avaliar resposta.'
      onError(msg)
    } finally {
      setIsEvaluating(false)
    }
  }

  const accuracy =
    stats.totalAnswered > 0 ? Math.round((stats.correctCount / stats.totalAnswered) * 100) : 0

  return (
    <div className="exercise-module-container">
      {/* Barra de Controles e Dificuldade */}
      <div className="exercise-toolbar">
        <div className="exercise-difficulty-group">
          <span className="exercise-label">Dificuldade:</span>
          {(['Iniciante', 'Intermediário', 'Avançado'] as DifficultyLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              className={`difficulty-pill ${difficulty === level ? 'active' : ''}`}
              onClick={() => {
                setDifficulty(level)
                handleGenerate(level)
              }}
              disabled={isLoading || isEvaluating}
            >
              {level}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="generate-new-exercise-btn"
          onClick={() => handleGenerate(difficulty)}
          disabled={isLoading || isEvaluating}
          title="Gerar uma nova questão diferente"
        >
          {isLoading ? '⏳ Gerando...' : '🎲 Nova Questão'}
        </button>
      </div>

      {/* Placar de Progresso do Aluno */}
      <div className="exercise-stats-bar">
        <div className="stat-item">
          <span className="stat-label">Respondidos</span>
          <span className="stat-value">{stats.totalAnswered}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Acertos</span>
          <span className="stat-value correct-value">
            {stats.correctCount} ({accuracy}%)
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pontuação</span>
          <span className="stat-value score-value">⭐ {stats.totalScore} pts</span>
        </div>
      </div>

      {/* Conteúdo da Questão */}
      {isLoading ? (
        <div className="exercise-loading-box">
          <span className="spinner-icon">🔄</span>
          <p>Preparando desafio didático para <strong>{selectedSubject}</strong>...</p>
        </div>
      ) : exercise ? (
        <div className="exercise-card">
          <div className="exercise-card-header">
            <span className="exercise-topic-badge">📌 {exercise.topic}</span>
            <span className="exercise-level-badge">{exercise.difficulty}</span>
            {exercise.is_demo ? (
              <span className="exercise-provider-badge demo">Modo Demo</span>
            ) : (
              <span className="exercise-provider-badge ai">Gerado por IA</span>
            )}
          </div>

          <div className="exercise-statement">
            <FormattedContent content={exercise.question} />
          </div>

          {/* Lista de Alternativas */}
          <div className="exercise-options-list">
            {exercise.options.map((option, idx) => {
              const isSelected = selectedOption === idx
              const isCorrectOption = exercise.correct_option_index === idx
              const hasEvaluated = evaluation !== null

              let optionClass = 'option-button'
              if (isSelected) optionClass += ' selected'

              if (hasEvaluated) {
                if (isCorrectOption) {
                  optionClass += ' correct'
                } else if (isSelected && !isCorrectOption) {
                  optionClass += ' wrong'
                } else {
                  optionClass += ' dimmed'
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={optionClass}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasEvaluated || isEvaluating}
                >
                  <span className="option-letter">{OPTION_LETTERS[idx] || idx + 1}</span>
                  <span className="option-text">{option}</span>
                  {hasEvaluated && isCorrectOption && <span className="option-mark">✅</span>}
                  {hasEvaluated && isSelected && !isCorrectOption && (
                    <span className="option-mark">❌</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Botão de Enviar Resposta */}
          {!evaluation && (
            <div className="exercise-action-row">
              <button
                type="button"
                className="submit-answer-btn"
                onClick={handleSubmit}
                disabled={selectedOption === null || isEvaluating}
              >
                {isEvaluating ? 'Avaliando...' : 'Confirmar Resposta'}
              </button>
            </div>
          )}

          {/* Resultado e Resolução Didática */}
          {evaluation && (
            <div
              className={`exercise-result-box ${
                evaluation.is_correct ? 'result-success' : 'result-failure'
              }`}
            >
              <div className="result-header">
                <h3>{evaluation.feedback}</h3>
              </div>

              <div className="result-explanation">
                <h4>💡 Resolução Didática e Explicação:</h4>
                <FormattedContent content={evaluation.explanation} />
              </div>

              <div className="result-actions">
                <button
                  type="button"
                  className="next-exercise-btn"
                  onClick={() => handleGenerate(difficulty)}
                >
                  Próxima Questão ➔
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="exercise-empty-box">
          <p>Nenhum exercício carregado no momento.</p>
          <button
            type="button"
            className="submit-answer-btn"
            onClick={() => handleGenerate(difficulty)}
          >
            Começar Exercício
          </button>
        </div>
      )}
    </div>
  )
}
