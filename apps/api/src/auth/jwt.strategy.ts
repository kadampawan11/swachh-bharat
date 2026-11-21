import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma.service';
import { jwtSecret } from './jwt-secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret(),
    });
  }
  async validate(payload: { sub: string; type?: string }) {
    if (payload.type !== 'access') throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw new UnauthorizedException();
    const { passwordHash, resetToken, resetExpires, ...safe } = user;
    return safe;
  }
}
