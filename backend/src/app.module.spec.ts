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
jest.mock(
  './issues/issues.module',
  () => ({
    IssuesModule: class IssuesModule {},
  }),
  { virtual: true },
);
jest.mock(
  './projects/projects.module',
  () => ({
    ProjectsModule: class ProjectsModule {},
  }),
  { virtual: true },
);
jest.mock(
  './statuses/statuses.module',
  () => ({
    StatusesModule: class StatusesModule {},
  }),
  { virtual: true },
);
jest.mock(
  './sprints/sprints.module',
  () => ({
    SprintsModule: class SprintsModule {},
  }),
  { virtual: true },
);
jest.mock(
  './comments/comments.module',
  () => ({
    CommentsModule: class CommentsModule {},
  }),
  { virtual: true },
);

import { AppModule } from './app.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { IssuesModule } from './issues/issues.module';
import { ProjectsModule } from './projects/projects.module';
import { StatusesModule } from './statuses/statuses.module';
import { SprintsModule } from './sprints/sprints.module';
import { CommentsModule } from './comments/comments.module';

describe('AppModule', () => {
  it('should import domain modules and infrastructure modules', () => {
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule) ?? [];

    expect(imports).toEqual(
      expect.arrayContaining([
        AuthModule,
        UsersModule,
        PrismaModule,
        IssuesModule,
        ProjectsModule,
        StatusesModule,
        SprintsModule,
        CommentsModule,
      ]),
    );
  });
});
