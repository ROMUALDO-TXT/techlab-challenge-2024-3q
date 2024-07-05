import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { ConsumersService } from './consumers.service';
import { ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { CreateConsumerDto } from './dto/create-consumer.dto';
import { Response } from 'express';


@Controller('consumers')
export class ConsumersController {
  constructor(private readonly consumersService: ConsumersService) { }

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async create(@Body() createConsumerDto: CreateConsumerDto, @Res() response: Response) {
    const res = await this.consumersService.create(createConsumerDto);
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
    const res = await this.consumersService.findSelf(request);
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
    const res = await this.consumersService.findOne(id);
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
  async findAll(@Query('page') page: number, @Query('limit') limit: number, @Res() response: Response) {
    const res = await this.consumersService.findAll(page, limit);
    return response.status(res.status).send(res);
}


  //  @Public()
  //  @Patch()
  //  @HttpCode(HttpStatus.OK)
  //  @ApiCreatedResponse({
  //    description: 'Registro atualizado com sucesso'
  //  })
  //  @ApiNotFoundResponse({
  //    description: 'Registro não encontrado'
  //  })
  //  @ApiUnauthorizedResponse({
  //    description: 'Usuário não autenticado'
  //  })
  //  @ApiForbiddenResponse({
  //    description: 'Nível de acesso insuficiente'
  //  })
  //  async update(@Req() request: RequestWithUser, @Body() updateConsumerDto: UpdateConsumerDto, @Res() response: Response) {
  //    const res = this.consumersService.update(request, updateConsumerDto);
  //    return result;
  //  }

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
    const res = await this.consumersService.remove(id);
    return response.status(res.status).send(res);
}
}
