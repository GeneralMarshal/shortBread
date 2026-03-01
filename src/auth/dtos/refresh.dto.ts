import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    required: false,
    description: 'Refresh token (optional if sent via refresh_token cookie)',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
