import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Req, Query, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAvailabilityDto, UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Public } from 'src/auth/decorators/public.decorator';
import { SearchUserDto } from './dto/search-user.dto';
import { Response } from 'express';
import { ProfilesAllowed } from 'src/auth/decorators/profiles.decorator';

@ApiTags("Usuarios")
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ProfilesAllowed('sudo')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async create(@Body() createUserDto: CreateUserDto, @Res() response: Response) {
    const res = await this.usersService.create(createUserDto);
    return response.status(res.status).send(res);
  }

  @Get('availability')
  @ProfilesAllowed('sudo', 'standard')
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
    const res = await this.usersService.getAvailabilityStatus(request);
    return response.status(res.status).send(res);
  }

  @Get(':id')
  @ProfilesAllowed('sudo')
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
 
  @Get('')
  @ProfilesAllowed('sudo')
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

  @Post('/search')
  @ProfilesAllowed('sudo')
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

  @Patch()
  @ProfilesAllowed('sudo', 'standard')
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

  @Patch('availability')
  @ProfilesAllowed('sudo', 'standard')
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
    const res = await this.usersService.updateAvailability(request.user.id, updateAvailabilityDto);
    return response.status(res.status).send(res);
  }

  @Get('availability')
  @ProfilesAllowed('sudo', 'standard')
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
  async getAvailabilityStatus(@Req() request: RequestWithUser, @Res() response: Response) {
    const res = await this.usersService.findSelf(request);
    return response.status(res.status).send(res);
  }


  @ProfilesAllowed('sudo')
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
