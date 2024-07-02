import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, Req } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Permissions } from 'src/auth/decorators/roles.decorator';
import { AddMessageDto } from './dto/add-message.dto';
import { AssignConversationDto } from './dto/assign-conversation.dto';

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
  async create(@Body() createConversationDto: CreateConversationDto) {
    const result = this.conversationsService.create(createConversationDto);
    return result;
  }

  // @Permissions('users:*', 'users:write')
  @Public()
  @Post('message')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async addMessage(@Body() addMessageDto: AddMessageDto) {
    const result = this.conversationsService.addMessage(addMessageDto);
    return result;
  }

  @Public()
  @Post('assign')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async assignConversation(@Body() assignConversation: AssignConversationDto) {
    const result = this.conversationsService.assignConversationUser(assignConversation);
    return result;
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
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    const result = this.conversationsService.findAll(page, limit);
    return result
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
  async findUserConversations(@Req() request: RequestWithUser, @Query('page') page: number, @Query('limit') limit: number) {
    const result = this.conversationsService.findUserCoversations(request, page, limit);
    return result
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
    const result = this.conversationsService.findOne(id);
    return result
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
  async findOneMessages(@Param('id') id: string, @Query('page') page: number, @Query('limit') limit: number) {
    const result = this.conversationsService.findMessages(id, page, limit);
    return result
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
  async remove(@Param('id') id: string) {
    const result = this.conversationsService.remove(id);
    return result;
  }
}
