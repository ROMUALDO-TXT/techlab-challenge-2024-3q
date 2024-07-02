import { IsDate, IsEmail, IsOptional, IsString, Validate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmailValidation } from 'src/auth/dto/email-validation';

export class UpdateConsumerDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    firstName?: string;
  
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    lastName?: string;
  
    @IsOptional()
    @IsEmail()
    @Validate(EmailValidation, { each: true })
    @ApiPropertyOptional()
    email?: string;
  
    @IsOptional()
    @IsDate()
    @ApiPropertyOptional()
    birthDate?: Date;
}
