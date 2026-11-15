import { IsEmail, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) name: string;
  @ValidateIf(o => !o.phone) @IsEmail() email?: string;
  @ValidateIf(o => !o.email) @Matches(/^[6-9]\d{9}$/) phone?: string;
  @IsString() @MinLength(6) password: string;
}
export class LoginDto {
  @IsString() identifier: string;
  @IsString() password: string;
}
export class OtpSendDto {
  @Matches(/^[6-9]\d{9}$/) phone: string;
}
export class OtpVerifyDto {
  @Matches(/^[6-9]\d{9}$/) phone: string;
  @IsString() otp: string;
  @IsOptional() @IsString() name?: string;
}
export class ForgotPasswordDto {
  @IsEmail() email: string;
}
export class ResetPasswordDto {
  @IsString() token: string;
  @IsString() @MinLength(6) password: string;
}
export class RefreshDto {
  @IsString() refreshToken: string;
}
