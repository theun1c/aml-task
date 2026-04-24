import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';

jest.mock('./services/auth.service', () => ({
  AuthService: class AuthService {},
}));
jest.mock('../infrastructure/prisma/prisma.module', () => ({
  PrismaModule: class PrismaModule {},
}));
jest.mock('../infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { AuthController } from './controllers/auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { TokenService } from './services/token.service';

describe('AuthModule', () => {
  it('should declare AuthController, core providers, and infrastructure imports', () => {
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AuthModule) ?? [];
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AuthModule) ?? [];
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AuthModule) ?? [];

    expect(controllers).toContain(AuthController);
    expect(providers).toEqual(expect.arrayContaining([AuthService, TokenService, JwtStrategy]));
    expect(imports).toEqual(expect.arrayContaining([PrismaModule]));
  });
});
