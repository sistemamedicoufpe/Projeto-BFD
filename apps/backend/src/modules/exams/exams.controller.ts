import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Exams')
@ApiBearerAuth('JWT-auth')
@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo exame médico' })
  @ApiResponse({
    status: 201,
    description: 'Exame criado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Avaliação não encontrada',
  })
  create(@Body() createExamDto: CreateExamDto) {
    return this.examsService.create(createExamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os exames' })
  @ApiQuery({
    name: 'evaluationId',
    required: false,
    description: 'Filtrar por ID da avaliação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de exames retornada com sucesso',
  })
  findAll(@Query('evaluationId') evaluationId?: string) {
    return this.examsService.findAll(evaluationId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de exames' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
  })
  getStats() {
    return this.examsService.getStats();
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Buscar exames por tipo' })
  @ApiResponse({
    status: 200,
    description: 'Exames encontrados',
  })
  findByType(@Param('type') type: string) {
    return this.examsService.findByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar exame por ID' })
  @ApiResponse({
    status: 200,
    description: 'Exame encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Exame não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar exame' })
  @ApiResponse({
    status: 200,
    description: 'Exame atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Exame não encontrado',
  })
  update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examsService.update(id, updateExamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir exame' })
  @ApiResponse({
    status: 200,
    description: 'Exame excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Exame não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
