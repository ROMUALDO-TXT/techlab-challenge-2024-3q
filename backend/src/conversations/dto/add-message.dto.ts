import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ConversationMessageBy } from 'src/domain/entities/ConversationMessage';


export class AddMessageDto {
  @ApiProperty()
  content!: string;

  @ApiProperty()
  by!: ConversationMessageBy;
  
  @ApiProperty()
  conversationId!: string;
}