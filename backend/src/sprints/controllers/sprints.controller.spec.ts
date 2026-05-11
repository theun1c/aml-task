import { Test, TestingModule } from '@nestjs/testing';
import { SprintsController } from './sprints.controller';
import { SprintsService } from '../services/sprints.service';

describe('SprintsController', () => {
  let controller: SprintsController;
  let sprintsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    findActive: jest.Mock;
    update: jest.Mock;
    start: jest.Mock;
    complete: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    sprintsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      update: jest.fn(),
      start: jest.fn(),
      complete: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SprintsController],
      providers: [
        {
          provide: SprintsService,
          useValue: sprintsService,
        },
      ],
    }).compile();

    controller = module.get<SprintsController>(SprintsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findById() should delegate to service with resolved user id', async () => {
    const sprint = {
      id: 'sprint-1',
      project_id: 'project-1',
    };
    sprintsService.findById.mockResolvedValue(sprint);

    const result = await controller.findById(
      {
        id: 'user-1',
      },
      'project-1',
      'sprint-1',
    );

    expect(sprintsService.findById).toHaveBeenCalledWith('project-1', 'sprint-1', 'user-1');
    expect(result).toBe(sprint);
  });

  it('update() should delegate to service with dto payload', async () => {
    const sprint = {
      id: 'sprint-1',
      project_id: 'project-1',
      name: 'Sprint 1',
    };
    sprintsService.update.mockResolvedValue(sprint);

    const result = await controller.update(
      {
        sub: 'user-1',
      },
      'project-1',
      'sprint-1',
      {
        name: 'Updated sprint',
      },
    );

    expect(sprintsService.update).toHaveBeenCalledWith('project-1', 'sprint-1', 'user-1', {
      name: 'Updated sprint',
    });
    expect(result).toBe(sprint);
  });

  it('delete() should return success response after service call', async () => {
    sprintsService.delete.mockResolvedValue(undefined);

    const result = await controller.delete(
      {
        user_id: 'user-1',
      },
      'project-1',
      'sprint-1',
    );

    expect(sprintsService.delete).toHaveBeenCalledWith('project-1', 'sprint-1', 'user-1');
    expect(result).toEqual({ success: true });
  });
});
