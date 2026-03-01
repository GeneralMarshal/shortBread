import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dtos/signup.dto';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { JwtPayload } from './jwt.strategy';
import Redis from 'ioredis';
import { sessionKey, sessionsKey } from 'src/redis/redis-keys';
import { Logger } from '@nestjs/common';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async signup(dto: SignUpDto) {
    const { email, password } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashed = await this.hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
      },
    });

    if (!user) {
      throw new BadRequestException('Failed to create user');
    }

    return user;
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const verify = await this.comparePassword(password, user.password);

    if (!verify) {
      throw new BadRequestException('Invalid email or password');
    }

    const sessionId = crypto.randomUUID();
    const payload: JwtPayload = {
      sub: user.id,
      email,
      role: user.role,
      sessionId,
    };
    const accessToken = this.jwtService.sign(payload);

    const key = sessionKey(user.role, user.id, sessionId);
    const SESSION_TTL = 86400;
    const setKey = sessionsKey(user.role, user.id);

    await this.redis.setex(key, SESSION_TTL, user.id).catch((error) => {
      this.logger.error('session store failed', error);
    });
    await this.redis.sadd(setKey, sessionId).catch((error) => {
      this.logger.error('session set store failed', error);
    });
    await this.redis.expire(setKey, SESSION_TTL).catch((error) => {
      this.logger.error('session expire failed', error);
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
