import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { AddMessageDto } from './dto/add-message.dto';
import { Response } from 'express';
import { ProfilesAllowed } from 'src/auth/decorators/profiles.decorator';
import { RateConversationDto } from './dto/rate-conversation.dto';
import { FinishConversationDto } from './dto/finish-conversation.dto';

@ApiTags("Conversations")
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) { }

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

  @ProfilesAllowed('sudo', 'standard', 'consumer')
  @Post('message')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async addMessage(@Body() addMessageDto: AddMessageDto, @Res() response: Response) {
    const res = await this.conversationsService.addMessage(addMessageDto);
    return response.status(res.status).send(res);
  }

  @ProfilesAllowed('sudo', 'standard', 'consumer')
  @Patch('rate')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async rateConversation(@Body() rateConversationDto: RateConversationDto, @Res() response: Response) {
    const res = await this.conversationsService.rateConversation(rateConversationDto);
    return response.status(res.status).send(res);
  }

  @ProfilesAllowed('sudo', 'standard', 'consumer')
  @Patch('finish')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async finishConversation(@Body() finishConversationDto: FinishConversationDto, @Res() response: Response) {
    const res = await this.conversationsService.finishConversation(finishConversationDto);
    return response.status(res.status).send(res);
  }

  @ProfilesAllowed('sudo', 'standard', 'consumer')
  @Get('queue')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    description: 'Registro criado com sucesso'
  })
  async distributeQueue(@Res() response: Response) {
    const res = await this.conversationsService.conversationQueue();
    return response.status(res.status).send(res);
  }

  @Get('all')
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
    const res = await this.conversationsService.findAll(page, limit);
    return response.status(res.status).send(res);
  }

  @Get('')
  @ProfilesAllowed('consumer', 'standard', 'sudo')
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

  @Get('open')
  @ProfilesAllowed('consumer', 'standard', 'sudo')
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
  async findUserOpenConversations(
    @Req() request: RequestWithUser,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() response: Response
  ) {
    const res = await this.conversationsService.findUserOpenCoversations(request, page, limit);
    return response.status(res.status).send(res);
  }


  @Get('closed')
  @ProfilesAllowed('consumer', 'standard', 'sudo')
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
  async findUserClosedConversations(
    @Req() request: RequestWithUser,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() response: Response
  ) {
    const res = await this.conversationsService.findUserClosedCoversations(request, page, limit);
    return response.status(res.status).send(res);
  }

  @Get(':id')
  @ProfilesAllowed('consumer', 'standard', 'sudo')
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

  @ProfilesAllowed('consumer', 'standard', 'sudo')
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
  async remove(@Param('id') id: string, @Res() response: Response) {
    const res = await this.conversationsService.remove(id);
    return response.status(res.status).send(res);
  }
}
