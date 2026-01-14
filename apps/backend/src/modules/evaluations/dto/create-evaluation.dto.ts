import { IsString, IsOptional, IsUUID, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EvaluationStatus } from '@prisma/client';

export class CreateEvaluationDto {
  @ApiProperty({
    description: 'ID do paciente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({
    description: 'Queixa principal do paciente',
    example: 'Esquecimentos frequentes e dificuldade de concentração',
  })
  @IsOptional()
  @IsString()
  queixaPrincipal?: string;

  @ApiPropertyOptional({
    description: 'Status da avaliação',
    enum: EvaluationStatus,
    default: EvaluationStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(EvaluationStatus)
  status?: EvaluationStatus;

  @ApiPropertyOptional({
    description: 'Resultado do teste MMSE (será criptografado)',
    example: {
      totalScore: 24,
      maxScore: 30,
      percentage: 80,
      interpretation: 'Comprometimento Cognitivo Leve',
      details: {
        orientacaoTemporal: 4,
        orientacaoEspacial: 5,
        registroMemoria: 3,
        atencaoCalculo: 4,
        evocacao: 2,
        linguagem: 6,
      },
    },
  })
  @IsOptional()
  @IsObject()
  mmseResult?: any;

  @ApiPropertyOptional({
    description: 'Resultado do teste MoCA (será criptografado)',
    example: {
      totalScore: 22,
      maxScore: 30,
      percentage: 73.3,
      interpretation: 'Comprometimento Cognitivo Leve',
    },
  })
  @IsOptional()
  @IsObject()
  mocaResult?: any;

  @ApiPropertyOptional({
    description: 'Resultado do teste do relógio (será criptografado)',
    example: {
      score: 3,
      maxScore: 5,
      interpretation: 'Dificuldade moderada',
    },
  })
  @IsOptional()
  @IsObject()
  clockTestResult?: any;

  @ApiPropertyOptional({
    description: 'Hipótese diagnóstica',
    example: 'Comprometimento Cognitivo Leve - possível fase inicial de Doença de Alzheimer',
  })
  @IsOptional()
  @IsString()
  hipoteseDiagnostica?: string;

  @ApiPropertyOptional({
    description: 'Código CID-10',
    example: 'G31.84',
  })
  @IsOptional()
  @IsString()
  cid10?: string;

  @ApiPropertyOptional({
    description: 'Observações adicionais',
    example: 'Paciente colaborativo. Necessita acompanhamento neuropsicológico.',
  })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
