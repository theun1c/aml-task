import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { SprintsController } from './controllers/sprints.controller';
import { SprintsService } from './services/sprints.service';

@Module({
  imports: [PrismaModule, ProjectsModule],
  controllers: [SprintsController],
  providers: [SprintsService],
  exports: [SprintsService],
})
export class SprintsModule {}
