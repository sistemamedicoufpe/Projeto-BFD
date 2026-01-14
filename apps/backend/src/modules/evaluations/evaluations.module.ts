import { Module } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EncryptionService } from '../../common/services/encryption.service';

@Module({
  imports: [PrismaModule],
  controllers: [EvaluationsController],
  providers: [EvaluationsService, EncryptionService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
