import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsDateString, Matches } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'CPF must be 11 digits' })
  cpf: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsDateString()
  @IsNotEmpty()
  dataNascimento: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  genero: Gender;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsString()
  enderecoCompleto?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  historicoMedico?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alergias?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicamentosEmUso?: string[];

  @IsOptional()
  @IsString()
  nomeResponsavel?: string;

  @IsOptional()
  @IsString()
  telefoneResponsavel?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
