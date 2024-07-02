import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  subject!: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  consumerId: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional()
  userId: string;
}