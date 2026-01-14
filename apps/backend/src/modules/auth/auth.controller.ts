import { Controller, Post, Body, UseGuards, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(@CurrentUser() user: any) {
    return this.authService.enable2FA(user.id);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(@CurrentUser() user: any, @Body('token') token: string) {
    return this.authService.verify2FA(user.id, token);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disable2FA(@CurrentUser() user: any, @Body('password') password: string) {
    return this.authService.disable2FA(user.id, password);
  }
}
