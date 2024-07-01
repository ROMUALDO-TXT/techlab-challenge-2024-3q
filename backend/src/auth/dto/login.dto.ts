import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'email inválido' })
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'senha inválida' })
  @ApiProperty()
  password: string;
}
