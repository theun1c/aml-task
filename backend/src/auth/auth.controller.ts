import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  async getAllUsers(): Promise<UserDto[]> {
    return this.authService.getAllUsers();
  }
}
