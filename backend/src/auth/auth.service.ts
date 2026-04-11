import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserResponse } from './types/user.response';
import { LoginDto } from './dto/login.dto';

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

    const SALT_ROUNDS = 8;
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const createdUser = await this.prisma.users.create({
      data: {
        email: emailNormalized,
        password_hash: passwordHash,
        name: dto.name.trim(),
      },
    });

    const userResponse = this.toUserResponse(createdUser.id, createdUser.email, createdUser.name);

    const accessToken = 'test access' + Date.now();
    const refreshToken = 'test refresh' + Date.now();

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await this.prisma.sessions.create({
      data: {
        user_id: userResponse.id,
        refresh_token_hash: refreshTokenHash,
        expires_at: expiresAt,
      },
    });

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

    const accessToken = 'test access' + Date.now();
    const refreshToken = 'test refresh' + Date.now();

    const SALT_ROUNDS = 8;
    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await this.prisma.sessions.create({
      data: {
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        expires_at: expiresAt,
      },
    });

    const userResponse = this.toUserResponse(user.id, user.email, user.name);
    return this.buildUserResponse(accessToken, refreshToken, userResponse);
  }
}
