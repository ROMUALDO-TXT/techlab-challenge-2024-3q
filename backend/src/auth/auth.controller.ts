import { Controller, Post, Body, HttpStatus, HttpCode, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()  
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Login realizado com sucesso'
  })
  @ApiUnauthorizedResponse({
    description: 'Login/senha inválidos'
  })
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const res = await this.authService.login(loginDto);
    return response.status(res.status).send(res);
}
}
