import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('JWT_ACCESS_TTL', '15m') as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, TokenService, JwtService],
  exports: [TokenService],
})
export class AuthModule {}
