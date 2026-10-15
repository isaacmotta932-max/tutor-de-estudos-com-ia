# Tutor de Estudos com IA 🎓

Plataforma web educacional desenvolvida como projeto de portfólio para **Engenharia da Computação**. O sistema permite que estudantes conversem com um tutor virtual inteligente, selecionem matérias acadêmicas, tirem dúvidas conceituais e acompanhem resoluções passo a passo.

---

## 🚀 Status do Projeto: MVP Funcional Concluído (Fase 1)

A primeira etapa do projeto está implementada e testada, com **Frontend e Backend 100% integrados**, comunicação via API REST e arquitetura modular para provedores de inteligência artificial.

### O que está funcionando:
1. **Interface Moderna e Responsiva (React + TypeScript + Vite):**
   - Seletor interativo de matérias (Programação, Matemática, Física, Química, Engenharia e Geral).
   - Área de conversa em tempo real com balões distintos para estudante e tutor.
   - Formatação didática com suporte a títulos, destaques em negrito, tópicos e citações.
   - Indicador visual de digitação ("Tutor pensando...").
   - Badge de status da API em tempo real (Conectado / Desconectado / Modo Demonstração).
   - Sugestões rápidas de perguntas baseadas na matéria selecionada.
   - Botão para copiar resposta e botão para limpar conversa.
   - Tratamento amigável de falhas de conexão com opção de retry.

2. **Backend Estruturado (Python 3.11 + FastAPI):**
   - Rota de verificação de integridade: `GET /api/health`.
   - Rota de listagem de disciplinas: `GET /api/subjects`.
   - Rota de atendimento educacional: `POST /api/chat`.
   - Validação de dados rigorosa com Pydantic (bloqueio de mensagens vazias e limites de caracteres).
   - Suporte a CORS configurado para integração local com o Vite.
   - Suíte de testes automatizados com Pytest.

3. **Arquitetura Desacoplada de Inteligência Artificial:**
   - **Provedor de Demonstração (`DemoAIProvider`):** Ativo quando nenhuma chave de API externa está configurada. Confirma com clareza o funcionamento do fluxo frontend-backend sem simular falsas respostas de IA.
   - **Provedor Gemini (`GeminiAIProvider`):** Integração pronta via HTTPS (`httpx`) com a Google Gemini API (modelo `gemini-2.5-flash`), sem necessidade de executar modelos pesados localmente no computador (ideal para máquinas com 8 GB de RAM).

---

## 🏗️ Arquitetura e Estrutura de Pastas

```text
Projeto Agente Colt/
├── backend/
│   ├── app/
│   │   ├── api/             # Rotas HTTP (health, subjects, chat)
│   │   ├── core/            # Configurações e leitura de variáveis de ambiente
│   │   ├── schemas/         # Modelos de validação Pydantic (Request/Response)
│   │   ├── services/        # Lógica do Tutor e provedores de IA (Base, Demo, Gemini)
│   │   └── main.py          # Ponto de entrada FastAPI e middlewares CORS
│   ├── tests/               # Testes automatizados com Pytest
│   ├── .env.example         # Modelo de configuração de variáveis
│   ├── pytest.ini           # Configurações do Pytest
│   └── requirements.txt     # Dependências Python
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React (Header, Chat, SubjectSelector, etc.)
│   │   ├── services/        # Cliente HTTP para comunicação com a API
│   │   ├── types/           # Interfaces TypeScript compartilhadas
│   │   ├── App.tsx          # Gerenciamento de estado e fluxo da interface
│   │   ├── App.css          # Estilos modernos, responsivos e tema escuro
│   │   ├── index.css        # Variáveis globais de design e reset
│   │   └── main.tsx         # Ponto de entrada React
│   ├── package.json         # Dependências e scripts npm
│   └── vite.config.ts       # Configuração do Vite e proxy reverso local
│
├── .gitignore               # Proteção contra envio de arquivos sensíveis e caches
└── README.md                # Documentação do projeto
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Vite.
- **Backend:** Python 3.11, FastAPI, Uvicorn, Pydantic, HTTPX.
- **Testes:** Pytest.
- **IA:** Google Gemini API (modo remoto) com fallback para Modo Demonstração.
- **Controle de Versão:** Git e GitHub.

---

## 💻 Como Executar o Projeto Localmente

Abra dois terminais no Windows (PowerShell): um para o **backend** e outro para o **frontend**.

### 1. Executando o Backend (FastAPI)

No primeiro terminal:

```powershell
cd backend

# Crie e ative o ambiente virtual (se ainda não tiver criado):
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Se o Windows bloquear o script de ativação, execute antes:
# Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# Instale as dependências:
pip install -r requirements.txt

# Inicie o servidor:
python -m uvicorn app.main:app --reload --port 8000
```

- A API estará disponível em: `http://127.0.0.1:8000/api/health`
- Documentação interativa Swagger: `http://127.0.0.1:8000/docs`

#### Executando os testes do Backend:

Com o ambiente virtual ativado na pasta `backend`:

```powershell
pytest
```

---

### 2. Executando o Frontend (React + Vite)

No segundo terminal:

```powershell
cd frontend

# Instale os pacotes (apenas na primeira vez):
npm install

# Inicie o servidor de desenvolvimento:
npm run dev
```

Abra o navegador no endereço indicado (normalmente `http://localhost:5173`).

---

## 🔑 Como Ativar Respostas Reais do Google Gemini (Opcional)

Por padrão, a aplicação inicia em **Modo Demonstração**, permitindo testar toda a interface e fluxo de rede sem gastar cotas ou precisar de cadastro.

Para ativar as respostas didáticas geradas pela IA do Google:

1. Obtenha uma chave gratuita no [Google AI Studio](https://aistudio.google.com/apikey) (não requer plano pago).
2. Na pasta `backend/`, copie o arquivo `.env.example` para `.env`:
   ```powershell
   copy .env.example .env
   ```
3. Abra `backend/.env` e insira sua chave:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```
4. Reinicie o servidor FastAPI. O Tutor passará a responder utilizando o modelo `gemini-2.5-flash`.

> **Segurança:** O arquivo `.env` está explicitamente ignorado pelo `.gitignore` e **nunca** é enviado para o GitHub.

---

## 🗺️ Próximos Passos Planejados

- [ ] Persistência de histórico de conversas no banco de dados SQLite.
- [ ] Módulo de geração de exercícios com correção interativa.
- [ ] Exportação de resumo dos estudos em Markdown ou texto simples.
- [ ] Acompanhamento de progresso de estudo por disciplina.

---

## 📄 Licença

Projeto desenvolvido para fins educacionais e acadêmicos.
