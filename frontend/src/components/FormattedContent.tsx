import React from 'react'

interface FormattedContentProps {
  content: string
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ content }) => {
  // Processamento simples e seguro de markdown educacional
  const renderLine = (line: string, index: number) => {
    // Título H3
    if (line.startsWith('### ')) {
      return (
        <h4 key={index} className="text-h4">
          {line.replace('### ', '')}
        </h4>
      )
    }
    // Título H2
    if (line.startsWith('## ')) {
      return (
        <h3 key={index} className="text-h3">
          {line.replace('## ', '')}
        </h3>
      )
    }
    // Blockquote
    if (line.startsWith('> ')) {
      return (
        <blockquote key={index} className="quote-block">
          {formatInline(line.replace('> ', ''))}
        </blockquote>
      )
    }
    // Lista com bullets
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={index} className="list-item">
          {formatInline(line.substring(2))}
        </li>
      )
    }
    // Lista numerada
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/)
    if (numberedMatch) {
      return (
        <li key={index} className="list-item-numbered" value={parseInt(numberedMatch[1], 10)}>
          {formatInline(numberedMatch[2])}
        </li>
      )
    }
    // Linha vazia (espaçador)
    if (!line.trim()) {
      return <div key={index} className="line-break" />
    }
    // Parágrafo comum
    return (
      <p key={index} className="text-paragraph">
        {formatInline(line)}
      </p>
    )
  }

  // Formatação inline (negrito, itálico, código)
  const formatInline = (text: string): React.ReactNode => {
    // Divide por código inline `...`
    const codeParts = text.split(/(`[^`]+`)/g)
    return codeParts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={pIdx} className="inline-code">
            {part.slice(1, -1)}
          </code>
        )
      }
      // Processa negrito **...**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
          return <strong key={`${pIdx}-${bIdx}`}>{bPart.slice(2, -2)}</strong>
        }
        // Processa itálico *...*
        const italicParts = bPart.split(/(\*[^*]+\*)/g)
        return italicParts.map((iPart, iIdx) => {
          if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
            return <em key={`${pIdx}-${bIdx}-${iIdx}`}>{iPart.slice(1, -1)}</em>
          }
          return iPart
        })
      })
    })
  }

  const lines = content.split('\n')

  return <div className="formatted-text-content">{lines.map(renderLine)}</div>
}
