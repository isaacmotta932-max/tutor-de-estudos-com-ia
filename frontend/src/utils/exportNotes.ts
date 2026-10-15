import type { ChatMessage } from '../types'

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 30) || 'caderno_estudos'
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportNotesAsMarkdown(
  title: string,
  subject: string,
  messages: ChatMessage[]
): void {
  const now = new Date().toLocaleString()
  const lines: string[] = [
    `# 🎓 Caderno de Estudos: ${title}`,
    `- **Disciplina:** ${subject}`,
    `- **Data de Exportação:** ${now}`,
    `- **Total de Mensagens:** ${messages.length}`,
    '',
    '---',
    '',
    '## 💬 Histórico da Sessão',
    '',
  ]

  for (const msg of messages) {
    const role = msg.sender === 'user' ? '👤 Estudante' : '🤖 Tutor IA'
    lines.push(`### ${role} (${msg.timestamp})`)
    lines.push('')
    lines.push(msg.text.trim())
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  lines.push('*Caderno exportado pelo Tutor de Estudos com IA - Projeto Agente Colt*')

  const filename = `estudos_${slugify(title)}.md`
  triggerDownload(lines.join('\n'), filename, 'text/markdown')
}

export function exportNotesAsTxt(
  title: string,
  subject: string,
  messages: ChatMessage[]
): void {
  const now = new Date().toLocaleString()
  const sep = '='.repeat(60)
  const lines: string[] = [
    sep,
    ` CADERNO DE ESTUDOS: ${title.toUpperCase()}`,
    ` DISCIPLINA: ${subject.toUpperCase()}`,
    ` DATA DE EXPORTAÇÃO: ${now}`,
    ` TOTAL DE MENSAGENS: ${messages.length}`,
    sep,
    '',
  ]

  for (const msg of messages) {
    const role = msg.sender === 'user' ? 'ESTUDANTE' : 'TUTOR'
    lines.push(`[${role} - ${msg.timestamp}]`)
    lines.push(msg.text.trim())
    lines.push('-'.repeat(40))
    lines.push('')
  }

  lines.push('Caderno exportado pelo Tutor de Estudos com IA - Projeto Agente Colt')

  const filename = `estudos_${slugify(title)}.txt`
  triggerDownload(lines.join('\n'), filename, 'text/plain')
}
