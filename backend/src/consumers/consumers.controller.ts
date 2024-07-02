import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, Req } from '@nestjs/common';
import { ConsumersService } from './consumers.service';
import { ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { CreateConsumerDto } from './dto/create-consumer.dto';


@Controller('consumers')
export class ConsumersController {
  constructor(private readonly consumersService: ConsumersService) {}

   // @Permissions('users:*', 'users:write')
   @Public()
   @Post()
   @HttpCode(HttpStatus.OK)
   @ApiCreatedResponse({
     description: 'Registro criado com sucesso'
   })
   async create(@Body() createConsumerDto: CreateConsumerDto) {
     const result = this.consumersService.create(createConsumerDto);
     return result;
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
   async findSelf(@Req() request: RequestWithUser) {
     const result = this.consumersService.findSelf(request);
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
     const result = this.consumersService.findOne(id);
     return result;
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
   async findAll(@Query('page') page: number, @Query('limit') limit: number) {
     const result = await this.consumersService.findAll(page, limit);
     return result;
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
  //  async update(@Req() request: RequestWithUser, @Body() updateConsumerDto: UpdateConsumerDto) {
  //    const result = this.consumersService.update(request, updateConsumerDto);
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
   async deleteUser(@Param('id') id: string) {
     const result = this.consumersService.remove(id);
     return result;
   }
}
