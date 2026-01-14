import { IsString, IsOptional, IsUUID, IsEnum, IsInt, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExamType } from '@prisma/client';

export class CreateExamDto {
  @ApiProperty({
    description: 'ID da avaliação à qual o exame pertence',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  evaluationId: string;

  @ApiProperty({
    description: 'Tipo de exame',
    enum: ExamType,
    example: 'RESSONANCIA',
  })
  @IsEnum(ExamType)
  tipo: ExamType;

  @ApiProperty({
    description: 'Título do exame',
    example: 'Ressonância Magnética de Crânio',
  })
  @IsString()
  titulo: string;

  @ApiPropertyOptional({
    description: 'Descrição ou observações do exame',
    example: 'RM de crânio com contraste - análise de estruturas cerebrais',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({
    description: 'URL do arquivo no storage',
    example: 'https://storage.neurocare.com/exams/abc123.dcm',
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({
    description: 'Chave do arquivo no storage (MinIO/S3)',
    example: 'exams/patient-123/rm-cranio-2024.dcm',
  })
  @IsOptional()
  @IsString()
  fileKey?: string;

  @ApiPropertyOptional({
    description: 'Tamanho do arquivo em bytes',
    example: 2048576,
  })
  @IsOptional()
  @IsInt()
  fileSize?: number;

  @ApiPropertyOptional({
    description: 'MIME type do arquivo',
    example: 'application/dicom',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'Metadados do exame (DICOM tags, etc.) - será criptografado',
    example: {
      patientName: 'João Silva',
      studyDate: '2024-01-15',
      modality: 'MR',
      institutionName: 'Hospital XYZ',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
