import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { AuthenticatedUser } from './current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('/refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logout(@CurrentUser() user: AuthenticatedUser) {
    await this.authService.logoutCurrentSession(user.sessionId);
    return { success: true };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('/logout-all')
  async logoutAll(@CurrentUser() user: AuthenticatedUser) {
    await this.authService.logoutAllSessions(user.id);
    return { success: true };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('/sessions')
  getSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getSessions(user.id);
  }
}
