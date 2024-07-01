import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Match } from "./match.decorator";

export class UpdatePasswordDto {
    @IsString()
    @IsNotEmpty({ message: "token inválido" })
    @ApiProperty()
    token: string;

    @IsString()
    @IsNotEmpty({ message: "senha inválida" })
    @ApiProperty()
    password: string;

    @IsString()
    @IsNotEmpty({ message: "confirmação de senha inválida" })
    @Match(UpdatePasswordDto, (val) => val.password)
    @ApiProperty()
    confirm_password: string;
}

export class ForgotPasswordEmailDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty({ message: "Erro: Endereço de email inválido" })
    @ApiProperty()
    email: string;
}

export class ValidateTokenDto {
    @IsString()
    @IsNotEmpty({ message: "Erro: Token inválido" })
    @ApiProperty()
    token: string;
}

