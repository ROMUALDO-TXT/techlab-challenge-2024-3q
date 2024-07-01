import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Permissions } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { SearchUserDto } from './dto/search-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // @Permissions('users:*', 'users:write')
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const result = this.usersService.create(createUserDto);
    return result;
  }

  @Get('')
  @Permissions('*')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Registro encontrado'
  })
  @ApiNotFoundResponse({
    description: 'Registro não encontrado'
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autenticado'
  })
  @ApiForbiddenResponse({
    description: 'Nível de acesso insuficiente'
  })
  async findSelf(@Req() request: RequestWithUser) {
    const result = this.usersService.findSelf(request);
    return result;
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Registro encontrado'
  })
  @ApiNotFoundResponse({
    description: 'Registro não encontrado'
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autenticado'
  })
  @ApiForbiddenResponse({
    description: 'Nível de acesso insuficiente'
  })
  async findOne(@Param('id') id: string) {
    const result = this.usersService.findOne(id);
    return result;
  }

  @Public()
  @Post('/search')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Registro encontrado'
  })
  @ApiNotFoundResponse({
    description: 'Registro não encontrado'
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autenticado'
  })
  @ApiForbiddenResponse({
    description: 'Nível de acesso insuficiente'
  })
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    const result = await this.usersService.findAll(page, limit);
    return result;
  }

  @Public()
  @Post('/search')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Registro encontrado'
  })
  @ApiNotFoundResponse({
    description: 'Registro não encontrado'
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autenticado'
  })
  @ApiForbiddenResponse({
    description: 'Nível de acesso insuficiente'
  })
  async searchUsers(@Body() searchUserDto: SearchUserDto, @Query('page') page: number, @Query('limit') limit: number) {
    const result = await this.usersService.searchUser(searchUserDto, page, limit);
    return result;
  }

  @Public()
  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro atualizado com sucesso'
  })
  @ApiNotFoundResponse({
    description: 'Registro não encontrado'
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autenticado'
  })
  @ApiForbiddenResponse({
    description: 'Nível de acesso insuficiente'
  })
  async update(@Req() request: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    const result = this.usersService.update(request, updateUserDto);
    return result;
  }

  @Public()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Registro deletado'
  })
  @ApiNotFoundResponse({
    description: 'Registro não encontrado'
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autenticado'
  })
  @ApiForbiddenResponse({
    description: 'Nível de acesso insuficiente'
  })
  async deleteUser(@Param('id') id: string) {
    const result = this.usersService.remove(id);
    return result;
  }
}
