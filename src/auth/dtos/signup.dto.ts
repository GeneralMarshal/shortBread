import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'Email of the User',
    example: 'test@example.com',
  })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @ApiProperty({
    description: 'Password of the User',
    example: 'password',
  })
  @IsString({ message: 'Invalid password' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must be less than 32 characters long' })
  password: string;

  @ApiProperty({
    description: 'Role of the User',
    example: 'USER',
  })
  @IsEnum(Role, { message: 'Invalid role' })
  role: Role;
}
