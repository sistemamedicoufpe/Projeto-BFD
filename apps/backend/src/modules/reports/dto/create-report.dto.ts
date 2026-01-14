import { IsString, IsOptional, IsUUID, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';

export class CreateReportDto {
  @ApiProperty({
    description: 'ID da avaliação à qual o relatório pertence',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  evaluationId: string;

  @ApiProperty({
    description: 'Título do relatório',
    example: 'Laudo Neurológico - Avaliação Cognitiva',
  })
  @IsString()
  titulo: string;

  @ApiPropertyOptional({
    description: 'Descrição ou resumo do relatório',
    example: 'Relatório completo de avaliação neurológica com testes cognitivos e análise de imagens',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({
    description: 'Status do relatório',
    enum: ReportStatus,
    default: ReportStatus.PENDENTE,
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({
    description: 'Conteúdo do relatório em formato JSON (será criptografado)',
    example: {
      introducao: 'Paciente apresentou queixas de...',
      anamnese: 'História clínica...',
      exameFisico: 'Exame neurológico...',
      testesAplicados: ['MMSE', 'MoCA'],
      resultados: {
        mmse: { score: 24, interpretation: 'Leve comprometimento' },
        moca: { score: 22, interpretation: 'Leve comprometimento' },
      },
      conclusao: 'Paciente apresenta sinais de...',
      hipoteseDiagnostica: 'Comprometimento Cognitivo Leve',
      conduta: 'Recomenda-se acompanhamento neuropsicológico...',
    },
  })
  @IsOptional()
  @IsObject()
  content?: any;

  @ApiPropertyOptional({
    description: 'URL do PDF gerado',
    example: 'https://storage.neurocare.com/reports/laudo-123.pdf',
  })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({
    description: 'Chave do PDF no storage (MinIO/S3)',
    example: 'reports/patient-123/laudo-2024.pdf',
  })
  @IsOptional()
  @IsString()
  pdfKey?: string;
}
