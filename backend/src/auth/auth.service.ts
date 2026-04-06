import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<UserDto[]> {
    return this.prisma.users.findMany();
  }
}
