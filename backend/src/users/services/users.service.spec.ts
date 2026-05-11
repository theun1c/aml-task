import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('../../infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UsersService } from './users.service';

type PrismaMock = {
  users: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      users: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new UsersService(prisma as unknown as PrismaService);
  });

  it('getProfile() should return public profile for active non-deleted user', async () => {
    prisma.users.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'User Name',
      is_active: true,
      deleted_at: null,
    });

    await expect(service.getProfile('user-1')).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'User Name',
    });
    expect(prisma.users.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
        deleted_at: null,
        is_active: true,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
      },
    });
  });

  it('updateProfile() should normalize email and full_name before saving', async () => {
    prisma.users.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'User Name',
    });
    prisma.users.findUnique.mockResolvedValue(null);
    prisma.users.update.mockResolvedValue({
      id: 'user-1',
      email: 'new@example.com',
      full_name: 'New Name',
    });

    const result = await service.updateProfile('user-1', {
      email: '  NEW@EXAMPLE.COM  ',
      full_name: '  New Name  ',
    });

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'new@example.com',
      },
      select: {
        id: true,
      },
    });
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
      data: {
        email: 'new@example.com',
        full_name: 'New Name',
        updated_at: expect.any(Date),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
      },
    });
    expect(result).toEqual({
      id: 'user-1',
      email: 'new@example.com',
      full_name: 'New Name',
    });
  });

  it('updateProfile() should throw ConflictException for another user email', async () => {
    prisma.users.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'User Name',
    });
    prisma.users.findUnique.mockResolvedValue({
      id: 'user-2',
    });

    await expect(
      service.updateProfile('user-1', {
        email: 'existing@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('getProfile() should throw NotFoundException for missing user', async () => {
    prisma.users.findFirst.mockResolvedValue(null);

    await expect(service.getProfile('missing-user')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('searchByEmail() should normalize email query and return public profiles only', async () => {
    prisma.users.findMany.mockResolvedValue([
      {
        id: 'user-1',
        email: 'alex@example.com',
        full_name: 'Alex One',
      },
      {
        id: 'user-2',
        email: 'max@example.com',
        full_name: 'Max Two',
      },
    ]);

    await expect(service.searchByEmail('  EXA  ')).resolves.toEqual([
      {
        id: 'user-1',
        email: 'alex@example.com',
        full_name: 'Alex One',
      },
      {
        id: 'user-2',
        email: 'max@example.com',
        full_name: 'Max Two',
      },
    ]);

    expect(prisma.users.findMany).toHaveBeenCalledWith({
      where: {
        email: {
          contains: 'exa',
        },
        deleted_at: null,
        is_active: true,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
      },
      orderBy: {
        email: 'asc',
      },
      take: 10,
    });
  });
});
