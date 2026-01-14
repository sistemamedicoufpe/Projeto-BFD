import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { Evaluation } from '@prisma/client';

@Injectable()
export class EvaluationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Cria uma nova avaliação neurológica
   */
  async create(
    createEvaluationDto: CreateEvaluationDto,
    userId: string,
  ): Promise<any> {
    // Verificar se o paciente existe
    const patient = await this.prisma.patient.findUnique({
      where: { id: createEvaluationDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException(
        `Paciente com ID ${createEvaluationDto.patientId} não encontrado`,
      );
    }

    // Criptografar resultados dos testes
    const mmseResultEnc = createEvaluationDto.mmseResult
      ? this.encryptionService.encryptObject(createEvaluationDto.mmseResult)
      : null;

    const mocaResultEnc = createEvaluationDto.mocaResult
      ? this.encryptionService.encryptObject(createEvaluationDto.mocaResult)
      : null;

    const clockTestResultEnc = createEvaluationDto.clockTestResult
      ? this.encryptionService.encryptObject(
          createEvaluationDto.clockTestResult,
        )
      : null;

    // Criar avaliação
    const evaluation = await this.prisma.evaluation.create({
      data: {
        patientId: createEvaluationDto.patientId,
        userId,
        queixaPrincipal: createEvaluationDto.queixaPrincipal,
        status: createEvaluationDto.status || 'IN_PROGRESS',
        mmseResultEnc,
        mocaResultEnc,
        clockTestResultEnc,
        hipoteseDiagnostica: createEvaluationDto.hipoteseDiagnostica,
        cid10: createEvaluationDto.cid10,
        observacoes: createEvaluationDto.observacoes,
      },
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
    });

    return this.decryptEvaluation(evaluation);
  }

  /**
   * Retorna todas as avaliações (com paginação opcional)
   */
  async findAll(patientId?: string): Promise<any[]> {
    const evaluations = await this.prisma.evaluation.findMany({
      where: patientId ? { patientId } : undefined,
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
        exams: true,
        reports: true,
      },
      orderBy: {
        dataAvaliacao: 'desc',
      },
    });

    return evaluations.map((evaluation) => this.decryptEvaluation(evaluation));
  }

  /**
   * Retorna uma avaliação específica por ID
   */
  async findOne(id: string): Promise<any> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
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
        exams: true,
        reports: true,
      },
    });

    if (!evaluation) {
      throw new NotFoundException(`Avaliação com ID ${id} não encontrada`);
    }

    return this.decryptEvaluation(evaluation);
  }

  /**
   * Atualiza uma avaliação existente
   */
  async update(
    id: string,
    updateEvaluationDto: UpdateEvaluationDto,
  ): Promise<any> {
    // Verificar se a avaliação existe
    const existingEvaluation = await this.prisma.evaluation.findUnique({
      where: { id },
    });

    if (!existingEvaluation) {
      throw new NotFoundException(`Avaliação com ID ${id} não encontrada`);
    }

    // Se patientId for fornecido, verificar se o paciente existe
    if (updateEvaluationDto.patientId) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: updateEvaluationDto.patientId },
      });

      if (!patient) {
        throw new NotFoundException(
          `Paciente com ID ${updateEvaluationDto.patientId} não encontrado`,
        );
      }
    }

    // Criptografar resultados dos testes se fornecidos
    const mmseResultEnc = updateEvaluationDto.mmseResult
      ? this.encryptionService.encryptObject(updateEvaluationDto.mmseResult)
      : undefined;

    const mocaResultEnc = updateEvaluationDto.mocaResult
      ? this.encryptionService.encryptObject(updateEvaluationDto.mocaResult)
      : undefined;

    const clockTestResultEnc = updateEvaluationDto.clockTestResult
      ? this.encryptionService.encryptObject(
          updateEvaluationDto.clockTestResult,
        )
      : undefined;

    // Atualizar avaliação
    const evaluation = await this.prisma.evaluation.update({
      where: { id },
      data: {
        ...updateEvaluationDto,
        mmseResultEnc,
        mocaResultEnc,
        clockTestResultEnc,
        version: { increment: 1 },
      },
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
        exams: true,
        reports: true,
      },
    });

    return this.decryptEvaluation(evaluation);
  }

  /**
   * Remove uma avaliação
   */
  async remove(id: string): Promise<void> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
    });

    if (!evaluation) {
      throw new NotFoundException(`Avaliação com ID ${id} não encontrada`);
    }

    await this.prisma.evaluation.delete({
      where: { id },
    });
  }

  /**
   * Busca avaliações por status
   */
  async findByStatus(status: string): Promise<any[]> {
    const evaluations = await this.prisma.evaluation.findMany({
      where: { status: status as any },
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
        exams: true,
        reports: true,
      },
      orderBy: {
        dataAvaliacao: 'desc',
      },
    });

    return evaluations.map((evaluation) => this.decryptEvaluation(evaluation));
  }

  /**
   * Retorna estatísticas de avaliações
   */
  async getStats(): Promise<any> {
    const [total, inProgress, completed, cancelled] = await Promise.all([
      this.prisma.evaluation.count(),
      this.prisma.evaluation.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.evaluation.count({ where: { status: 'COMPLETED' } }),
      this.prisma.evaluation.count({ where: { status: 'CANCELLED' } }),
    ]);

    return {
      total,
      byStatus: {
        inProgress,
        completed,
        cancelled,
      },
    };
  }

  /**
   * Descriptografa os resultados dos testes de uma avaliação
   */
  private decryptEvaluation(evaluation: any): any {
    try {
      return {
        ...evaluation,
        mmseResult: evaluation.mmseResultEnc
          ? this.encryptionService.decryptObject(evaluation.mmseResultEnc)
          : null,
        mocaResult: evaluation.mocaResultEnc
          ? this.encryptionService.decryptObject(evaluation.mocaResultEnc)
          : null,
        clockTestResult: evaluation.clockTestResultEnc
          ? this.encryptionService.decryptObject(evaluation.clockTestResultEnc)
          : null,
        // Remover campos criptografados do retorno
        mmseResultEnc: undefined,
        mocaResultEnc: undefined,
        clockTestResultEnc: undefined,
      };
    } catch (error) {
      console.error('Erro ao descriptografar avaliação:', error);
      return {
        ...evaluation,
        mmseResult: null,
        mocaResult: null,
        clockTestResult: null,
        mmseResultEnc: undefined,
        mocaResultEnc: undefined,
        clockTestResultEnc: undefined,
      };
    }
  }
}
