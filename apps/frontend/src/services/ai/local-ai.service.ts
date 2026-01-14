/**
 * Local AI Service for Neurological Diagnosis
 *
 * This service uses TensorFlow.js to run a simple neural network model
 * directly in the browser for offline diagnosis assistance.
 *
 * The model analyzes cognitive test scores and clinical data to suggest
 * possible dementia diagnoses with confidence levels.
 */

import * as tf from '@tensorflow/tfjs'

export interface DiagnosisInput {
  // MMSE scores (0-30)
  mmseTotal?: number
  mmseOrientacao?: number
  mmseMemoria?: number
  mmseAtencao?: number
  mmseLinguagem?: number
  mmseHabilidadeVisuoespacial?: number

  // MoCA scores (0-30)
  mocaTotal?: number
  mocaVisuoespacial?: number
  mocaNomeacao?: number
  mocaAtencao?: number
  mocaLinguagem?: number
  mocaAbstracao?: number
  mocaMemoriaTardia?: number
  mocaOrientacao?: number

  // Clock Drawing Test (0-10)
  clockDrawingScore?: number

  // Patient demographics
  idade?: number
  escolaridade?: number

  // Clinical observations
  alteracaoComportamento?: boolean
  alucinacoes?: boolean
  flutuacaoCognitiva?: boolean
  parkinsonismo?: boolean
  alteracaoLinguagem?: boolean
  alteracaoMemoriaRecente?: boolean
  desorientacaoEspacial?: boolean
}

export interface DiagnosisPrediction {
  tipo: string
  codigo: string
  probabilidade: number
  descricao: string
  sintomasPrincipais: string[]
}

export interface DiagnosisResult {
  predicoes: DiagnosisPrediction[]
  confiancaGeral: number
  recomendacoes: string[]
  timestamp: Date
}

// Diagnosis types with ICD-10 codes
const DIAGNOSIS_TYPES = [
  {
    tipo: 'Doença de Alzheimer',
    codigo: 'G30',
    descricao: 'Demência degenerativa primária com início insidioso e progressão gradual',
    sintomasPrincipais: ['Perda de memória recente', 'Desorientação temporal/espacial', 'Dificuldade de linguagem', 'Alteração de julgamento']
  },
  {
    tipo: 'Demência por Corpos de Lewy',
    codigo: 'G31.83',
    descricao: 'Demência com flutuação cognitiva, alucinações visuais e parkinsonismo',
    sintomasPrincipais: ['Flutuação cognitiva', 'Alucinações visuais', 'Parkinsonismo', 'Distúrbio do sono REM']
  },
  {
    tipo: 'Demência Frontotemporal',
    codigo: 'G31.0',
    descricao: 'Demência com alterações comportamentais ou de linguagem proeminentes',
    sintomasPrincipais: ['Alteração de personalidade', 'Desinibição', 'Apatia', 'Alteração de linguagem']
  },
  {
    tipo: 'Demência Vascular',
    codigo: 'F01',
    descricao: 'Demência resultante de doença cerebrovascular',
    sintomasPrincipais: ['Início abrupto ou escalonado', 'Déficits focais', 'Fatores de risco vascular', 'Alteração de marcha']
  },
  {
    tipo: 'Comprometimento Cognitivo Leve',
    codigo: 'F06.7',
    descricao: 'Declínio cognitivo além do esperado para idade, sem comprometimento funcional significativo',
    sintomasPrincipais: ['Queixa subjetiva de memória', 'Desempenho abaixo do esperado', 'Funcionalidade preservada']
  },
  {
    tipo: 'Cognição Normal para Idade',
    codigo: 'Z00.8',
    descricao: 'Desempenho cognitivo dentro dos limites normais para idade e escolaridade',
    sintomasPrincipais: ['Sem alteração significativa']
  }
]

export class LocalAIService {
  private model: tf.LayersModel | null = null
  private isInitialized = false
  private isLoading = false

  constructor() {
    this.initModel()
  }

  private async initModel(): Promise<void> {
    if (this.isInitialized || this.isLoading) return

    this.isLoading = true

    try {
      // Create a simple neural network model
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [20], units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 6, activation: 'softmax' })
        ]
      })

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      })

      // Train with synthetic data (in production, this would load pre-trained weights)
      await this.trainWithSyntheticData()

      this.isInitialized = true
      console.log('Local AI model initialized successfully')
    } catch (error) {
      console.error('Error initializing local AI model:', error)
      throw error
    } finally {
      this.isLoading = false
    }
  }

  private async trainWithSyntheticData(): Promise<void> {
    // Generate synthetic training data based on clinical criteria
    const trainingData: number[][] = []
    const trainingLabels: number[][] = []

    // Generate 1000 synthetic cases
    for (let i = 0; i < 1000; i++) {
      const { features, label } = this.generateSyntheticCase()
      trainingData.push(features)
      trainingLabels.push(label)
    }

    const xs = tf.tensor2d(trainingData)
    const ys = tf.tensor2d(trainingLabels)

    // Train the model
    await this.model!.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      shuffle: true,
      verbose: 0
    })

    xs.dispose()
    ys.dispose()
  }

  private generateSyntheticCase(): { features: number[]; label: number[] } {
    const diagnosisType = Math.floor(Math.random() * 6)
    const label = Array(6).fill(0)
    label[diagnosisType] = 1

    const features: number[] = []

    switch (diagnosisType) {
      case 0: // Alzheimer
        features.push(
          this.randomNormal(18, 5) / 30, // MMSE total
          this.randomNormal(5, 2) / 10,  // MMSE orientacao
          this.randomNormal(2, 1) / 6,   // MMSE memoria
          this.randomNormal(3, 1) / 5,   // MMSE atencao
          this.randomNormal(5, 2) / 9,   // MMSE linguagem
          this.randomNormal(16, 5) / 30, // MoCA total
          this.randomNormal(2, 1) / 5,   // MoCA visuoespacial
          this.randomNormal(2, 1) / 3,   // MoCA nomeacao
          this.randomNormal(3, 1) / 6,   // MoCA atencao
          this.randomNormal(2, 1) / 3,   // MoCA linguagem
          this.randomNormal(1, 0.5) / 2, // MoCA abstracao
          this.randomNormal(2, 1) / 5,   // MoCA memoria tardia
          this.randomNormal(4, 1) / 6,   // MoCA orientacao
          this.randomNormal(5, 2) / 10,  // Clock drawing
          this.randomNormal(75, 8) / 100, // Idade
          this.randomNormal(8, 3) / 20,  // Escolaridade
          0.3, // alteracao comportamento
          0.1, // alucinacoes
          0.2, // flutuacao cognitiva
          0.1  // parkinsonismo
        )
        break
      case 1: // Lewy Body
        features.push(
          this.randomNormal(20, 4) / 30,
          this.randomNormal(6, 2) / 10,
          this.randomNormal(3, 1) / 6,
          this.randomNormal(3, 1) / 5,
          this.randomNormal(6, 2) / 9,
          this.randomNormal(18, 4) / 30,
          this.randomNormal(2, 1) / 5,
          this.randomNormal(2, 1) / 3,
          this.randomNormal(3, 1) / 6,
          this.randomNormal(2, 1) / 3,
          this.randomNormal(1, 0.5) / 2,
          this.randomNormal(3, 1) / 5,
          this.randomNormal(5, 1) / 6,
          this.randomNormal(6, 2) / 10,
          this.randomNormal(72, 7) / 100,
          this.randomNormal(10, 4) / 20,
          0.4,
          0.8, // alucinacoes - high
          0.8, // flutuacao - high
          0.7  // parkinsonismo - high
        )
        break
      case 2: // Frontotemporal
        features.push(
          this.randomNormal(22, 4) / 30,
          this.randomNormal(7, 2) / 10,
          this.randomNormal(4, 1) / 6,
          this.randomNormal(4, 1) / 5,
          this.randomNormal(5, 2) / 9,
          this.randomNormal(20, 4) / 30,
          this.randomNormal(3, 1) / 5,
          this.randomNormal(2, 1) / 3,
          this.randomNormal(4, 1) / 6,
          this.randomNormal(2, 1) / 3,
          this.randomNormal(1, 0.5) / 2,
          this.randomNormal(4, 1) / 5,
          this.randomNormal(5, 1) / 6,
          this.randomNormal(6, 2) / 10,
          this.randomNormal(65, 8) / 100,
          this.randomNormal(12, 4) / 20,
          0.9, // alteracao comportamento - very high
          0.2,
          0.3,
          0.2
        )
        break
      case 3: // Vascular
        features.push(
          this.randomNormal(19, 5) / 30,
          this.randomNormal(6, 2) / 10,
          this.randomNormal(3, 1) / 6,
          this.randomNormal(3, 1) / 5,
          this.randomNormal(5, 2) / 9,
          this.randomNormal(17, 5) / 30,
          this.randomNormal(2, 1) / 5,
          this.randomNormal(2, 1) / 3,
          this.randomNormal(3, 1) / 6,
          this.randomNormal(2, 1) / 3,
          this.randomNormal(1, 0.5) / 2,
          this.randomNormal(3, 1) / 5,
          this.randomNormal(5, 1) / 6,
          this.randomNormal(5, 2) / 10,
          this.randomNormal(70, 8) / 100,
          this.randomNormal(8, 3) / 20,
          0.3,
          0.2,
          0.2,
          0.4
        )
        break
      case 4: // MCI
        features.push(
          this.randomNormal(25, 3) / 30,
          this.randomNormal(8, 1) / 10,
          this.randomNormal(4, 1) / 6,
          this.randomNormal(4, 0.5) / 5,
          this.randomNormal(7, 1) / 9,
          this.randomNormal(23, 3) / 30,
          this.randomNormal(4, 1) / 5,
          this.randomNormal(2, 0.5) / 3,
          this.randomNormal(5, 1) / 6,
          this.randomNormal(2, 0.5) / 3,
          this.randomNormal(1.5, 0.3) / 2,
          this.randomNormal(3, 1) / 5,
          this.randomNormal(6, 0.5) / 6,
          this.randomNormal(8, 1) / 10,
          this.randomNormal(68, 10) / 100,
          this.randomNormal(12, 4) / 20,
          0.1,
          0.05,
          0.1,
          0.05
        )
        break
      case 5: // Normal
      default:
        features.push(
          this.randomNormal(28, 2) / 30,
          this.randomNormal(9, 1) / 10,
          this.randomNormal(5, 0.5) / 6,
          this.randomNormal(5, 0.5) / 5,
          this.randomNormal(8, 1) / 9,
          this.randomNormal(27, 2) / 30,
          this.randomNormal(4, 0.5) / 5,
          this.randomNormal(3, 0.3) / 3,
          this.randomNormal(5, 0.5) / 6,
          this.randomNormal(3, 0.3) / 3,
          this.randomNormal(2, 0.2) / 2,
          this.randomNormal(4, 0.5) / 5,
          this.randomNormal(6, 0.3) / 6,
          this.randomNormal(9, 1) / 10,
          this.randomNormal(65, 15) / 100,
          this.randomNormal(12, 4) / 20,
          0.05,
          0.02,
          0.05,
          0.02
        )
        break
    }

    // Clamp values between 0 and 1
    const clampedFeatures = features.map(f => Math.max(0, Math.min(1, f)))

    return { features: clampedFeatures, label }
  }

  private randomNormal(mean: number, stdDev: number): number {
    // Box-Muller transform for normal distribution
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mean + z * stdDev
  }

  private prepareInput(input: DiagnosisInput): number[] {
    const idade = input.idade || 70
    const escolaridade = input.escolaridade || 8

    // Normalize all inputs to 0-1 range
    return [
      (input.mmseTotal || 25) / 30,
      (input.mmseOrientacao || 8) / 10,
      (input.mmseMemoria || 4) / 6,
      (input.mmseAtencao || 4) / 5,
      (input.mmseLinguagem || 7) / 9,
      (input.mocaTotal || 23) / 30,
      (input.mocaVisuoespacial || 3) / 5,
      (input.mocaNomeacao || 2) / 3,
      (input.mocaAtencao || 4) / 6,
      (input.mocaLinguagem || 2) / 3,
      (input.mocaAbstracao || 1) / 2,
      (input.mocaMemoriaTardia || 3) / 5,
      (input.mocaOrientacao || 5) / 6,
      (input.clockDrawingScore || 7) / 10,
      idade / 100,
      escolaridade / 20,
      input.alteracaoComportamento ? 1 : 0,
      input.alucinacoes ? 1 : 0,
      input.flutuacaoCognitiva ? 1 : 0,
      input.parkinsonismo ? 1 : 0
    ]
  }

  async analyze(input: DiagnosisInput, minConfidence = 70): Promise<DiagnosisResult> {
    // Ensure model is initialized
    if (!this.isInitialized) {
      await this.initModel()
    }

    if (!this.model) {
      throw new Error('Model not initialized')
    }

    const features = this.prepareInput(input)
    const inputTensor = tf.tensor2d([features])

    const prediction = this.model.predict(inputTensor) as tf.Tensor
    const probabilities = await prediction.data()

    inputTensor.dispose()
    prediction.dispose()

    // Create predictions array
    const predicoes: DiagnosisPrediction[] = DIAGNOSIS_TYPES.map((type, index) => ({
      tipo: type.tipo,
      codigo: type.codigo,
      probabilidade: Math.round(probabilities[index] * 100),
      descricao: type.descricao,
      sintomasPrincipais: type.sintomasPrincipais
    }))
    .filter(p => p.probabilidade >= minConfidence)
    .sort((a, b) => b.probabilidade - a.probabilidade)

    // Calculate overall confidence
    const maxProb = Math.max(...Array.from(probabilities))
    const confiancaGeral = Math.round(maxProb * 100)

    // Generate recommendations based on top prediction
    const recomendacoes = this.generateRecommendations(predicoes, input)

    return {
      predicoes,
      confiancaGeral,
      recomendacoes,
      timestamp: new Date()
    }
  }

  private generateRecommendations(predicoes: DiagnosisPrediction[], input: DiagnosisInput): string[] {
    const recommendations: string[] = []

    if (predicoes.length === 0) {
      recommendations.push('Considere repetir a avaliação cognitiva')
      return recommendations
    }

    const topPrediction = predicoes[0]

    // General recommendations
    recommendations.push(`Considere avaliação complementar para ${topPrediction.tipo}`)

    if (input.mmseTotal && input.mmseTotal < 24) {
      recommendations.push('Realizar exames de neuroimagem (RM de crânio)')
    }

    if (input.mocaTotal && input.mocaTotal < 26) {
      recommendations.push('Realizar avaliação neuropsicológica completa')
    }

    // Specific recommendations based on diagnosis
    switch (topPrediction.codigo) {
      case 'G30': // Alzheimer
        recommendations.push('Solicitar biomarcadores de LCR ou PET amiloide se disponível')
        recommendations.push('Avaliar início de tratamento com anticolinesterásicos')
        break
      case 'G31.83': // Lewy Body
        recommendations.push('Realizar cintilografia cerebral com TRODAT ou DaTscan')
        recommendations.push('Evitar neurolépticos devido ao risco de sensibilidade')
        break
      case 'G31.0': // Frontotemporal
        recommendations.push('Realizar PET-FDG para avaliar hipometabolismo frontal')
        recommendations.push('Considerar avaliação genética se história familiar positiva')
        break
      case 'F01': // Vascular
        recommendations.push('Otimizar controle de fatores de risco cardiovascular')
        recommendations.push('Realizar angiotomografia ou angiorressonância cerebral')
        break
      case 'F06.7': // MCI
        recommendations.push('Acompanhamento semestral com reavaliação cognitiva')
        recommendations.push('Estimulação cognitiva e atividade física regular')
        break
    }

    return recommendations
  }

  async isReady(): Promise<boolean> {
    if (this.isInitialized) return true
    await this.initModel()
    return this.isInitialized
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
      this.isInitialized = false
    }
  }
}

// Export singleton instance
let localAIInstance: LocalAIService | null = null

export function getLocalAIService(): LocalAIService {
  if (!localAIInstance) {
    localAIInstance = new LocalAIService()
  }
  return localAIInstance
}

export default LocalAIService
