import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ConversationMessageBy } from 'src/domain/entities/ConversationMessage';

export class CreateFileDto {
    @ApiProperty()
    content!: string;

    @ApiProperty()
    by!: ConversationMessageBy;

    @ApiProperty()
    conversationId!: string;

    @ApiProperty()
    type: string
}
