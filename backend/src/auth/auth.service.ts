import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserResponse } from './types/user.response';
import { LoginDto } from './dto/login.dto';

// ### `POST /auth/register`
// Request:
// ```json
// {
//   "email": "user@example.com",
//   "password": "strongPass123",
//   "name": "Alex"
// }
// ```
// Response `201`:
// ```json
// {
//   "accessToken": "<jwt>",
//   "refreshToken": "<jwt>",
//   "user": {
//     "id": "uuid",
//     "email": "user@example.com",
//     "name": "Alex"
//   }
// }
// ```

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const emailNormalized = dto.email.trim().toLowerCase();

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

    const userResponse = new UserResponse();
    userResponse.id = createdUser.id;
    userResponse.email = createdUser.email;
    userResponse.name = createdUser.name;

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

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: userResponse,
    };
  }

  async login(dto: LoginDto) {
    const emailNormalized = dto.email.trim().toLowerCase();

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

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
