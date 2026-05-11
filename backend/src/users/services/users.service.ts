import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserProfileResponse } from '../responses/user-profile.response';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.findActiveUserOrThrow(userId);

    return this.toUserProfileResponse(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileResponse> {
    const existingUser = await this.findActiveUserOrThrow(userId);
    const normalizedEmail = dto.email !== undefined ? this.normalizeEmail(dto.email) : undefined;
    const normalizedFullName =
      dto.full_name !== undefined ? this.normalizeFullName(dto.full_name) : undefined;

    if (normalizedEmail !== undefined && normalizedEmail !== existingUser.email) {
      const userWithSameEmail = await this.prisma.users.findUnique({
        where: {
          email: normalizedEmail,
        },
        select: {
          id: true,
        },
      });

      if (userWithSameEmail && userWithSameEmail.id !== userId) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updateData = {
      ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
      ...(normalizedFullName !== undefined ? { full_name: normalizedFullName } : {}),
    };

    if (Object.keys(updateData).length === 0) {
      return this.toUserProfileResponse(existingUser);
    }

    const updatedUser = await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
      },
    });

    return this.toUserProfileResponse(updatedUser);
  }

  private async findActiveUserOrThrow(userId: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        id: userId,
        deleted_at: null,
        is_active: true,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private toUserProfileResponse(user: {
    id: string;
    email: string;
    full_name: string;
  }): UserProfileResponse {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizeFullName(fullName: string): string {
    return fullName.trim();
  }
}
