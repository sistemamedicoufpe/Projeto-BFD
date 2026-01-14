import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Create a new patient
   */
  async create(createPatientDto: CreatePatientDto) {
    // Check if CPF already exists
    const existingPatient = await this.prisma.patient.findUnique({
      where: { cpf: createPatientDto.cpf },
    });

    if (existingPatient) {
      throw new ConflictException('CPF already registered');
    }

    // Calculate age
    const birthDate = new Date(createPatientDto.dataNascimento);
    const idade = this.calculateAge(birthDate);

    // Encrypt sensitive data
    let historicoMedicoEnc = null;
    if (createPatientDto.historicoMedico) {
      historicoMedicoEnc = this.encryptionService.encrypt(createPatientDto.historicoMedico);
    }

    // Create patient
    const patient = await this.prisma.patient.create({
      data: {
        nome: createPatientDto.nome,
        cpf: createPatientDto.cpf,
        rg: createPatientDto.rg,
        dataNascimento: birthDate,
        idade,
        genero: createPatientDto.genero,
        email: createPatientDto.email,
        telefone: createPatientDto.telefone,
        celular: createPatientDto.celular,
        enderecoCompleto: createPatientDto.enderecoCompleto,
        cep: createPatientDto.cep,
        cidade: createPatientDto.cidade,
        estado: createPatientDto.estado,
        historicoMedicoEnc,
        alergias: createPatientDto.alergias || [],
        medicamentosEmUso: createPatientDto.medicamentosEmUso || [],
        nomeResponsavel: createPatientDto.nomeResponsavel,
        telefoneResponsavel: createPatientDto.telefoneResponsavel,
        observacoes: createPatientDto.observacoes,
      },
    });

    return this.decryptPatient(patient);
  }

  /**
   * Get all patients
   */
  async findAll() {
    const patients = await this.prisma.patient.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            evaluations: true,
            exams: true,
            reports: true,
          },
        },
      },
    });

    return patients.map((patient) => this.decryptPatient(patient));
  }

  /**
   * Get patient by ID
   */
  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        evaluations: {
          orderBy: { dataAvaliacao: 'desc' },
          take: 5,
        },
        exams: {
          orderBy: { dataExame: 'desc' },
          take: 5,
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!patient || patient.isDeleted) {
      throw new NotFoundException('Patient not found');
    }

    return this.decryptPatient(patient);
  }

  /**
   * Update patient
   */
  async update(id: string, updatePatientDto: UpdatePatientDto) {
    // Check if patient exists
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient || existingPatient.isDeleted) {
      throw new NotFoundException('Patient not found');
    }

    // If updating CPF, check if it's not already in use
    if (updatePatientDto.cpf && updatePatientDto.cpf !== existingPatient.cpf) {
      const cpfExists = await this.prisma.patient.findUnique({
        where: { cpf: updatePatientDto.cpf },
      });

      if (cpfExists) {
        throw new ConflictException('CPF already registered');
      }
    }

    // Calculate age if birth date is updated
    let idade = existingPatient.idade;
    if (updatePatientDto.dataNascimento) {
      const birthDate = new Date(updatePatientDto.dataNascimento);
      idade = this.calculateAge(birthDate);
    }

    // Encrypt sensitive data if provided
    let historicoMedicoEnc = existingPatient.historicoMedicoEnc;
    if (updatePatientDto.historicoMedico) {
      historicoMedicoEnc = this.encryptionService.encrypt(updatePatientDto.historicoMedico);
    }

    // Update patient
    const patient = await this.prisma.patient.update({
      where: { id },
      data: {
        ...updatePatientDto,
        idade,
        historicoMedicoEnc,
        dataNascimento: updatePatientDto.dataNascimento ? new Date(updatePatientDto.dataNascimento) : undefined,
        version: { increment: 1 },
      },
    });

    return this.decryptPatient(patient);
  }

  /**
   * Delete patient (soft delete)
   */
  async remove(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    await this.prisma.patient.update({
      where: { id },
      data: {
        isDeleted: true,
        version: { increment: 1 },
      },
    });

    return { message: 'Patient deleted successfully' };
  }

  /**
   * Search patients
   */
  async search(query: string) {
    const patients = await this.prisma.patient.findMany({
      where: {
        isDeleted: false,
        OR: [
          { nome: { contains: query, mode: 'insensitive' } },
          { cpf: { contains: query } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { nome: 'asc' },
    });

    return patients.map((patient) => this.decryptPatient(patient));
  }

  /**
   * Helper: Calculate age from birth date
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Helper: Decrypt patient sensitive data
   */
  private decryptPatient(patient: any) {
    if (patient.historicoMedicoEnc) {
      try {
        patient.historicoMedico = this.encryptionService.decrypt(patient.historicoMedicoEnc);
      } catch (error) {
        patient.historicoMedico = null;
      }
      delete patient.historicoMedicoEnc;
    }

    return patient;
  }
}
