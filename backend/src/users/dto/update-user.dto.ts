import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Validate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailValidation } from 'src/auth/dto/email-validation';

export class UpdateUserDto {
    @IsUUID()
    @IsNotEmpty({ message: 'id invalido' })
    @ApiProperty()
    id: string;

    @IsOptional()
    @IsString()
    @Length(3, 20)
    @ApiPropertyOptional()
    username?: string;

    @IsNotEmpty({ message: 'email inválido' })
    @ApiProperty()
    @IsEmail()
    @Validate(EmailValidation, { each: true })
    email: string;

    @IsOptional()
    @IsUUID()
    @ApiPropertyOptional()
    profile?: string;
}

export class UpdateAvailabilityDto {
    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty()
    available: boolean;
}