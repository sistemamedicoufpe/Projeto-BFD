import { useState } from 'react';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';

interface MoCAQuestion {
  id: number;
  domain: string;
  question: string;
  instructions: string;
  maxScore: number;
  options?: string[];
}

interface MoCAResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  domainScores: Record<string, { score: number; maxScore: number }>;
  responses: Record<number, number>;
  completedAt: string;
  educationAdjusted: boolean;
  adjustedScore?: number;
}

interface MoCATestProps {
  onComplete: (result: MoCAResult) => void;
  onCancel?: () => void;
}

const MOCA_QUESTIONS: MoCAQuestion[] = [
  // Visuospatial/Executive (5 pontos)
  {
    id: 1,
    domain: 'Visuoespacial/Executivo',
    question: 'Trail Making Test (Teste de Trilhas)',
    instructions: 'O paciente deve desenhar uma linha conectando números e letras alternadamente (1-A-2-B-3-C-4-D-5-E). Sem levantar o lápis. Sem erros.',
    maxScore: 1,
  },
  {
    id: 2,
    domain: 'Visuoespacial/Executivo',
    question: 'Copiar cubo tridimensional',
    instructions: 'Mostre o cubo e peça para copiar. Todas as linhas devem estar presentes e com 3D adequado.',
    maxScore: 1,
  },
  {
    id: 3,
    domain: 'Visuoespacial/Executivo',
    question: 'Desenhar relógio (contorno)',
    instructions: 'Peça: "Desenhe um relógio com todos os números". O contorno deve ser circular.',
    maxScore: 1,
  },
  {
    id: 4,
    domain: 'Visuoespacial/Executivo',
    question: 'Desenhar relógio (números)',
    instructions: 'Todos os números de 1 a 12 devem estar presentes, sem números extras.',
    maxScore: 1,
  },
  {
    id: 5,
    domain: 'Visuoespacial/Executivo',
    question: 'Desenhar relógio (ponteiros)',
    instructions: 'Peça: "Coloque os ponteiros marcando onze horas e dez minutos (11:10)". Ponteiros devem estar corretos.',
    maxScore: 1,
  },

  // Nomeação (3 pontos)
  {
    id: 6,
    domain: 'Nomeação',
    question: 'Nomear: LEÃO',
    instructions: 'Mostre a figura do leão e pergunte: "O que é isto?"',
    maxScore: 1,
  },
  {
    id: 7,
    domain: 'Nomeação',
    question: 'Nomear: RINOCERONTE',
    instructions: 'Mostre a figura do rinoceronte e pergunte: "O que é isto?"',
    maxScore: 1,
  },
  {
    id: 8,
    domain: 'Nomeação',
    question: 'Nomear: CAMELO',
    instructions: 'Mostre a figura do camelo e pergunte: "O que é isto?"',
    maxScore: 1,
  },

  // Memória (Registro - sem pontos aqui)
  {
    id: 9,
    domain: 'Memória (Registro)',
    question: 'Registrar 5 palavras',
    instructions: 'Diga: "Vou ler 5 palavras. Ouça com atenção pois vou pedir para você repetir depois. As palavras são: ROSTO, VELUDO, IGREJA, CRAVO, VERMELHO". Leia em ritmo de 1 palavra por segundo. Repita até que aprenda todas (máximo 2 tentativas). NÃO dê pontos aqui.',
    maxScore: 0,
  },

  // Atenção (6 pontos)
  {
    id: 10,
    domain: 'Atenção',
    question: 'Repetir dígitos - ordem direta (2-1-8-5-4)',
    instructions: 'Diga: "Vou falar alguns números. Repita depois de mim: 2-1-8-5-4"',
    maxScore: 1,
  },
  {
    id: 11,
    domain: 'Atenção',
    question: 'Repetir dígitos - ordem inversa (7-4-2)',
    instructions: 'Diga: "Agora vou falar outros números, mas quero que você repita de trás para frente: 7-4-2". Resposta correta: 2-4-7',
    maxScore: 1,
  },
  {
    id: 12,
    domain: 'Atenção',
    question: 'Vigilância (bater palma ao ouvir A)',
    instructions: 'Diga: "Vou ler uma sequência de letras. Bata palma toda vez que ouvir a letra A". Leia: F-B-A-C-M-N-A-A-J-K-L-B-A-F-A-K-D-E-A-A-A-J-A-M-O-F-A-A-B. Total de 11 As. Sem erros = 1 ponto.',
    maxScore: 1,
  },
  {
    id: 13,
    domain: 'Atenção',
    question: 'Série de 7 (100-7)',
    instructions: 'Diga: "Comece com 100 e vá subtraindo 7". Pare após 5 subtrações. Respostas: 93, 86, 79, 72, 65. Dê 1 ponto para 4-5 corretas, 2 pontos se todas corretas, 3 pontos não é possível nesta questão.',
    maxScore: 3,
    options: ['0-1 corretas (0 pts)', '2-3 corretas (1 pt)', '4-5 corretas (2 pts)', 'Todas corretas (3 pts)'],
  },

  // Linguagem (3 pontos)
  {
    id: 14,
    domain: 'Linguagem',
    question: 'Repetir frase 1: "Eu só sei que João é quem vai ajudar hoje"',
    instructions: 'Diga: "Repita exatamente: Eu só sei que João é quem vai ajudar hoje". Repetição exata necessária.',
    maxScore: 1,
  },
  {
    id: 15,
    domain: 'Linguagem',
    question: 'Repetir frase 2: "O gato sempre se escondia debaixo do sofá quando havia cães na sala"',
    instructions: 'Diga: "Repita: O gato sempre se escondia debaixo do sofá quando havia cães na sala". Repetição exata necessária.',
    maxScore: 1,
  },
  {
    id: 16,
    domain: 'Linguagem',
    question: 'Fluência verbal (letra F)',
    instructions: 'Diga: "Fale o máximo de palavras que começam com a letra F em 1 minuto. Não vale nomes próprios". 11 ou mais palavras = 1 ponto.',
    maxScore: 1,
  },

  // Abstração (2 pontos)
  {
    id: 17,
    domain: 'Abstração',
    question: 'Semelhança: Banana e Laranja',
    instructions: 'Pergunte: "O que banana e laranja têm em comum?" Resposta aceitável: fruta, alimento. Não aceitar: têm casca, redondas.',
    maxScore: 1,
  },
  {
    id: 18,
    domain: 'Abstração',
    question: 'Semelhança: Trem e Bicicleta',
    instructions: 'Pergunte: "O que trem e bicicleta têm em comum?" Resposta aceitável: meio de transporte, veículo. Não aceitar: têm roda.',
    maxScore: 1,
  },

  // Evocação Tardia (5 pontos)
  {
    id: 19,
    domain: 'Evocação Tardia',
    question: 'Lembrar as 5 palavras (sem pista)',
    instructions: 'Pergunte: "Quais eram as 5 palavras que pedi para você lembrar?" (ROSTO, VELUDO, IGREJA, CRAVO, VERMELHO). Dê 1 ponto para cada palavra lembrada sem pista.',
    maxScore: 5,
    options: ['0 palavras', '1 palavra', '2 palavras', '3 palavras', '4 palavras', '5 palavras'],
  },

  // Orientação (6 pontos)
  {
    id: 20,
    domain: 'Orientação',
    question: 'Que dia é hoje?',
    instructions: 'Pergunte: "Que dia é hoje?" (dia do mês)',
    maxScore: 1,
  },
  {
    id: 21,
    domain: 'Orientação',
    question: 'Em que mês estamos?',
    instructions: 'Pergunte: "Em que mês estamos?"',
    maxScore: 1,
  },
  {
    id: 22,
    domain: 'Orientação',
    question: 'Em que ano estamos?',
    instructions: 'Pergunte: "Em que ano estamos?"',
    maxScore: 1,
  },
  {
    id: 23,
    domain: 'Orientação',
    question: 'Que dia da semana é hoje?',
    instructions: 'Pergunte: "Que dia da semana é hoje?"',
    maxScore: 1,
  },
  {
    id: 24,
    domain: 'Orientação',
    question: 'Em que lugar estamos?',
    instructions: 'Pergunte: "Em que lugar estamos?" (nome do hospital, clínica)',
    maxScore: 1,
  },
  {
    id: 25,
    domain: 'Orientação',
    question: 'Em que cidade estamos?',
    instructions: 'Pergunte: "Em que cidade estamos?"',
    maxScore: 1,
  },
];

export function MoCATest({ onComplete, onCancel }: MoCATestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [hasLowEducation, setHasLowEducation] = useState<boolean | null>(null);

  const question = MOCA_QUESTIONS[currentQuestion];

  const handleScore = (score: number) => {
    const newScores = { ...scores, [question.id]: score };
    setScores(newScores);

    // Auto-advance to next question
    if (currentQuestion < MOCA_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 300);
    } else {
      // Last question, show education question
      setTimeout(() => {
        setShowSummary(true);
      }, 300);
    }
  };

  const calculateResults = (educationAdjustment: boolean): MoCAResult => {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxScore = 30;

    // Add 1 point if education ≤ 12 years
    const adjustedScore = educationAdjustment ? Math.min(totalScore + 1, 30) : totalScore;
    const percentage = (adjustedScore / maxScore) * 100;

    // Calculate domain scores
    const domainScores: Record<string, { score: number; maxScore: number }> = {};
    MOCA_QUESTIONS.forEach((q) => {
      if (!domainScores[q.domain]) {
        domainScores[q.domain] = { score: 0, maxScore: 0 };
      }
      domainScores[q.domain].score += scores[q.id] || 0;
      domainScores[q.domain].maxScore += q.maxScore;
    });

    // Interpretation
    let interpretation = '';
    if (adjustedScore >= 26) {
      interpretation = 'Normal - Cognição preservada';
    } else if (adjustedScore >= 18) {
      interpretation = 'Comprometimento Cognitivo Leve (CCL)';
    } else {
      interpretation = 'Comprometimento Cognitivo Moderado a Grave';
    }

    return {
      totalScore,
      maxScore,
      percentage,
      interpretation,
      domainScores,
      responses: scores,
      completedAt: new Date().toISOString(),
      educationAdjusted: educationAdjustment,
      adjustedScore: educationAdjustment ? adjustedScore : undefined,
    };
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleComplete = (educationAdjustment: boolean) => {
    const results = calculateResults(educationAdjustment);
    onComplete(results);
  };

  const handleReview = () => {
    setShowSummary(false);
    setHasLowEducation(null);
    setCurrentQuestion(0);
  };

  if (showSummary && hasLowEducation === null) {
    // Ask about education
    return (
      <Card>
        <CardHeader title="Ajuste por Escolaridade" />
        <CardContent>
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-900">
                <strong>Importante:</strong> O MoCA recomenda adicionar 1 ponto à pontuação total se o paciente tiver 12 anos ou menos de escolaridade formal.
              </p>
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 mb-4">
                O paciente tem 12 anos ou menos de escolaridade?
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setHasLowEducation(true);
                    // Will trigger results with adjustment
                  }}
                  className="flex-1"
                >
                  Sim - Adicionar 1 ponto
                </Button>
                <Button
                  onClick={() => {
                    setHasLowEducation(false);
                    // Will trigger results without adjustment
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Não - Manter pontuação original
                </Button>
              </div>
            </div>

            {onCancel && (
              <div className="pt-4 border-t">
                <Button
                  onClick={onCancel}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancelar Teste
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showSummary && hasLowEducation !== null) {
    const results = calculateResults(hasLowEducation);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader title="Resumo do MoCA" />
          <CardContent>
            <div className="space-y-6">
              {/* Total Score */}
              <div className="text-center py-8 border-b">
                <div className="text-6xl font-bold text-primary-600 mb-2">
                  {results.adjustedScore !== undefined ? results.adjustedScore : results.totalScore}/30
                </div>
                {results.educationAdjusted && (
                  <div className="text-sm text-gray-600 mb-2">
                    (Pontuação original: {results.totalScore} + 1 ponto por escolaridade)
                  </div>
                )}
                <div className="text-xl text-gray-700 mb-1">
                  {results.percentage.toFixed(1)}%
                </div>
                <div className={`text-lg font-medium ${
                  (results.adjustedScore ?? results.totalScore) >= 26 ? 'text-green-600' :
                  (results.adjustedScore ?? results.totalScore) >= 18 ? 'text-yellow-600' :
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
                            style={{ width: `${data.maxScore > 0 ? (data.score / data.maxScore) * 100 : 0}%` }}
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
                    <span>26-30 pontos:</span>
                    <span className="text-green-600 font-medium">Cognição Normal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>18-25 pontos:</span>
                    <span className="text-yellow-600 font-medium">Comprometimento Leve (CCL)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&lt; 18 pontos:</span>
                    <span className="text-red-600 font-medium">Comprometimento Moderado/Grave</span>
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
                  <Button onClick={() => handleComplete(hasLowEducation)}>
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

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Questão {currentQuestion + 1} de {MOCA_QUESTIONS.length}
          </span>
          <span className="text-sm text-gray-600">
            Pontuação atual: {Object.values(scores).reduce((sum, s) => sum + s, 0)}/30
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / MOCA_QUESTIONS.length) * 100}%` }}
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
                  {question.options.map((option, index) => {
                    // Determine the score value for this option
                    let scoreValue = index;
                    if (question.id === 13) {
                      // Serial 7s: 0-1 correct = 0, 2-3 = 1, 4-5 = 2, all = 3
                      scoreValue = index === 0 ? 0 : index === 1 ? 1 : index === 2 ? 2 : 3;
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleScore(scoreValue)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                          scores[question.id] === scoreValue
                            ? 'border-primary-600 bg-primary-50 text-primary-900'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
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
                {currentQuestion === MOCA_QUESTIONS.length - 1 && scores[question.id] !== undefined && (
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
            <p className="font-medium text-gray-900 mb-2">💡 Dicas para aplicação do MoCA:</p>
            <ul className="space-y-1 ml-4">
              <li>• O MoCA é mais sensível que o MMSE para detectar CCL</li>
              <li>• Tenha os materiais prontos: figuras, folha em branco, cronômetro</li>
              <li>• Para Trail Making: dê 1 minuto máximo</li>
              <li>• Para fluência verbal: use cronômetro de 1 minuto</li>
              <li>• Não dê dicas além das instruções padronizadas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
