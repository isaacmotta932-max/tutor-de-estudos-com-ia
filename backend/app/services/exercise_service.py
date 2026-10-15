import json
import logging
import random
import uuid
import httpx
from app.core.config import settings
from app.schemas.exercise import (
    DifficultyLevel,
    ExerciseEvaluateRequest,
    ExerciseEvaluateResponse,
    ExerciseGenerateRequest,
    ExerciseResponse,
)

logger = logging.getLogger(__name__)

# Banco de dados curado de exercícios didáticos para o Modo de Demonstração
DEMO_EXERCISES_POOL: dict[str, dict[str, list[dict]]] = {
    "programacao": {
        "Iniciante": [
            {
                "topic": "Fundamentos de Python",
                "question": "Em Python, qual das seguintes estruturas de dados é imutável após sua criação?",
                "options": ["Lista (list)", "Tupla (tuple)", "Dicionário (dict)", "Conjunto (set)"],
                "correct_option_index": 1,
                "explanation": "Tuplas são sequências imutáveis. Uma vez definidas (ex: `ponto = (10, 20)`), seus elementos não podem ser alterados, adicionados ou removidos.",
            },
            {
                "topic": "Lógica de Programação",
                "question": "Qual é a saída do trecho de código em Python: `print(5 // 2)`?",
                "options": ["2.5", "2", "3", "Erro de sintaxe"],
                "correct_option_index": 1,
                "explanation": "O operador `//` realiza a divisão inteira (piso), descartando a parte fracionária. 5 dividido por 2 resulta em 2.",
            },
        ],
        "Intermediário": [
            {
                "topic": "Complexidade de Algoritmos",
                "question": "Qual é a complexidade de tempo no pior caso para encontrar um elemento usando o algoritmo de Busca Binária em uma lista ordenada com N elementos?",
                "options": ["O(1)", "O(log N)", "O(N)", "O(N²)"],
                "correct_option_index": 1,
                "explanation": "A busca binária divide o espaço de busca pela metade a cada iteração, resultando em uma complexidade logarítmica O(log N).",
            },
            {
                "topic": "Estruturas de Dados",
                "question": "Qual estrutura de dados opera sob o princípio FIFO (First In, First Out)?",
                "options": ["Pilha (Stack)", "Fila (Queue)", "Árvore Binária", "Grafo"],
                "correct_option_index": 1,
                "explanation": "Uma Fila (Queue) segue a regra FIFO: o primeiro elemento inserido é obrigatoriamente o primeiro a ser removido.",
            },
        ],
        "Avançado": [
            {
                "topic": "Programação Dinâmica",
                "question": "Qual técnica consiste em armazenar em cache os resultados de chamadas de funções caras para reutilizá-los quando as mesmas entradas ocorrem novamente?",
                "options": ["Backtracking", "Memoização (Memoization)", "Divisão e Conquista", "Algoritmo Guloso"],
                "correct_option_index": 1,
                "explanation": "A memoização é uma forma de otimização top-down em programação dinâmica que salva os resultados de subproblemas em uma tabela hash ou array.",
            },
        ],
    },
    "matematica": {
        "Iniciante": [
            {
                "topic": "Funções e Álgebra",
                "question": "Dada a função f(x) = 3x - 5, qual é o valor da raiz da função (onde f(x) = 0)?",
                "options": ["x = 5/3", "x = -5/3", "x = 3/5", "x = 15"],
                "correct_option_index": 0,
                "explanation": "Para encontrar a raiz, igualamos a zero: 3x - 5 = 0 -> 3x = 5 -> x = 5/3.",
            },
        ],
        "Intermediário": [
            {
                "topic": "Cálculo Diferencial",
                "question": "Qual é a derivada da função f(x) = x³ - 4x + 7 em relação a x?",
                "options": ["f'(x) = 3x² - 4", "f'(x) = 3x² - 4x", "f'(x) = x² - 4", "f'(x) = 3x³ - 4"],
                "correct_option_index": 0,
                "explanation": "Pela regra do tombo (d/dx [x^n] = n*x^(n-1)): d/dx(x³) = 3x², d/dx(-4x) = -4 e a derivada da constante 7 é 0. Logo, f'(x) = 3x² - 4.",
            },
        ],
        "Avançado": [
            {
                "topic": "Álgebra Linear",
                "question": "Qual é o determinante da matriz 2x2: [[2, 3], [1, 4]]?",
                "options": ["5", "8", "11", "-5"],
                "correct_option_index": 0,
                "explanation": "O determinante de uma matriz [[a, b], [c, d]] é dado por (a*d - b*c). Logo: (2 * 4) - (3 * 1) = 8 - 3 = 5.",
            },
        ],
    },
    "fisica": {
        "Iniciante": [
            {
                "topic": "Cinemática",
                "question": "Um veículo percorre uma distância de 150 km em 2 horas. Qual foi a sua velocidade média?",
                "options": ["60 km/h", "75 km/h", "80 km/h", "300 km/h"],
                "correct_option_index": 1,
                "explanation": "Vm = Δs / Δt = 150 km / 2 h = 75 km/h.",
            },
        ],
        "Intermediário": [
            {
                "topic": "Dinâmica Newtoniana",
                "question": "De acordo com a 2ª Lei de Newton, qual é a força resultante necessária para acelerar uma massa de 5 kg a uma aceleração constante de 3 m/s²?",
                "options": ["15 N", "8 N", "1.67 N", "45 N"],
                "correct_option_index": 0,
                "explanation": "Fr = m * a -> Fr = 5 kg * 3 m/s² = 15 Newtons (N).",
            },
        ],
        "Avançado": [
            {
                "topic": "Eletromagnetismo",
                "question": "Qual lei da física estabelece que a força eletromotriz induzida em qualquer circuito fechado é igual ao negativo da taxa de variação no tempo do fluxo magnético que atravessa o circuito?",
                "options": ["Lei de Ampère", "Lei da Indução de Faraday", "Lei de Coulomb", "Lei de Gauss"],
                "correct_option_index": 1,
                "explanation": "A Lei de Faraday-Neumann-Lenz afirma que ε = - dΦ/dt, descrevendo como campos magnéticos variáveis no tempo induzem correntes elétricas.",
            },
        ],
    },
    "engenharia": {
        "Iniciante": [
            {
                "topic": "Circuitos Elétricos",
                "question": "Pela 1ª Lei de Ohm, se uma tensão de 12 V é aplicada a um resistor de 4 Ω, qual corrente elétrica atravessa o circuito?",
                "options": ["3 A", "48 A", "0.33 A", "8 A"],
                "correct_option_index": 0,
                "explanation": "V = R * I -> I = V / R = 12 V / 4 Ω = 3 Amperes (A).",
            },
        ],
        "Intermediário": [
            {
                "topic": "Sistemas Digitais",
                "question": "Em uma porta lógica NAND de duas entradas (A e B), qual é a única combinação que produz saída em nível lógico 0 (Falso)?",
                "options": ["A = 0 e B = 0", "A = 1 e B = 0", "A = 0 e B = 1", "A = 1 e B = 1"],
                "correct_option_index": 3,
                "explanation": "A porta NAND é o inverso da porta AND. A AND produz 1 somente quando A=1 e B=1, logo a NAND inverte para 0 exatamente quando ambas as entradas forem 1.",
            },
        ],
        "Avançado": [
            {
                "topic": "Arquitetura de Computadores",
                "question": "Qual é a principal distinção da arquitetura de Harvard em relação à arquitetura clássica de von Neumann?",
                "options": [
                    "Barramentos e memórias físicas separadas para instruções e dados",
                    "Ausência completa de memória cache",
                    "Uso obrigatório de instruções de tamanho variável",
                    "Processador de núcleo único sem registradores",
                ],
                "correct_option_index": 0,
                "explanation": "Na arquitetura de Harvard, os barramentos de instruções e dados são independentes, permitindo acessos simultâneos e evitando o gargalo de von Neumann.",
            },
        ],
    },
}


class ExerciseService:
    """Serviço responsável por gerar e avaliar exercícios interativos."""

    def __init__(self, api_key: str | None = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model
        self.api_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        )

    def _normalize_subject(self, subject: str) -> str:
        s = subject.lower().strip()
        if "prog" in s or "comput" in s or "python" in s:
            return "programacao"
        if "mat" in s or "calc" in s:
            return "matematica"
        if "fis" in s:
            return "fisica"
        if "eng" in s or "hard" in s or "circuit" in s:
            return "engenharia"
        return "programacao"

    def _get_demo_exercise(self, subject: str, difficulty: DifficultyLevel) -> dict:
        key = self._normalize_subject(subject)
        subject_pool = DEMO_EXERCISES_POOL.get(key, DEMO_EXERCISES_POOL["programacao"])
        diff_pool = subject_pool.get(difficulty) or subject_pool.get("Intermediário") or list(subject_pool.values())[0]
        return random.choice(diff_pool)

    async def _generate_with_gemini(
        self, subject: str, difficulty: str, topic: str | None
    ) -> dict | None:
        if not self.api_key:
            return None

        prompt = (
            f"Gere um exercício de múltipla escolha para estudantes de graduação.\n"
            f"Disciplina: {subject}\n"
            f"Nível de Dificuldade: {difficulty}\n"
            f"Tópico específico: {topic or 'conceito fundamental da disciplina'}\n\n"
            "Retorne EXCLUSIVAMENTE um objeto JSON válido, sem blocos de markdown em volta, com o formato:\n"
            "{\n"
            '  "topic": "nome do tópico",\n'
            '  "question": "enunciado claro do problema",\n'
            '  "options": ["alternativa 1", "alternativa 2", "alternativa 3", "alternativa 4"],\n'
            '  "correct_option_index": 0,\n'
            '  "explanation": "resolução didática passo a passo explicando por que a alternativa está correta"\n'
            "}"
        )

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(
                    self.api_url,
                    params={"key": self.api_key},
                    json=payload,
                )
                res.raise_for_status()
                data = res.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                parsed = json.loads(raw_text)
                if (
                    isinstance(parsed.get("options"), list)
                    and len(parsed["options"]) >= 2
                    and "correct_option_index" in parsed
                    and "question" in parsed
                ):
                    return parsed
        except Exception as exc:
            logger.warning("Falha ao gerar exercício via Gemini: %s. Utilizando fallback do pool.", exc)
            return None

    async def generate_exercise(self, request: ExerciseGenerateRequest) -> ExerciseResponse:
        """Gera um exercício usando Gemini ou o pool didático local."""
        exercise_data = None
        is_demo = True
        provider_name = "demo"

        if self.api_key:
            gemini_result = await self._generate_with_gemini(
                subject=request.subject,
                difficulty=request.difficulty,
                topic=request.topic,
            )
            if gemini_result:
                exercise_data = gemini_result
                is_demo = False
                provider_name = f"gemini ({self.model})"

        if not exercise_data:
            exercise_data = self._get_demo_exercise(request.subject, request.difficulty)

        return ExerciseResponse(
            id=str(uuid.uuid4()),
            subject=request.subject,
            difficulty=request.difficulty,
            topic=exercise_data.get("topic", request.subject),
            question=exercise_data["question"],
            options=exercise_data["options"],
            correct_option_index=exercise_data["correct_option_index"],
            explanation=exercise_data["explanation"],
            is_demo=is_demo,
            provider=provider_name,
        )

    def evaluate_answer(self, request: ExerciseEvaluateRequest) -> ExerciseEvaluateResponse:
        """Avalia a alternativa escolhida pelo estudante e fornece feedback imediato."""
        is_correct = request.selected_index == request.correct_index
        if is_correct:
            feedback = "🎉 Excelente! Você acertou a questão com precisão."
            score = 10
        else:
            feedback = "❌ Resposta incorreta desta vez. Aproveite a resolução abaixo para reforçar o aprendizado!"
            score = 0

        return ExerciseEvaluateResponse(
            is_correct=is_correct,
            feedback=feedback,
            explanation=request.explanation,
            score_points=score,
        )


exercise_service = ExerciseService()
