import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, Length, IsOptional } from 'class-validator';
import { Profiles } from 'src/domain/constants/profiles';

export class SearchUserDto {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    username: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    email: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    profile: Profiles;
}

