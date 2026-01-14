import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Cria um novo exame médico
   */
  async create(createExamDto: CreateExamDto): Promise<any> {
    // Verificar se a avaliação existe
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: createExamDto.evaluationId },
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Avaliação com ID ${createExamDto.evaluationId} não encontrada`,
      );
    }

    // Criptografar metadados se fornecidos
    const metadataEnc = createExamDto.metadata
      ? this.encryptionService.encryptObject(createExamDto.metadata)
      : null;

    // Criar exame
    const exam = await this.prisma.exam.create({
      data: {
        evaluationId: createExamDto.evaluationId,
        tipo: createExamDto.tipo,
        titulo: createExamDto.titulo,
        descricao: createExamDto.descricao,
        fileUrl: createExamDto.fileUrl,
        fileKey: createExamDto.fileKey,
        fileSize: createExamDto.fileSize,
        mimeType: createExamDto.mimeType,
        metadataEnc,
      },
      include: {
        evaluation: {
          include: {
            patient: true,
          },
        },
      },
    });

    return this.decryptExam(exam);
  }

  /**
   * Retorna todos os exames (com filtro opcional por avaliação)
   */
  async findAll(evaluationId?: string): Promise<any[]> {
    const exams = await this.prisma.exam.findMany({
      where: evaluationId ? { evaluationId } : undefined,
      include: {
        evaluation: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return exams.map((exam) => this.decryptExam(exam));
  }

  /**
   * Retorna um exame específico por ID
   */
  async findOne(id: string): Promise<any> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        evaluation: {
          include: {
            patient: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                crm: true,
              },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Exame com ID ${id} não encontrado`);
    }

    return this.decryptExam(exam);
  }

  /**
   * Atualiza um exame existente
   */
  async update(id: string, updateExamDto: UpdateExamDto): Promise<any> {
    // Verificar se o exame existe
    const existingExam = await this.prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      throw new NotFoundException(`Exame com ID ${id} não encontrado`);
    }

    // Se evaluationId for fornecido, verificar se a avaliação existe
    if (updateExamDto.evaluationId) {
      const evaluation = await this.prisma.evaluation.findUnique({
        where: { id: updateExamDto.evaluationId },
      });

      if (!evaluation) {
        throw new NotFoundException(
          `Avaliação com ID ${updateExamDto.evaluationId} não encontrada`,
        );
      }
    }

    // Criptografar metadados se fornecidos
    const metadataEnc = updateExamDto.metadata
      ? this.encryptionService.encryptObject(updateExamDto.metadata)
      : undefined;

    // Atualizar exame
    const exam = await this.prisma.exam.update({
      where: { id },
      data: {
        ...updateExamDto,
        metadataEnc,
        version: { increment: 1 },
      },
      include: {
        evaluation: {
          include: {
            patient: true,
          },
        },
      },
    });

    return this.decryptExam(exam);
  }

  /**
   * Remove um exame
   */
  async remove(id: string): Promise<void> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      throw new NotFoundException(`Exame com ID ${id} não encontrado`);
    }

    await this.prisma.exam.delete({
      where: { id },
    });
  }

  /**
   * Busca exames por tipo
   */
  async findByType(tipo: string): Promise<any[]> {
    const exams = await this.prisma.exam.findMany({
      where: { tipo: tipo as any },
      include: {
        evaluation: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return exams.map((exam) => this.decryptExam(exam));
  }

  /**
   * Retorna estatísticas de exames
   */
  async getStats(): Promise<any> {
    const [
      total,
      ressonancia,
      tomografia,
      eletroencefalograma,
      petScan,
      outros,
    ] = await Promise.all([
      this.prisma.exam.count(),
      this.prisma.exam.count({ where: { tipo: 'RESSONANCIA' } }),
      this.prisma.exam.count({ where: { tipo: 'TOMOGRAFIA' } }),
      this.prisma.exam.count({ where: { tipo: 'ELETROENCEFALOGRAMA' } }),
      this.prisma.exam.count({ where: { tipo: 'PET_SCAN' } }),
      this.prisma.exam.count({ where: { tipo: 'OUTRO' } }),
    ]);

    return {
      total,
      byType: {
        ressonancia,
        tomografia,
        eletroencefalograma,
        petScan,
        outros,
      },
    };
  }

  /**
   * Descriptografa os metadados de um exame
   */
  private decryptExam(exam: any): any {
    try {
      return {
        ...exam,
        metadata: exam.metadataEnc
          ? this.encryptionService.decryptObject(exam.metadataEnc)
          : null,
        // Remover campo criptografado do retorno
        metadataEnc: undefined,
      };
    } catch (error) {
      console.error('Erro ao descriptografar exame:', error);
      return {
        ...exam,
        metadata: null,
        metadataEnc: undefined,
      };
    }
  }
}
