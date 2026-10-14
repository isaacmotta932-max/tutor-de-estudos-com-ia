# Tutor de Estudos com IA

Plataforma web educacional em que um estudante escolhe uma matéria, faz perguntas em linguagem natural e recebe explicações didáticas de um tutor virtual.

Este repositório documenta o desenvolvimento do projeto, etapa por etapa, para estudo e portfólio.

## Objetivo do MVP

Uma aplicação local com:

1. Interface web em React
2. API em FastAPI
3. Um modelo de IA **remoto** (não instalado no computador)
4. Resposta didática na tela, com erros tratados de forma clara

## Decisão de arquitetura: por que não usar modelo local

A ideia inicial era o [Ollama](https://ollama.com) rodando um modelo no PC. Isso foi **descartado para o MVP** porque o computador tem memória limitada (16 GB) e o Cursor, o navegador e o Windows já ocupam uma parte relevante dessa RAM.

**O que muda na prática**

| Abordagem | Onde o modelo roda | Impacto na RAM do PC |
|---|---|---|
| Ollama local | No seu computador | Alto (o modelo inteiro fica na memória) |
| API remota | Nos servidores do provedor | Baixo (só enviamos texto e recebemos texto) |

A integração com a IA continuará isolada em um módulo do backend (`services/`). Trocar de provedor depois não deve exigir reescrever a interface React.

## Provedor de IA do MVP: Gemini (faixa gratuita)

Recomendação atual: **Google Gemini API**, modelo **`gemini-3.5-flash-lite`**.

Motivos (verificados em outubro de 2026):

- A [página oficial de preços](https://ai.google.dev/gemini-api/docs/pricing) lista tokens de entrada e saída **gratuitos** no Free Tier para este modelo.
- A [documentação de modelos](https://ai.google.dev/gemini-api/docs/models) indica `gemini-3.5-flash-lite` ou `gemini-3.8-flash` para projetos novos.
- Não exige baixar gigabytes de modelo nem GPU.
- Serve bem para conversas em português no MVP.

**Avisos importantes (não ignore)**

- Isso **não é uma garantia permanente de gratuidade**. Cotas, modelos e termos mudam. Sempre consulte a documentação oficial antes de assumir que continua de graça.
- No Free Tier, a Google indica que o conteúdo **pode ser usado para melhorar os produtos dela**. Não envie dados pessoais, notas escolares identificáveis ou material confidencial.
- Não cadastre cartão nem ative plano pago sem autorização explícita. O Free Tier **não exige conta de faturamento** para começar, segundo a [documentação de billing](https://ai.google.dev/gemini-api/docs/billing).
- A chave da API fica só no arquivo `.env` local, **nunca** no código nem no GitHub.

**Alternativa avaliada e recusada:** GitHub Models foi **descontinuado em 30 de julho de 2026** ([changelog oficial](https://github.blog/changelog/2026-07-30-github-models-is-now-retired/)). Não usaremos esse serviço.

**Outra alternativa (se o Gemini ficar indisponível):** Groq oferece API compatível com o formato OpenAI, com limites de requisições. Só migraríamos se necessário, porque o cliente de IA ficará isolado.

## Stack prevista

- Backend: Python 3.11, FastAPI, Pydantic, Pytest
- Frontend: React, TypeScript, Vite
- Banco: nenhum no MVP (contexto da conversa na sessão)
- IA: Gemini via HTTPS, chave em `.env`
- Versionamento: Git + GitHub

## Estrutura prevista (ainda não implementada)

```
backend/     API FastAPI + cliente isolado da IA
frontend/    Interface React
```

O código da aplicação ainda não está neste commit inicial. O primeiro objetivo do repositório é registrar as decisões e o progresso.

## Como o Git entra nisso

O Git guarda o histórico do projeto **nesta pasta**. O GitHub é a cópia remota, útil para portfólio, backup e para mostrar a evolução em entrevistas.

Arquivos sensíveis (`.env`, pastas `node_modules` e `.venv`) ficam de fora graças ao `.gitignore`.

## Próxima etapa

1. Você cria uma chave gratuita em [Google AI Studio](https://aistudio.google.com/apikey) (sem ativar faturamento).
2. Implementamos o backend FastAPI com um endpoint `/api/health`.
3. Depois ligamos o chat ao Gemini, e só então o frontend.

## Licença

Projeto educacional em desenvolvimento.
