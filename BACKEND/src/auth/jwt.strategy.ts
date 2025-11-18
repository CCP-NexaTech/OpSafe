import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/types/auth/JwtStrategy'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret =
      configService.get<string>('AUTH_JWT_SECRET') ?? 'opsafe-dev-secret';

    if (!jwtSecret) {
      throw new Error('AUTH_JWT_SECRET must be defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      organizationId: payload.organizationId,
      role: payload.role,
    };
  }
}
