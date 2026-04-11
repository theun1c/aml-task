import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserResponse } from './types/user.response';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { TokensResponse } from './types/tokens.response';
import { RefreshTokenPayload, TokenService } from './token.service';

const SALT_ROUNDS = 8;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  // HELPFUL
  // emailNormalize
  // cleanup email
  private emailNormalize(email: string): string {
    return email.trim().toLowerCase();
  }

  // HELPFUL
  // toUserResponse
  // map to user resp
  private toUserResponse(id: string, email: string, name: string): UserResponse {
    const userResponse = new UserResponse();
    userResponse.id = id;
    userResponse.email = email;
    userResponse.name = name;

    return userResponse;
  }

  // HELPFUL
  // buildUserResponse
  // for build resp
  private buildUserResponse(accessToken: string, refreshToken: string, user: UserResponse) {
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: user,
    };
  }

  // HELPFUL
  // createSession
  // for session creation
  private async createSession(id: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await this.prisma.sessions.create({
      data: {
        user_id: id,
        refresh_token_hash: '',
        expires_at: expiresAt,
      },
    });

    return session;
  }

  private async updateSessionRefreshToken(sessionId: string, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.sessions.update({
      where: {
        id: sessionId,
      },
      data: {
        refresh_token_hash: refreshTokenHash,
        expires_at: expiresAt,
        revoked_at: null,
        updated_at: new Date(),
      },
    });
  }

  private async issueTokensForUser(user: { id: string; email: string }) {
    const session = await this.createSession(user.id);

    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      sid: session.id,
      email: user.email,
    });

    const refreshToken = await this.tokenService.generateRefreshToken({
      sub: user.id,
      sid: session.id,
    });

    await this.updateSessionRefreshToken(session.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
    };
  }

  // HELPFUL
  // createUser
  // for user creation
  private async createUser(email: string, password: string, name: string) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const trimmedName = name.trim();

    const createdUser = await this.prisma.users.create({
      data: {
        email: email,
        password_hash: passwordHash,
        name: trimmedName,
      },
    });

    return createdUser;
  }

  // BL
  // REGISTER
  async register(dto: RegisterDto) {
    const emailNormalized = this.emailNormalize(dto.email);

    const existingUser = await this.prisma.users.findUnique({
      where: {
        email: emailNormalized,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const createdUser = await this.createUser(emailNormalized, dto.password, dto.name);

    const { accessToken, refreshToken } = await this.issueTokensForUser({
      id: createdUser.id,
      email: createdUser.email,
    });

    const userResponse = this.toUserResponse(createdUser.id, createdUser.email, createdUser.name);

    return this.buildUserResponse(accessToken, refreshToken, userResponse);
  }

  // BL
  // LOGIN
  async login(dto: LoginDto) {
    const emailNormalized = this.emailNormalize(dto.email);

    const user = await this.prisma.users.findUnique({
      where: {
        email: emailNormalized,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password_hash);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.issueTokensForUser({
      id: user.id,
      email: user.email,
    });

    const userResponse = this.toUserResponse(user.id, user.email, user.name);

    return this.buildUserResponse(accessToken, refreshToken, userResponse);
  }

  // BL
  // REFRESH
  async refresh(dto: RefreshDto): Promise<TokensResponse> {
    const incomingRefreshToken = dto.refreshToken;

    let payload: RefreshTokenPayload;
    try {
      payload = await this.tokenService.verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.sessions.findUnique({
      where: {
        id: payload.sid,
      },
      include: {
        users: true,
      },
    });

    if (!session.users) {
      throw new UnauthorizedException('User not found');
    }

    if (session.user_id !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.revoked_at) {
      throw new UnauthorizedException('Session revoked');
    }

    if (session.expires_at <= new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      incomingRefreshToken,
      session.refresh_token_hash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.tokenService.generateAccessToken({
      sub: session.users.id,
      sid: session.id,
      email: session.users.email,
    });

    const refreshToken = await this.tokenService.generateRefreshToken({
      sub: session.users.id,
      sid: session.id,
    });

    await this.updateSessionRefreshToken(session.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logoutCurrentSession(sessionId: string): Promise<void> {
    await this.prisma.sessions.update({
      where: {
        id: sessionId,
      },
      data: {
        revoked_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await this.prisma.sessions.updateMany({
      where: {
        user_id: userId,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async getSessions(userId: string) {
    return this.prisma.sessions.findMany({
      where: {
        user_id: userId,
        revoked_at: null,
        expires_at: {
          gt: new Date(), // ?
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
  }
}
