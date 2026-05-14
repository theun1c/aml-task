import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { CacheModule } from '../infrastructure/cache/cache.module';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectMembersController } from './controllers/project-members.controller';
import { ProjectsService } from './services/projects.service';
import { ProjectMembersService } from './services/project-members.service';

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [ProjectsController, ProjectMembersController],
  providers: [ProjectsService, ProjectMembersService],
  exports: [ProjectsService, ProjectMembersService],
})
export class ProjectsModule {}
