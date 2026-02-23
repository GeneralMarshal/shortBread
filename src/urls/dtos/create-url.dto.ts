import { IsDateString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The long URL to be shortened',
    example: 'https://www.example.com',
  })
  @IsUrl({}, { message: 'Invalid longUrl format' })
  longUrl: string;

  @ApiProperty({
    description: 'The expiration date of the short URL',
    example: '2026-02-23T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'Invalid expirationDate format' })
  expirationTime?: string;
}
