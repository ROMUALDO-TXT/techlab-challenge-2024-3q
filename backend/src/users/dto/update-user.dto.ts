import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Validate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EmailValidation } from 'src/auth/dto/email-validation';
import { profiles } from 'src/domain/constants/profiles';

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
    @IsEnum(Object.keys(profiles))
    @ApiPropertyOptional()
    profile?: keyof typeof profiles;
}
