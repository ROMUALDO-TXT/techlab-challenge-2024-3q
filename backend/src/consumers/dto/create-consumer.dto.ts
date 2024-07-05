import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Matches, Validate } from 'class-validator';
import { CpfValidation } from 'src/auth/dto/cpf-validation';
import { cpf as cpfFormatter } from 'cpf-cnpj-validator';
import { EmailValidation } from 'src/auth/dto/email-validation';

export class CreateConsumerDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value = cpfFormatter.format(value))
  document: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: string;
}