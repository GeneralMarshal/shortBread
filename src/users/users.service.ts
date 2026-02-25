import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
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
