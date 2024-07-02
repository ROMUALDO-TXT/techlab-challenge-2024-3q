import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class RateConversationDto {
    @IsNotEmpty()
    @IsNumber()
    @Transform(({value}) => parseInt(value))
    @ApiProperty()
    rating: number;

    @IsNotEmpty()
    @IsUUID()
    @ApiProperty()
    conversationId: string;
}