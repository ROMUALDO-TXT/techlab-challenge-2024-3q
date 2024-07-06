import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Req, Query, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAvailabilityDto, UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Public } from 'src/auth/decorators/public.decorator';
import { SearchUserDto } from './dto/search-user.dto';
import { Response } from 'express';

@ApiTags("Usuarios")
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async create(@Body() createUserDto: CreateUserDto, @Res() response: Response) {
    const res = await this.usersService.create(createUserDto);
    return response.status(res.status).send(res);
  }

  @Get('')
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
  async findSelf(@Req() request: RequestWithUser, @Res() response: Response) {
    const res = await this.usersService.findSelf(request);
    return response.status(res.status).send(res);
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
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const res = await this.usersService.findOne(id);
    return response.status(res.status).send(res);
  }

  @Public()
  @Get('')
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
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() response: Response
  ) {
    const res = await this.usersService.findAll(page, limit);
    return response.status(res.status).send(res);
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
  async searchUsers(
    @Body() searchUserDto: SearchUserDto,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() response: Response
  ) {
    const res = await this.usersService.searchUser(searchUserDto, page, limit);
    return response.status(res.status).send(res);
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
  async update(
    @Req() request: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
    @Res() response: Response
  ) {
    const res = await this.usersService.update(request, updateUserDto);
    return response.status(res.status).send(res);
  }

  @Public()
  @Patch('availability')
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
  async updateAvailability(
    @Req() request: RequestWithUser,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    @Res() response: Response
  ) {
    const res = await this.usersService.updateAvailability(request, updateAvailabilityDto);
    return response.status(res.status).send(res);
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
  async deleteUser(@Param('id') id: string, @Res() response: Response) {
    const res = await this.usersService.remove(id);
    return response.status(res.status).send(res);
  }
}
