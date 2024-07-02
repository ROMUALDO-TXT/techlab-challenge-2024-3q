import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Matches, Validate } from 'class-validator';
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
  @Length(11)
  @Validate(CpfValidation, { each: true })
  @Transform(({ value }) => value = cpfFormatter.format(value))
  document: string;

  @IsEmail()
  @Validate(EmailValidation, { each: true })
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 100)
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @IsDate()
  birthDate: Date;
}