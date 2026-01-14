import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Cria um novo relatório/laudo
   */
  async create(createReportDto: CreateReportDto): Promise<any> {
    // Verificar se a avaliação existe
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: createReportDto.evaluationId },
      include: {
        patient: true,
        user: true,
      },
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Avaliação com ID ${createReportDto.evaluationId} não encontrada`,
      );
    }

    // Criptografar conteúdo se fornecido
    const contentEnc = createReportDto.content
      ? this.encryptionService.encryptObject(createReportDto.content)
      : null;

    // Criar relatório
    const report = await this.prisma.report.create({
      data: {
        evaluationId: createReportDto.evaluationId,
        titulo: createReportDto.titulo,
        descricao: createReportDto.descricao,
        status: createReportDto.status || 'PENDENTE',
        contentEnc,
        pdfUrl: createReportDto.pdfUrl,
        pdfKey: createReportDto.pdfKey,
      },
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

    return this.decryptReport(report);
  }

  /**
   * Retorna todos os relatórios (com filtro opcional por avaliação)
   */
  async findAll(evaluationId?: string): Promise<any[]> {
    const reports = await this.prisma.report.findMany({
      where: evaluationId ? { evaluationId } : undefined,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reports.map((report) => this.decryptReport(report));
  }

  /**
   * Retorna um relatório específico por ID
   */
  async findOne(id: string): Promise<any> {
    const report = await this.prisma.report.findUnique({
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
            exams: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
    }

    return this.decryptReport(report);
  }

  /**
   * Atualiza um relatório existente
   */
  async update(id: string, updateReportDto: UpdateReportDto): Promise<any> {
    // Verificar se o relatório existe
    const existingReport = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!existingReport) {
      throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
    }

    // Se evaluationId for fornecido, verificar se a avaliação existe
    if (updateReportDto.evaluationId) {
      const evaluation = await this.prisma.evaluation.findUnique({
        where: { id: updateReportDto.evaluationId },
      });

      if (!evaluation) {
        throw new NotFoundException(
          `Avaliação com ID ${updateReportDto.evaluationId} não encontrada`,
        );
      }
    }

    // Criptografar conteúdo se fornecido
    const contentEnc = updateReportDto.content
      ? this.encryptionService.encryptObject(updateReportDto.content)
      : undefined;

    // Atualizar relatório
    const report = await this.prisma.report.update({
      where: { id },
      data: {
        ...updateReportDto,
        contentEnc,
        version: { increment: 1 },
      },
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

    return this.decryptReport(report);
  }

  /**
   * Remove um relatório
   */
  async remove(id: string): Promise<void> {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
    }

    await this.prisma.report.delete({
      where: { id },
    });
  }

  /**
   * Busca relatórios por status
   */
  async findByStatus(status: string): Promise<any[]> {
    const reports = await this.prisma.report.findMany({
      where: { status: status as any },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reports.map((report) => this.decryptReport(report));
  }

  /**
   * Atualiza o status de um relatório
   */
  async updateStatus(id: string, status: string): Promise<any> {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Relatório com ID ${id} não encontrado`);
    }

    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: {
        status: status as any,
        version: { increment: 1 },
      },
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

    return this.decryptReport(updatedReport);
  }

  /**
   * Retorna estatísticas de relatórios
   */
  async getStats(): Promise<any> {
    const [total, pendente, emRevisao, concluido, assinado] =
      await Promise.all([
        this.prisma.report.count(),
        this.prisma.report.count({ where: { status: 'PENDENTE' } }),
        this.prisma.report.count({ where: { status: 'EM_REVISAO' } }),
        this.prisma.report.count({ where: { status: 'CONCLUIDO' } }),
        this.prisma.report.count({ where: { status: 'ASSINADO' } }),
      ]);

    return {
      total,
      byStatus: {
        pendente,
        emRevisao,
        concluido,
        assinado,
      },
    };
  }

  /**
   * Descriptografa o conteúdo de um relatório
   */
  private decryptReport(report: any): any {
    try {
      return {
        ...report,
        content: report.contentEnc
          ? this.encryptionService.decryptObject(report.contentEnc)
          : null,
        // Remover campo criptografado do retorno
        contentEnc: undefined,
      };
    } catch (error) {
      console.error('Erro ao descriptografar relatório:', error);
      return {
        ...report,
        content: null,
        contentEnc: undefined,
      };
    }
  }
}
