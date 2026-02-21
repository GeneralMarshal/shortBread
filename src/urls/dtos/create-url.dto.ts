import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The long URL to be shortened',
    example: 'https://www.example.com',
  })
  @IsUrl({}, { message: 'Invalid longUrl format' })
  longUrl: string;
}
