import { useState } from 'react';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';

interface MMSEQuestion {
  id: number;
  domain: string;
  question: string;
  instructions: string;
  maxScore: number;
  options?: string[];
}

interface MMSEResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  domainScores: Record<string, { score: number; maxScore: number }>;
  responses: Record<number, number>;
  completedAt: string;
}

interface MMSETestProps {
  onComplete: (result: MMSEResult) => void;
  onCancel?: () => void;
}

const MMSE_QUESTIONS: MMSEQuestion[] = [
  // Orientação Temporal (5 pontos)
  {
    id: 1,
    domain: 'Orientação Temporal',
    question: 'Em que dia da semana estamos?',
    instructions: 'Pergunte ao paciente: "Em que dia da semana estamos?"',
    maxScore: 1,
  },
  {
    id: 2,
    domain: 'Orientação Temporal',
    question: 'Que dia do mês é hoje?',
    instructions: 'Pergunte: "Que dia do mês é hoje?"',
    maxScore: 1,
  },
  {
    id: 3,
    domain: 'Orientação Temporal',
    question: 'Em que mês estamos?',
    instructions: 'Pergunte: "Em que mês estamos?"',
    maxScore: 1,
  },
  {
    id: 4,
    domain: 'Orientação Temporal',
    question: 'Em que ano estamos?',
    instructions: 'Pergunte: "Em que ano estamos?"',
    maxScore: 1,
  },
  {
    id: 5,
    domain: 'Orientação Temporal',
    question: 'Em que estação do ano estamos?',
    instructions: 'Pergunte: "Em que estação do ano estamos?"',
    maxScore: 1,
  },

  // Orientação Espacial (5 pontos)
  {
    id: 6,
    domain: 'Orientação Espacial',
    question: 'Em que país estamos?',
    instructions: 'Pergunte: "Em que país estamos?"',
    maxScore: 1,
  },
  {
    id: 7,
    domain: 'Orientação Espacial',
    question: 'Em que estado estamos?',
    instructions: 'Pergunte: "Em que estado estamos?"',
    maxScore: 1,
  },
  {
    id: 8,
    domain: 'Orientação Espacial',
    question: 'Em que cidade estamos?',
    instructions: 'Pergunte: "Em que cidade estamos?"',
    maxScore: 1,
  },
  {
    id: 9,
    domain: 'Orientação Espacial',
    question: 'Em que local estamos? (hospital, clínica, consultório)',
    instructions: 'Pergunte: "Que tipo de lugar é este?" ou "Onde estamos agora?"',
    maxScore: 1,
  },
  {
    id: 10,
    domain: 'Orientação Espacial',
    question: 'Em que andar estamos?',
    instructions: 'Pergunte: "Em que andar estamos?"',
    maxScore: 1,
  },

  // Memória Imediata (3 pontos)
  {
    id: 11,
    domain: 'Memória Imediata',
    question: 'Repetir 3 palavras: VASO, CARRO, TIJOLO',
    instructions: 'Diga: "Vou falar 3 palavras e o(a) senhor(a) vai repetir: VASO, CARRO, TIJOLO". Dê 1 ponto para cada palavra correta na primeira tentativa. Repita até que o paciente aprenda as 3 palavras (máximo 5 tentativas).',
    maxScore: 3,
    options: ['0 palavras corretas', '1 palavra correta', '2 palavras corretas', '3 palavras corretas'],
  },

  // Atenção e Cálculo (5 pontos)
  {
    id: 12,
    domain: 'Atenção e Cálculo',
    question: 'Série de 7: 100 - 7 = ? (continue subtraindo 7)',
    instructions: 'Diga: "Agora vou fazer uma pergunta de matemática. Quanto é 100 menos 7? Continue subtraindo 7 do resultado". Respostas esperadas: 93, 86, 79, 72, 65. Dê 1 ponto para cada resposta correta. Se o paciente não souber fazer, peça para soletrar MUNDO ao contrário (O-D-N-U-M).',
    maxScore: 5,
    options: ['0 corretas', '1 correta', '2 corretas', '3 corretas', '4 corretas', '5 corretas'],
  },

  // Evocação (3 pontos)
  {
    id: 13,
    domain: 'Evocação',
    question: 'Lembrar as 3 palavras ditas anteriormente',
    instructions: 'Pergunte: "Quais foram as 3 palavras que eu pedi para o(a) senhor(a) repetir?" (VASO, CARRO, TIJOLO). Dê 1 ponto para cada palavra correta.',
    maxScore: 3,
    options: ['0 palavras lembradas', '1 palavra lembrada', '2 palavras lembradas', '3 palavras lembradas'],
  },

  // Linguagem - Nomeação (2 pontos)
  {
    id: 14,
    domain: 'Linguagem',
    question: 'Nomear objetos: RELÓGIO e CANETA',
    instructions: 'Mostre um relógio e pergunte: "O que é isto?". Depois mostre uma caneta. Dê 1 ponto para cada objeto nomeado corretamente.',
    maxScore: 2,
    options: ['0 corretas', '1 correta', '2 corretas'],
  },

  // Linguagem - Repetição (1 ponto)
  {
    id: 15,
    domain: 'Linguagem',
    question: 'Repetir a frase: "NEM AQUI, NEM ALI, NEM LÁ"',
    instructions: 'Diga: "Repita esta frase: NEM AQUI, NEM ALI, NEM LÁ". A repetição deve ser exata. Permita apenas uma tentativa.',
    maxScore: 1,
  },

  // Linguagem - Comando verbal (3 pontos)
  {
    id: 16,
    domain: 'Linguagem',
    question: 'Comando de 3 estágios',
    instructions: 'Dê uma folha de papel e diga: "Pegue este papel com a mão direita, dobre ao meio e coloque no chão". Dê 1 ponto para cada ação executada corretamente.',
    maxScore: 3,
    options: ['0 ações corretas', '1 ação correta', '2 ações corretas', '3 ações corretas'],
  },

  // Linguagem - Leitura (1 ponto)
  {
    id: 17,
    domain: 'Linguagem',
    question: 'Ler e obedecer: "FECHE OS OLHOS"',
    instructions: 'Mostre um cartão com a frase "FECHE OS OLHOS" e diga: "Leia isto e faça o que está escrito". O paciente deve fechar os olhos.',
    maxScore: 1,
  },

  // Linguagem - Escrita (1 ponto)
  {
    id: 18,
    domain: 'Linguagem',
    question: 'Escrever uma frase',
    instructions: 'Diga: "Escreva uma frase completa nesta folha". A frase deve ter sujeito e verbo e fazer sentido. Ignore erros de gramática e ortografia.',
    maxScore: 1,
  },

  // Praxia Construtiva (1 ponto)
  {
    id: 19,
    domain: 'Praxia Construtiva',
    question: 'Copiar o desenho (pentágonos intersectados)',
    instructions: 'Mostre o desenho de dois pentágonos intersectados e diga: "Copie este desenho". Os pentágonos devem ter 5 lados cada e se intersectar formando uma figura de 4 lados.',
    maxScore: 1,
  },
];

export function MMSETest({ onComplete, onCancel }: MMSETestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [showSummary, setShowSummary] = useState(false);

  const question = MMSE_QUESTIONS[currentQuestion];

  const handleScore = (score: number) => {
    // Guard against undefined question
    if (!question) return;
    const newScores = { ...scores, [question.id]: score };
    setScores(newScores);

    // Auto-advance to next question
    if (currentQuestion < MMSE_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 300);
    } else {
      // Last question, show summary
      setTimeout(() => {
        setShowSummary(true);
      }, 300);
    }
  };

  const calculateResults = (): MMSEResult => {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxScore = 30;
    const percentage = (totalScore / maxScore) * 100;

    // Calculate domain scores
    const domainScores: Record<string, { score: number; maxScore: number }> = {};
    MMSE_QUESTIONS.forEach((q) => {
      if (!domainScores[q.domain]) {
        domainScores[q.domain] = { score: 0, maxScore: 0 };
      }
      domainScores[q.domain].score += scores[q.id] || 0;
      domainScores[q.domain].maxScore += q.maxScore;
    });

    // Interpretation
    let interpretation = '';
    if (totalScore >= 24) {
      interpretation = 'Normal - Cognição preservada';
    } else if (totalScore >= 18) {
      interpretation = 'Comprometimento Cognitivo Leve';
    } else if (totalScore >= 10) {
      interpretation = 'Comprometimento Cognitivo Moderado';
    } else {
      interpretation = 'Comprometimento Cognitivo Grave';
    }

    return {
      totalScore,
      maxScore,
      percentage,
      interpretation,
      domainScores,
      responses: scores,
      completedAt: new Date().toISOString(),
    };
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const results = calculateResults();
    onComplete(results);
  };

  const handleReview = () => {
    setShowSummary(false);
    setCurrentQuestion(0);
  };

  // Guard against undefined question (can happen during transition)
  if (!question && !showSummary) {
    setShowSummary(true);
    return null;
  }

  if (showSummary) {
    const results = calculateResults();

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader title="Resumo do MMSE" />
          <CardContent>
            <div className="space-y-6">
              {/* Total Score */}
              <div className="text-center py-8 border-b">
                <div className="text-6xl font-bold text-primary-600 mb-2">
                  {results.totalScore}/30
                </div>
                <div className="text-xl text-gray-700 mb-1">
                  {results.percentage.toFixed(1)}%
                </div>
                <div className={`text-lg font-medium ${
                  results.totalScore >= 24 ? 'text-green-600' :
                  results.totalScore >= 18 ? 'text-yellow-600' :
                  results.totalScore >= 10 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {results.interpretation}
                </div>
              </div>

              {/* Domain Scores */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pontuação por Domínio
                </h3>
                <div className="space-y-3">
                  {Object.entries(results.domainScores).map(([domain, data]) => (
                    <div key={domain} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{domain}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600"
                            style={{ width: `${(data.score / data.maxScore) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {data.score}/{data.maxScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interpretation Guide */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Guia de Interpretação
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>24-30 pontos:</span>
                    <span className="text-green-600 font-medium">Cognição Normal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>18-23 pontos:</span>
                    <span className="text-yellow-600 font-medium">Comprometimento Leve</span>
                  </div>
                  <div className="flex justify-between">
                    <span>10-17 pontos:</span>
                    <span className="text-orange-600 font-medium">Comprometimento Moderado</span>
                  </div>
                  <div className="flex justify-between">
                    <span>0-9 pontos:</span>
                    <span className="text-red-600 font-medium">Comprometimento Grave</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Button
                  onClick={handleReview}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Revisar Respostas
                </Button>
                <div className="flex gap-3">
                  {onCancel && (
                    <Button
                      onClick={onCancel}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button onClick={handleComplete}>
                    Salvar Resultado
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Guard: if question is undefined, return loading state
  if (!question) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Questão {currentQuestion + 1} de {MMSE_QUESTIONS.length}
          </span>
          <span className="text-sm text-gray-600">
            Pontuação atual: {Object.values(scores).reduce((sum, s) => sum + s, 0)}/30
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / MMSE_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader
          title={`${question.domain} (${question.maxScore} ${question.maxScore === 1 ? 'ponto' : 'pontos'})`}
        />
        <CardContent>
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-900">
                <strong>Instruções:</strong> {question.instructions}
              </p>
            </div>

            {/* Question */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {question.question}
              </h3>
            </div>

            {/* Scoring Options */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Pontuação:
              </p>
              {question.options ? (
                // Multiple choice scoring
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleScore(index)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                        scores[question.id] === index
                          ? 'border-primary-600 bg-primary-50 text-primary-900'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        <span className="text-sm font-medium text-gray-600">
                          {index} {index === 1 ? 'ponto' : 'pontos'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Binary scoring (correct/incorrect)
                <div className="flex gap-3">
                  <button
                    onClick={() => handleScore(0)}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                      scores[question.id] === 0
                        ? 'border-red-600 bg-red-50 text-red-900'
                        : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                    }`}
                  >
                    Incorreto (0)
                  </button>
                  <button
                    onClick={() => handleScore(question.maxScore)}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                      scores[question.id] === question.maxScore
                        ? 'border-green-600 bg-green-50 text-green-900'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    Correto ({question.maxScore})
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                ← Anterior
              </Button>
              <div className="flex gap-3">
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancelar Teste
                  </Button>
                )}
                {currentQuestion === MMSE_QUESTIONS.length - 1 && scores[question.id] !== undefined && (
                  <Button onClick={() => setShowSummary(true)}>
                    Ver Resumo →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-2">💡 Dicas para aplicação:</p>
            <ul className="space-y-1 ml-4">
              <li>• Aplique o teste em ambiente tranquilo e sem interrupções</li>
              <li>• Fale claramente e dê tempo para o paciente responder</li>
              <li>• Não forneça pistas ou dicas adicionais além das instruções</li>
              <li>• Registre a pontuação imediatamente após cada resposta</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
