import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EncryptionService } from '../../common/services/encryption.service';

@Module({
  imports: [PrismaModule],
  controllers: [PatientsController],
  providers: [PatientsService, EncryptionService],
  exports: [PatientsService],
})
export class PatientsModule {}
