import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';

interface ClockDrawingResult {
  score: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  criteria: {
    contour: boolean;
    numbers: boolean;
    numberPosition: boolean;
    hands: boolean;
    handPosition: boolean;
  };
  drawingData: string; // Base64 image of the drawing
  completedAt: string;
}

interface ClockDrawingTestProps {
  onComplete: (result: ClockDrawingResult) => void;
  onCancel?: () => void;
}

export function ClockDrawingTest({ onComplete, onCancel }: ClockDrawingTestProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [step, setStep] = useState<'instructions' | 'drawing' | 'scoring'>('instructions');
  const [drawingData, setDrawingData] = useState<string>('');
  const [scores, setScores] = useState({
    contour: false,
    numbers: false,
    numberPosition: false,
    hands: false,
    handPosition: false,
  });

  useEffect(() => {
    if (step === 'drawing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set drawing properties
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [step]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleStartTest = () => {
    setStep('drawing');
  };

  const handleFinishDrawing = () => {
    // Capture drawing data before transitioning to scoring
    const canvas = canvasRef.current;
    if (canvas) {
      setDrawingData(canvas.toDataURL('image/png'));
    }
    setStep('scoring');
  };

  const handleScoreChange = (criterion: keyof typeof scores) => {
    setScores(prev => ({ ...prev, [criterion]: !prev[criterion] }));
  };

  const calculateResults = (): ClockDrawingResult => {
    const scoreArray = Object.values(scores);
    const totalScore = scoreArray.filter(Boolean).length;
    const maxScore = 5;
    const percentage = (totalScore / maxScore) * 100;

    let interpretation = '';
    if (totalScore === 5) {
      interpretation = 'Normal - Todas as características presentes';
    } else if (totalScore >= 3) {
      interpretation = 'Leve comprometimento visuoespacial/executivo';
    } else if (totalScore >= 1) {
      interpretation = 'Moderado comprometimento visuoespacial/executivo';
    } else {
      interpretation = 'Grave comprometimento visuoespacial/executivo';
    }

    return {
      score: totalScore,
      maxScore,
      percentage,
      interpretation,
      criteria: scores,
      drawingData, // Use stored drawing data
      completedAt: new Date().toISOString(),
    };
  };

  const handleComplete = () => {
    const results = calculateResults();
    onComplete(results);
  };

  if (step === 'instructions') {
    return (
      <Card>
        <CardHeader title="Teste do Relógio - Instruções" />
        <CardContent>
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Como aplicar o teste:</h3>
              <ol className="text-sm text-blue-900 space-y-2 ml-4">
                <li>1. Dê uma folha em branco ao paciente</li>
                <li>2. Diga: "Desenhe um relógio grande, com todos os números"</li>
                <li>3. Após desenhar o contorno e números, diga: "Agora coloque os ponteiros marcando 11 horas e 10 minutos"</li>
                <li>4. Não dê pistas adicionais ou corrija o paciente</li>
                <li>5. Observe o processo e o resultado final</li>
              </ol>
            </div>

            {/* Scoring criteria preview */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Critérios de Pontuação (5 pontos):</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="font-medium">1.</span>
                  <span><strong>Contorno:</strong> Círculo fechado, sem distorções graves</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">2.</span>
                  <span><strong>Números:</strong> Todos os números de 1-12 presentes, sem extras</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">3.</span>
                  <span><strong>Posição dos números:</strong> Distribuídos corretamente (12 no topo, 6 embaixo, 3 direita, 9 esquerda)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">4.</span>
                  <span><strong>Ponteiros:</strong> Dois ponteiros presentes, de tamanhos diferentes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">5.</span>
                  <span><strong>Hora correta:</strong> Ponteiros em 11:10 (ponteiro curto apontando para 11, ponteiro longo para 2)</span>
                </div>
              </div>
            </div>

            {/* Clinical notes */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Nota Clínica:</h4>
              <p className="text-sm text-yellow-900">
                O teste do relógio avalia funções executivas, habilidades visuoespaciais e atenção.
                É particularmente sensível para demências frontais e Alzheimer em estágios iniciais.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between pt-4">
              {onCancel && (
                <Button
                  onClick={onCancel}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancelar
                </Button>
              )}
              <Button onClick={handleStartTest} className="ml-auto">
                Iniciar Teste →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'drawing') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader title="Desenhe o Relógio" />
          <CardContent>
            <div className="space-y-4">
              {/* Instructions reminder */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Instrução para o paciente:</strong> "Desenhe um relógio grande, com todos os números, e coloque os ponteiros marcando 11 horas e 10 minutos"
                </p>
              </div>

              {/* Drawing Canvas */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className="w-full cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>

              {/* Drawing tools */}
              <div className="flex gap-3">
                <Button
                  onClick={clearCanvas}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  🗑️ Limpar Desenho
                </Button>
                <div className="flex-1"></div>
                <Button onClick={handleFinishDrawing}>
                  Finalizar e Pontuar →
                </Button>
              </div>

              {/* Help text */}
              <p className="text-sm text-gray-600 text-center">
                💡 Use o mouse para desenhar. Clique em "Limpar Desenho" se precisar recomeçar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'scoring') {
    const results = calculateResults();

    return (
      <div className="space-y-6">
        {/* Drawing preview */}
        <Card>
          <CardHeader title="Desenho do Paciente" />
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-white">
              <img
                src={results.drawingData}
                alt="Desenho do relógio"
                className="w-full"
                style={{ maxWidth: '600px', margin: '0 auto', display: 'block' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Scoring criteria */}
        <Card>
          <CardHeader title="Pontuação" />
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Marque os critérios que estão presentes no desenho:
              </p>

              {/* Criteria checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scores.contour}
                    onChange={() => handleScoreChange('contour')}
                    className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Contorno circular adequado</div>
                    <div className="text-sm text-gray-600">Círculo fechado sem distorções graves</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scores.numbers}
                    onChange={() => handleScoreChange('numbers')}
                    className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Todos os números presentes (1-12)</div>
                    <div className="text-sm text-gray-600">12 números, sem números extras ou faltando</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scores.numberPosition}
                    onChange={() => handleScoreChange('numberPosition')}
                    className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Posição correta dos números</div>
                    <div className="text-sm text-gray-600">12 no topo, 6 embaixo, 3 direita, 9 esquerda</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scores.hands}
                    onChange={() => handleScoreChange('hands')}
                    className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Dois ponteiros presentes</div>
                    <div className="text-sm text-gray-600">Ponteiros de tamanhos diferentes (hora e minuto)</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scores.handPosition}
                    onChange={() => handleScoreChange('handPosition')}
                    className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Hora correta (11:10)</div>
                    <div className="text-sm text-gray-600">Ponteiro curto em 11, ponteiro longo em 2</div>
                  </div>
                </label>
              </div>

              {/* Score summary */}
              <div className="mt-6 p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Pontuação Total:</span>
                  <span className="text-3xl font-bold text-primary-600">
                    {results.score}/5
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Interpretação:</strong> {results.interpretation}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  onClick={() => setStep('drawing')}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  ← Refazer Desenho
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

  return null;
}
