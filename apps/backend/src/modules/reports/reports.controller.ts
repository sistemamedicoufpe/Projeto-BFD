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
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo relatório/laudo' })
  @ApiResponse({
    status: 201,
    description: 'Relatório criado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Avaliação não encontrada',
  })
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os relatórios' })
  @ApiQuery({
    name: 'evaluationId',
    required: false,
    description: 'Filtrar por ID da avaliação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de relatórios retornada com sucesso',
  })
  findAll(@Query('evaluationId') evaluationId?: string) {
    return this.reportsService.findAll(evaluationId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de relatórios' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
  })
  getStats() {
    return this.reportsService.getStats();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Buscar relatórios por status' })
  @ApiResponse({
    status: 200,
    description: 'Relatórios encontrados',
  })
  findByStatus(@Param('status') status: string) {
    return this.reportsService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar relatório por ID' })
  @ApiResponse({
    status: 200,
    description: 'Relatório encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Relatório não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar relatório' })
  @ApiResponse({
    status: 200,
    description: 'Relatório atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Relatório não encontrado',
  })
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(id, updateReportDto);
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Atualizar status do relatório' })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Relatório não encontrado',
  })
  updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.reportsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir relatório' })
  @ApiResponse({
    status: 200,
    description: 'Relatório excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Relatório não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}
