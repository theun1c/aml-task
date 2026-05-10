import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ProjectsService } from '../../projects/services/projects.service';
import { StatusesService } from './statuses.service';

describe('StatusesService', () => {
  let service: StatusesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusesService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ProjectsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<StatusesService>(StatusesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
