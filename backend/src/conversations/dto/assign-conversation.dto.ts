import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignConversationDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  conversationId: string;
}