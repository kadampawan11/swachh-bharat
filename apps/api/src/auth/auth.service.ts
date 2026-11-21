import { BadRequestException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma.service';

const MOCK_OTP = '123456';
// Mock OTP and reset tokens in responses are for local testing only.
const DEV_AUTH = process.env.NODE_ENV !== 'production';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private sanitize(user: any) {
    const { passwordHash, resetToken, resetExpires, ...safe } = user;
    return safe;
  }
  private async tokens(user: { id: string; role: Role }) {
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role, type: 'access' });
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '30d' },
    );
    return { accessToken, refreshToken };
  }

  async register(dto: { name: string; email?: string; phone?: string; password: string }) {
    if (!dto.email && !dto.phone) throw new BadRequestException('Email or phone required');
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email ?? undefined }, { phone: dto.phone ?? undefined }] },
    });
    if (exists) throw new BadRequestException('Account already exists');
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        passwordHash: await bcrypt.hash(dto.password, 10),
        role: Role.USER,
      },
    });
    return { user: this.sanitize(user), tokens: await this.tokens(user) };
  }

  async login(dto: { identifier: string; password: string }, adminOnly = false) {
    const id = dto.identifier.trim();
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: id }, { phone: id }] },
    });
    if (!user || !user.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account deactivated');
    if (adminOnly && user.role === Role.USER)
      throw new UnauthorizedException('Not an admin account');
    return { user: this.sanitize(user), tokens: await this.tokens(user) };
  }

  async otpSend(phone: string) {
    // Mock OTP for local dev — always 123456. Swap to Firebase Phone Auth later.
    if (!DEV_AUTH) throw new ServiceUnavailableException('Phone OTP login is not configured');
    return { sent: true, phone, mockOtp: MOCK_OTP };
  }

  async otpVerify(dto: { phone: string; otp: string; name?: string }) {
    if (!DEV_AUTH) throw new ServiceUnavailableException('Phone OTP login is not configured');
    if (dto.otp !== MOCK_OTP) throw new UnauthorizedException('Invalid OTP');
    let user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { name: dto.name ?? `User ${dto.phone.slice(-4)}`, phone: dto.phone, role: Role.USER },
      });
    }
    return { user: this.sanitize(user), tokens: await this.tokens(user) };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { sent: true }; // don't leak existence
    const token = randomBytes(32).toString('hex');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetExpires: new Date(Date.now() + 3600_000) },
    });
    // No mailer yet: the token is only returned in dev mode. In prod, email a reset link.
    return DEV_AUTH ? { sent: true, devResetToken: token } : { sent: true };
  }

  async resetPassword(dto: { token: string; password: string }) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: dto.token, resetExpires: { gt: new Date() } },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(dto.password, 10),
        resetToken: null, resetExpires: null,
      },
    });
    return { reset: true };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken);
      if (payload.type !== 'refresh') throw new Error();
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new Error();
      return { tokens: await this.tokens(user) };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return this.sanitize(user);
  }
}
