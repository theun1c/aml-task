import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { StatusesController } from './controllers/statuses.controller';
import { StatusesService } from './services/statuses.service';

@Module({
  imports: [PrismaModule, ProjectsModule],
  controllers: [StatusesController],
  providers: [StatusesService],
  exports: [StatusesService],
})
export class StatusesModule {}
