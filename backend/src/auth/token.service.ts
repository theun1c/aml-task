import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

export type AccessTokenInput = {
  sub: string;
  email: string;
  sid: string;
};

export type AccessTokenPayload = AccessTokenInput & {
  type: 'access';
};

export type RefreshTokenInput = {
  sub: string;
  sid: string;
};

export type RefreshTokenPayload = RefreshTokenInput & {
  type: 'refresh';
};

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async generateAccessToken(payload: Omit<AccessTokenPayload, 'type'>): Promise<string> {
    return this.jwtService.signAsync({
      ...payload,
      type: 'access',
    });
  }

  async generateRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): Promise<string> {
    return this.jwtService.signAsync(
      {
        ...payload,
        type: 'refresh',
      },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow<string>('JWT_REFRESH_TTL') as StringValue,
      },
    );
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    return payload;
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    return payload;
  }
}
