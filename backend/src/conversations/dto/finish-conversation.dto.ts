import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FinishConversationDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    closingReason: string;

    @IsNotEmpty()
    @IsUUID()
    @ApiProperty()
    conversationId: string;
}