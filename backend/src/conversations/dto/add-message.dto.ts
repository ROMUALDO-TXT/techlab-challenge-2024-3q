import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ConversationMessageBy } from 'src/domain/entities/ConversationMessage';


export class AddMessageDto {
  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsNotEmpty()
  @IsEnum(ConversationMessageBy)
  by!: ConversationMessageBy;

  @IsNotEmpty()
  @IsUUID()
  conversationId!: string;
}