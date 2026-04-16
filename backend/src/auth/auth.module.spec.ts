import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';

jest.mock('./auth.service', () => ({
  AuthService: class AuthService {},
}));
jest.mock('../prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma.service';
import { TokenService } from './token.service';

describe('AuthModule', () => {
  it('should declare AuthController and core auth providers', () => {
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AuthModule) ?? [];
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AuthModule) ?? [];

    expect(controllers).toContain(AuthController);
    expect(providers).toEqual(
      expect.arrayContaining([AuthService, PrismaService, TokenService, JwtStrategy]),
    );
  });
});
