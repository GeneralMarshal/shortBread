import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dtos/signup.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(dto: SignUpDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.create({
      data: {
        email,
        password,
      },
    });

    if (!user) {
      throw new BadRequestException('Failed to create user');
    }

    return user;
  }
}
