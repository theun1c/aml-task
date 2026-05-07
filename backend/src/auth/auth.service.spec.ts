import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';

jest.mock('../infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { AuthService } from './services/auth.service';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { TokenService } from './services/token.service';

type PrismaMock = {
  users: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  user_sessions: {
    create: jest.Mock;
    update: jest.Mock;
    findUnique: jest.Mock;
    updateMany: jest.Mock;
    findMany: jest.Mock;
  };
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMock;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    prisma = {
      users: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      user_sessions: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn(),
      },
    };

    tokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;

    service = new AuthService(prisma as unknown as PrismaService, tokenService);
  });

  const hashRefreshToken = (value: string) => createHash('sha256').update(value).digest('hex');

  it('register() should throw ConflictException when user with normalized email already exists', async () => {
    prisma.users.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      name: 'User',
      password_hash: 'hash',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await expect(
      service.register({
        email: '  USER@EXAMPLE.COM  ',
        password: 'strongPass123',
        full_name: 'User Name',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'user@example.com',
      },
    });
  });

  it('login() should throw UnauthorizedException on wrong password', async () => {
    prisma.users.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      name: 'User',
      password_hash: '$2b$08$Y8R4n0eU0t0m76f9bTAPjOl9PcoYQnN5ab7x7fAnKxKhd3xvCp5na',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrongPass123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh() should throw UnauthorizedException when refresh token hash does not match session hash', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'u1',
      sid: 's1',
      type: 'refresh',
    });
    prisma.user_sessions.findUnique.mockResolvedValue({
      id: 's1',
      user_id: 'u1',
      is_revoked: false,
      refresh_token_hash: 'another-hash',
      revoked_at: null,
      expires_at: new Date(Date.now() + 60_000),
      created_at: new Date(),
      updated_at: new Date(),
      users: {
        id: 'u1',
        email: 'user@example.com',
        full_name: 'User',
      },
    });

    await expect(
      service.refresh({
        refresh_token: 'refresh-token-value',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh() should throw UnauthorizedException when session is revoked via is_revoked flag', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'u1',
      sid: 's1',
      type: 'refresh',
    });
    prisma.user_sessions.findUnique.mockResolvedValue({
      id: 's1',
      user_id: 'u1',
      is_revoked: true,
      refresh_token_hash: hashRefreshToken('refresh-token-value'),
      revoked_at: null,
      expires_at: new Date(Date.now() + 60_000),
      created_at: new Date(),
      updated_at: new Date(),
      users: {
        id: 'u1',
        email: 'user@example.com',
        full_name: 'User',
      },
    });

    await expect(
      service.refresh({
        refresh_token: 'refresh-token-value',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it('logoutCurrentSession() should set both is_revoked and revoked_at', async () => {
    prisma.user_sessions.update.mockResolvedValue({
      id: 's1',
    });

    await service.logoutCurrentSession('s1');

    expect(prisma.user_sessions.update).toHaveBeenCalledWith({
      where: {
        id: 's1',
      },
      data: expect.objectContaining({
        is_revoked: true,
        revoked_at: expect.any(Date),
        updated_at: expect.any(Date),
      }),
    });
  });

  it('getSessions() should request only non-revoked user_sessions', async () => {
    prisma.user_sessions.findMany.mockResolvedValue([]);

    await service.getSessions('u1');

    expect(prisma.user_sessions.findMany).toHaveBeenCalledWith({
      where: {
        user_id: 'u1',
        is_revoked: false,
        revoked_at: null,
        expires_at: {
          gt: expect.any(Date),
        },
      },
      select: {
        id: true,
        created_at: true,
        expires_at: true,
        revoked_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  });
});
