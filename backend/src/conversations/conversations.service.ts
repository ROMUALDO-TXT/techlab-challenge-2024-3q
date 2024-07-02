import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { take, skip } from 'rxjs';
import { Pagination } from 'src/domain/helpers/pagination.dto';
import { ServiceBaseClass } from 'src/domain/helpers/service.class';
import { DataSource, UpdateResult } from 'typeorm';
import { Logger } from 'winston';
import { Conversation } from 'src/domain/entities/Conversation';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { User } from 'src/domain/entities/User';
import { Consumer } from 'src/domain/entities/Consumer';
import { AddMessageDto } from './dto/add-message.dto';
import { ConversationMessage } from 'src/domain/entities/ConversationMessage';
import { AssignConversationDto } from './dto/assign-conversation.dto';

@Injectable()
export class ConversationsService extends ServiceBaseClass {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
  ) {
    super();
  }
  
  async create(createConversationDto: CreateConversationDto) {
    try {
      const userExists = await this.dataSource.manager.findOne(User, {
        where: {
          id: createConversationDto.userId
        }
      });

      if (!userExists) throw new NotFoundException("User not found");

      const consumerExists = await this.dataSource.manager.findOne(Consumer, {
        where: {
          id: createConversationDto.consumerId
        }
      });

      if (!consumerExists) throw new NotFoundException("Consumer not found");

      const conversation = this.dataSource.manager.create(Conversation, {
        user: userExists,
        consumer: consumerExists,
        subject: createConversationDto.subject,
        status: 'pending'
      });

      const result = await this.dataSource.manager.save(Conversation, conversation);

      if (result) {
        this.logger.log("info", `[CREATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`);
      }

      return result;

    } catch (err) {
      if (err.status == 404) throw new NotFoundException(err.message);
      if (err) {
        this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(err)}`);
        throw new Error(err);
      }
    }
  }

  async assignConversationUser(assignConversationDto: AssignConversationDto) {
    try {
      const userExists = await this.dataSource.manager.findOne(User, {
        where: {
          id: assignConversationDto.userId
        }
      });

      if (!userExists) throw new NotFoundException("User not found");

      const conversationExists = await this.dataSource.manager.findOne(Conversation, {
        where: {
          id: assignConversationDto.conversationId
        }
      });

      if (!conversationExists) throw new NotFoundException("Consumer not found");

      conversationExists.user = userExists;

      const result = await this.dataSource.manager.save(Conversation, conversationExists);

      if (result) {
        this.logger.log("info", `[UPDATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`);
      }

      return result;

    } catch (err) {
      if (err.status == 404) throw new NotFoundException(err.message);
      if (err) {
        this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(err)}`);
        throw new Error(err);
      }
    }
  }

  async addMessage(addMessageDto: AddMessageDto) {
    try {
      const conversationExists = await this.dataSource.manager.findOne(Conversation, {
        where: {
          id: addMessageDto.conversationId,
        }
      })

      if (!conversationExists) throw new NotFoundException(`conversation not found`);

      const message = this.dataSource.manager.create(ConversationMessage, {
        conversation: conversationExists,
        content: addMessageDto.content,
        by: addMessageDto.by,
        //user?
      });

      const result = await this.dataSource.manager.save(ConversationMessage, message);

      if (result) {
        this.logger.log("info", `[CREATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`);
      }
      return result;

    } catch (err) {
      if (err.status == 404) throw new NotFoundException(err.message);
      if (err) {
        this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(err)}`);
        throw new Error(err);
      }
    }
  }

  async findAll(page: number = 1, limit: number = 25) {
    try {
      page = page > 0 ? page : 1;
      limit = limit > 0 ? limit : 25;
      const [data, totalItems] = await this.dataSource.manager.findAndCount(Conversation, {
        relations: {
          consumer: true
        },
        take: Number(take),
        skip: Number(skip),
      })

      return {
        status: 200,
        data: Pagination.create(data, totalItems, page, limit),
      };
    } catch (error) {
      if (!(error as any).status) {
        console.log(error)
        return {
          status: 500,
          message: 'internal server error'
        }
      }

      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}.service | infoUser]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findUserCoversations({ user }: RequestWithUser, page: number = 1, limit: number = 25) {
    try {
      page = page > 0 ? page : 1;
      limit = limit > 0 ? limit : 25;
      const [data, totalItems] = await this.dataSource.manager.findAndCount(Conversation, {
        relations: { consumer: true },
        where: {
          user: {
            id: user.id
          }
        },
        take: Number(take),
        skip: Number(skip),
      })

      return {
        status: 200,
        data: Pagination.create(data, totalItems, page, limit),
      };
    } catch (error) {
      if (!(error as any).status) {
        console.log(error)
        return {
          status: 500,
          message: 'internal server error'
        }
      }

      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}.service | infoUser]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.dataSource.manager.findOne(Conversation, {
        relations: {
          consumer: true,
          messages: true,
        },
        where: {
          id: id
        }
      });

      if (!data) throw new NotFoundException('Conversation not found');

      return {
        status: 200,
        data: data,
      };
    } catch (error) {
      if (!(error as any).status) {
        console.log(error)
        return {
          status: 500,
          message: 'internal server error'
        }
      }

      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}.service | infoUser]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findMessages(id: string, page: number = 1, limit: number = 25) {
    try {
      page = page > 0 ? page : 1;
      limit = limit > 0 ? limit : 25;
      const conversation = await this.dataSource.manager.findOne(Conversation, {
        relations: {
          consumer: true,
          messages: true,
        },
        where: {
          id: id
        }
      });

      if (!conversation) throw new NotFoundException('Conversation not found');


      const [messages, count] = await this.dataSource.manager.findAndCount(ConversationMessage, {
        where: {
          conversation: {
            id: conversation.id
          }
        },
        take: Number(take),
        skip: Number(skip),
        order: {
          createdAt: 'DESC'
        }
      })

      return {
        status: 200,
        data: {
          conversation,
          messages: Pagination.create(messages, count, page, limit)
        },
      };
    } catch (error) {
      if (!(error as any).status) {
        console.log(error)
        return {
          status: 500,
          message: 'internal server error'
        }
      }

      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}.service]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async remove(id: string) {
    const conversationExists = await this.dataSource.manager.findOne(Conversation, {
      where: {
        id: id,
      },
      relations: {
        consumer: true,
      }
    })

    if (!conversationExists) throw new NotFoundException('Conversation not found');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    let result: UpdateResult

    try {

      result = await queryRunner.manager.softDelete(Conversation, {
        id: conversationExists.id
      })

      if (result.affected == 0) {
        throw new InternalServerErrorException()
      }

      await queryRunner.commitTransaction();

      this.logger.log("info", `[DELETED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(conversationExists)}`);

    } catch (err) {
      if (err.status == 404) throw new NotFoundException(err.message);
      if (err) {
        this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(err)}`);
        throw new Error(err);
      }
    } finally {
      await queryRunner.release();
    }
    return result;
  }
}
