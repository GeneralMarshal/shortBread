import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({
    description: 'Target url for the webhook',
    example: 'https://www.example.com',
  })
  @IsUrl({}, { message: 'Invalid Url format' })
  targetUrl: string;

  @ApiProperty({
    description: 'Secret key for the webhook',
    example: 'https://www.example.com',
  })
  @IsString()
  @IsOptional()
  secret?: string;
}
