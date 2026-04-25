import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';

jest.mock('./auth/auth.module', () => ({
  AuthModule: class AuthModule {},
}));
jest.mock(
  './users/users.module',
  () => ({
    UsersModule: class UsersModule {},
  }),
  { virtual: true },
);
jest.mock(
  './infrastructure/prisma/prisma.module',
  () => ({
    PrismaModule: class PrismaModule {},
  }),
  { virtual: true },
);

import { AppModule } from './app.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

describe('AppModule', () => {
  it('should import domain modules and infrastructure modules', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule) ?? [];

    expect(imports).toEqual(expect.arrayContaining([AuthModule, UsersModule, PrismaModule]));
  });
});
