import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EncryptionService } from '../../common/services/encryption.service';

@Module({
  imports: [PrismaModule],
  controllers: [ExamsController],
  providers: [ExamsService, EncryptionService],
  exports: [ExamsService],
})
export class ExamsModule {}
