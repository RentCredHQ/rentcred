import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  /**
   * Resolves the user on every request rather than trusting the token alone.
   * Tokens live for 7 days with no refresh or revocation, so without this check
   * a suspended or deleted account keeps working until its token happens to
   * expire. The email is returned here so ownership checks can match a tenant
   * to a submission without each service repeating the lookup.
   */
  async validate(payload: { sub: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, email: true, isActive: true },
    });

    if (!user) throw new UnauthorizedException('Account no longer exists');
    if (!user.isActive) throw new UnauthorizedException('Account has been suspended');

    return { sub: user.id, role: user.role, email: user.email };
  }
}
