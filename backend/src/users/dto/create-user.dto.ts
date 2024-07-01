import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Validate } from 'class-validator';
import { EmailValidation } from 'src/auth/dto/email-validation';
import { Profiles, profiles } from 'src/domain/constants/profiles';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    @ApiProperty()
    username: string;

    @IsEmail()
    @Validate(EmailValidation, { each: true })
    @IsNotEmpty({ message: 'email inválido' })
    @ApiProperty()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(8, 100)
    @ApiProperty()
    password: string;

    @IsNotEmpty()
    @IsEnum(Object.keys(profiles))
    @ApiProperty()
    profile: Profiles;
}