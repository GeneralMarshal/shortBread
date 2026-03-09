import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateWebhookDto {
  @ApiProperty({
    description: 'Target url for the webhook',
    example: 'https://www.example.com',
  })
  @IsUrl({}, { message: 'Invalid Url format' })
  @IsOptional()
  targetUrl?: string;

  @ApiProperty({
    description: 'Secret key for the webhook',
    example: 'https://www.example.com',
  })
  @IsString()
  @IsOptional()
  secret?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
