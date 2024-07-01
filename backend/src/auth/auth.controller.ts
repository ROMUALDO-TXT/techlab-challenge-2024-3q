import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

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
  async login(@Body() loginDto: LoginDto) {
    const result = this.authService.login(loginDto);
    return result;
  }
}
