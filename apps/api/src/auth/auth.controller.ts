import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto, LoginDto, OtpSendDto, OtpVerifyDto, RefreshDto, RegisterDto, ResetPasswordDto } from './dto/register.dto';
import { Request } from '@nestjs/common';

@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register') register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Post('admin/login') adminLogin(@Body() dto: LoginDto) { return this.auth.login(dto, true); }
  @Post('otp/send') otpSend(@Body() dto: OtpSendDto) { return this.auth.otpSend(dto.phone); }
  @Post('otp/verify') otpVerify(@Body() dto: OtpVerifyDto) { return this.auth.otpVerify(dto); }
  @Post('forgot-password') forgot(@Body() dto: ForgotPasswordDto) { return this.auth.forgotPassword(dto.email); }
  @Post('reset-password') reset(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto); }
  @Post('refresh') refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) { return this.auth.me(req.user.id); }
}
