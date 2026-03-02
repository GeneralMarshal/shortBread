import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { JwtUser } from 'src/auth/jwt.strategy';

@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('self')
  async getSelf(@User() user: JwtUser) {
    return await this.usersService.getSelf(user.userId);
  }
}
