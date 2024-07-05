import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Permissions } from 'src/auth/decorators/roles.decorator';
import { AddMessageDto } from './dto/add-message.dto';
import { AssignConversationDto } from './dto/assign-conversation.dto';
import { Response } from 'express';

@ApiTags("Conversations")
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) { }

  // @Permissions('users:*', 'users:write')
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async create(@Body() createConversationDto: CreateConversationDto, @Res() response: Response) {
    const res = await this.conversationsService.create(createConversationDto);
    return response.status(res.status).send(res);
}

  // @Permissions('users:*', 'users:write')
  @Public()
  @Post('message')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async addMessage(@Body() addMessageDto: AddMessageDto, @Res() response: Response) {
    const res = await this.conversationsService.addMessage(addMessageDto);
    return response.status(res.status).send(res);
}

  @Public()
  @Post('assign')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async assignConversation(
    @Body() assignConversation: AssignConversationDto, 
    @Res() response: Response
  ) {
    const res = await this.conversationsService.assignConversationUser(assignConversation);
    return response.status(res.status).send(res);
}

  @Public()
  @Get('all')
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
    const res = await this.conversationsService.findAll(page, limit);
    return response.status(res.status).send(res);
  }

  @Permissions('*')
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
  async findUserConversations(
    @Req() request: RequestWithUser, 
    @Query('page') page: number, 
    @Query('limit') limit: number,
    @Res() response: Response
  ) {
    const res = await this.conversationsService.findUserCoversations(request, page, limit);
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
    const res = await this.conversationsService.findOne(id);
    return response.status(res.status).send(res);
  }

  @Public()
  @Get('messages/:id')
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
  async findOneMessages(
    @Param('id') id: string, 
    @Query('page') page: number, 
    @Query('limit') limit: number, 
    @Res() response: Response) {
    const res = await this.conversationsService.findMessages(id, page, limit);
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
  async remove(@Param('id') id: string, @Res() response: Response) {
    const res = await this.conversationsService.remove(id);
    return response.status(res.status).send(res);
}
}
