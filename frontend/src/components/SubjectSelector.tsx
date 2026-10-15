import React from 'react'
import type { Subject } from '../types'

interface SubjectSelectorProps {
  subjects: Subject[]
  selectedSubject: string
  onSelectSubject: (subjectName: string) => void
  disabled?: boolean
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  disabled = false,
}) => {
  const currentSubjectObj = subjects.find(
    (s) => s.name.toLowerCase() === selectedSubject.toLowerCase()
  )

  return (
    <section className="subject-section" aria-label="Seleção de disciplina">
      <div className="subject-header">
        <span className="subject-label">Escolha a matéria para estudar:</span>
        {currentSubjectObj && (
          <span className="subject-description">{currentSubjectObj.description}</span>
        )}
      </div>

      <div className="subject-pills-container" role="radiogroup" aria-label="Matérias disponíveis">
        {subjects.map((sub) => {
          const isSelected = sub.name.toLowerCase() === selectedSubject.toLowerCase()
          return (
            <button
              key={sub.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              className={`subject-pill ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectSubject(sub.name)}
            >
              <span className="pill-icon">{sub.icon}</span>
              <span className="pill-name">{sub.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
