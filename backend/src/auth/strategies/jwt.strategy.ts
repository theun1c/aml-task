import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

type AccessJwtPayload = {
  sub: string;
  sid: string;
  email: string;
  type: 'access';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: AccessJwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const session = await this.prisma.user_sessions.findUnique({
      where: {
        id: payload.sid,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.user_id !== payload.sub) {
      throw new UnauthorizedException('Invalid session');
    }

    if (session.is_revoked || session.revoked_at) {
      throw new UnauthorizedException('Session revoked');
    }

    if (session.expires_at <= new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const user = await this.prisma.users.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.full_name,
      sessionId: payload.sid,
    };
  }
}
