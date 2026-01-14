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
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Evaluations')
@ApiBearerAuth('JWT-auth')
@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova avaliação neurológica' })
  @ApiResponse({
    status: 201,
    description: 'Avaliação criada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  create(
    @Body() createEvaluationDto: CreateEvaluationDto,
    @CurrentUser() user: any,
  ) {
    return this.evaluationsService.create(createEvaluationDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as avaliações' })
  @ApiQuery({
    name: 'patientId',
    required: false,
    description: 'Filtrar por ID do paciente',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de avaliações retornada com sucesso',
  })
  findAll(@Query('patientId') patientId?: string) {
    return this.evaluationsService.findAll(patientId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de avaliações' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
  })
  getStats() {
    return this.evaluationsService.getStats();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Buscar avaliações por status' })
  @ApiResponse({
    status: 200,
    description: 'Avaliações encontradas',
  })
  findByStatus(@Param('status') status: string) {
    return this.evaluationsService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar avaliação por ID' })
  @ApiResponse({
    status: 200,
    description: 'Avaliação encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Avaliação não encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar avaliação' })
  @ApiResponse({
    status: 200,
    description: 'Avaliação atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Avaliação não encontrada',
  })
  update(
    @Param('id') id: string,
    @Body() updateEvaluationDto: UpdateEvaluationDto,
  ) {
    return this.evaluationsService.update(id, updateEvaluationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir avaliação' })
  @ApiResponse({
    status: 200,
    description: 'Avaliação excluída com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Avaliação não encontrada',
  })
  remove(@Param('id') id: string) {
    return this.evaluationsService.remove(id);
  }
}
