import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

jest.mock('../infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';

type PrismaMock = {
  user_sessions: {
    findUnique: jest.Mock;
  };
  users: {
    findUnique: jest.Mock;
  };
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: PrismaMock;
  let configService: ConfigService;

  beforeEach(() => {
    prisma = {
      user_sessions: {
        findUnique: jest.fn(),
      },
      users: {
        findUnique: jest.fn(),
      },
    };

    configService = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService, prisma as unknown as PrismaService);
  });

  it('validate() should reject session revoked by is_revoked flag', async () => {
    prisma.user_sessions.findUnique.mockResolvedValue({
      id: 's1',
      user_id: 'u1',
      is_revoked: true,
      revoked_at: null,
      expires_at: new Date(Date.now() + 60_000),
    });
    prisma.users.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      full_name: 'User Name',
    });

    await expect(
      strategy.validate({
        sub: 'u1',
        sid: 's1',
        email: 'user@example.com',
        type: 'access',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });

  it('validate() should reject inactive user', async () => {
    prisma.user_sessions.findUnique.mockResolvedValue({
      id: 's1',
      user_id: 'u1',
      is_revoked: false,
      revoked_at: null,
      expires_at: new Date(Date.now() + 60_000),
    });
    prisma.users.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      full_name: 'User Name',
      is_active: false,
      deleted_at: null,
    });

    await expect(
      strategy.validate({
        sub: 'u1',
        sid: 's1',
        email: 'user@example.com',
        type: 'access',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('validate() should reject soft-deleted user', async () => {
    prisma.user_sessions.findUnique.mockResolvedValue({
      id: 's1',
      user_id: 'u1',
      is_revoked: false,
      revoked_at: null,
      expires_at: new Date(Date.now() + 60_000),
    });
    prisma.users.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      full_name: 'User Name',
      is_active: true,
      deleted_at: new Date(),
    });

    await expect(
      strategy.validate({
        sub: 'u1',
        sid: 's1',
        email: 'user@example.com',
        type: 'access',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
