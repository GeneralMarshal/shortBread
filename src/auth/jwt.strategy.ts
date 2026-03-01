import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { sessionKey } from 'src/redis/redis-keys';

type Role = 'ADMIN' | 'USER';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  sessionId: string;
}

export interface JwtUser {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
}

export interface sessionData {
  userId: string;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    const jwtsecret = config.get<string>('JWT_SECRET');
    if (!jwtsecret) {
      throw new Error('Jwt secret not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtsecret,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub, role, email, sessionId } = payload;
    const key = sessionKey(role, sub, sessionId);

    const session = await this.redis.get(key);

    if (!session) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    return { userId: sub, email, role };
  }
}
