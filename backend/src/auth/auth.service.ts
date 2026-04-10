import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserResponse } from './types/user.response';

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

    const existingUser = await this.prisma.users.findFirst({
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
        name: dto.name,
      },
    });

    const userResponse = new UserResponse();
    userResponse.id = createdUser.id;
    userResponse.email = createdUser.email;
    userResponse.name = createdUser.name;

    const accessToken = 'test access' + Date.now();
    const refreshToken = 'test refresh' + Date.now();

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: userResponse,
    };
  }
}
