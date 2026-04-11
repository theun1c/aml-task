import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserResponse } from './types/user.response';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 8;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // HELPFUL
  // emailNormalize
  // cleanup email
  private emailNormalize(email: string): string {
    return email.trim().toLocaleLowerCase();
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
  private async createSession(refreshToken: string, id: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await this.prisma.sessions.create({
      data: {
        user_id: id,
        refresh_token_hash: refreshTokenHash,
        expires_at: expiresAt,
      },
    });

    return session;
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

  // HELPFUL
  // generateMockTokens
  // for tokens generator
  private generateMockTokens(): { accessToken: string; refreshToken: string } {
    return {
      accessToken: 'access_' + Date.now(),
      refreshToken: 'refresh_' + Date.now(),
    };
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

    const createdUser = await this.createUser(existingUser.email, dto.password, existingUser.name);

    const userResponse = this.toUserResponse(createdUser.id, createdUser.email, createdUser.name);

    const { accessToken, refreshToken } = this.generateMockTokens();

    const session = this.createSession(refreshToken, userResponse.id);

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

    const { accessToken, refreshToken } = this.generateMockTokens();

    const session = this.createSession(refreshToken, user.id);

    const userResponse = this.toUserResponse(user.id, user.email, user.name);
    return this.buildUserResponse(accessToken, refreshToken, userResponse);
  }
}
