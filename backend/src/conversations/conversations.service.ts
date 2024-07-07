import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Pagination } from 'src/domain/helpers/pagination.dto';
import { ServiceBaseClass } from 'src/domain/helpers/service.class';
import { DataSource, IsNull, QueryRunner, UpdateResult } from 'typeorm';
import { Logger } from 'winston';
import { Conversation } from 'src/domain/entities/Conversation';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { User } from 'src/domain/entities/User';
import { Consumer } from 'src/domain/entities/Consumer';
import { AddMessageDto } from './dto/add-message.dto';
import { ConversationMessage, ConversationMessageBy } from 'src/domain/entities/ConversationMessage';
import { AssignConversationDto } from './dto/assign-conversation.dto';
import { RateConversationDto } from './dto/rate-conversation.dto';
import { FinishConversationDto } from './dto/finish-conversation.dto';

interface IAssignConversation {
  conversation: Conversation,
  userId: string,
  username: string,
}

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

      let userExists: User;

      if (createConversationDto.userId) {
        userExists = await this.dataSource.manager.findOne(User, {
          where: {
            id: createConversationDto.userId
          }
        });

        if (!userExists) throw new NotFoundException("User not found");
      }

      const consumerExists = await this.dataSource.manager.findOne(Consumer, {
        where: {
          id: createConversationDto.consumerId
        }
      });

      if (!consumerExists) throw new NotFoundException("Consumer not found");

      const conversation = this.dataSource.manager.create(Conversation, {
        user: userExists || undefined,
        consumer: consumerExists,
        subject: createConversationDto.subject,
        status: 'pending',
        createdAt: new Date()
      });

      const result = await this.dataSource.manager.save(Conversation, conversation);

      if (result) {
        this.logger.log("info", `[CREATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`);
      }

      return {
        status: 201,
        data: result
      };

    } catch (error) {
      this.logger.log(
        'error',
        `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(
          error,
        )}`,
      );

      return {
        status:
          error.status ||
          error.code ||
          error.statusCode ||
          500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async conversationQueue(page: number = 0, limit: number = 25) {
    try {
      const count = await this.dataSource.manager.count(Conversation, {
        where: {
          status: 'pending',
          user: IsNull(),
        },
      })

      return {
        status: 200,
        data: count
      };

    } catch (error) {
      this.logger.log(
        'error',
        `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(
          error,
        )}`,
      );

      return {
        status:
          error.status ||
          error.code ||
          error.statusCode ||
          500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async distributeQueue() {
    try {
      const rawSql = `
      SELECT 
        "user"."id" AS "userId", 
        COALESCE("openConversations"."openConversationsCount", 0) AS "openConversationsCount",
        "user"."username" AS "username" 
      FROM "users" "user"
      LEFT JOIN (
        SELECT 
          "conversation"."userId" AS "userId", 
          COUNT("conversation"."id") AS "openConversationsCount"
        FROM "conversations" "conversation"
        WHERE 
          "conversation"."status" = $1
          AND "conversation"."deletedAt" IS NULL
        GROUP BY "conversation"."userId"
      ) "openConversations" 
      ON "openConversations"."userId" = "user"."id"
      WHERE 
        "user"."available" = $2 
        AND "user"."deletedAt" IS NULL;
    `;
      const status = 'open';
      const available = true;

      let users = await this.dataSource.query(rawSql, [status, available]) as {
        userId: string,
        username: string,
        openConversationsCount: number
      }[];

      if (users.length < 0) throw new BadRequestException("No users available");

      const openConversations = await this.dataSource.manager.find(Conversation, {
        where: {
          status: 'pending',
          user: IsNull(),
        },
        relations: {
          consumer: true
        },
        order: {
          createdAt: 'ASC',
        }
      })

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.startTransaction();

      let results: ConversationMessage[];
      try {
        const promises: (Promise<UpdateResult> | Promise<ConversationMessage>)[] = [];

        openConversations.forEach((c) => {
          users = users.filter(user => user.openConversationsCount < 3);
          
          if (users.length > 0) {
            users.sort((a, b) => a.openConversationsCount - b.openConversationsCount);
            users[0].openConversationsCount++;
            
            Object.assign(c, {
              startedAt: new Date(),
              status: 'open',              
            })

            const assignPromises = this.assignConversationUser(queryRunner, {
              userId: users[0].userId,
              username: users[0].username,
              conversation: c
            }) 

            promises.push(assignPromises)
          }
        })

        const resolved = await Promise.all(promises);
        results = resolved.filter(x => x instanceof ConversationMessage);
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }

      this.logger.log("info", `[UPDATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(results)}`);
      return {
        status: 200,
        data: results,
      };
    } catch (error) {
      this.logger.log(
        'error',
        `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(
          error,
        )}`,
      );

      return {
        status:
          error.status ||
          error.code ||
          error.statusCode ||
          500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  private assignConversationUser(queryRunner: QueryRunner, { conversation, userId, username }: IAssignConversation) {
    const upadatePromise = queryRunner.manager.save(Conversation, {
      user:{
        id: userId,
      },
      ...conversation
    }).then((updatedConversation) => queryRunner.manager.save(ConversationMessage,
      queryRunner.manager.create(ConversationMessage, {
        conversation: updatedConversation,
        by: ConversationMessageBy.System,
        content: `O Agente ${username} foi designado para atender o seu chamado!`
      })
    ))

    return upadatePromise
  }

  async finishConversation(finishConversationDto: FinishConversationDto) {
    try {
      const conversationExists = await this.dataSource.manager.findOne(Conversation, {
        where: {
          id: finishConversationDto.conversationId
        }
      });

      if (!conversationExists) throw new NotFoundException("Conversation not found");

      const result = await this.dataSource.manager.update(Conversation, {
        id: conversationExists.id
      }, {
        closingReason: finishConversationDto.closingReason,
        finishedAt: new Date(),
        status: 'closed',
      });

      if (result.affected > 0) {
        this.logger.log("info", `[UPDATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`);
      }

      return {
        status: 200,
        data: result,
      };

    } catch (error) {
      this.logger.log(
        'error',
        `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(
          error,
        )}`,
      );

      return {
        status:
          error.status ||
          error.code ||
          error.statusCode ||
          500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async rateConversation(rateConversationDto: RateConversationDto) {
    try {
      const conversationExists = await this.dataSource.manager.findOne(Conversation, {
        where: {
          id: rateConversationDto.conversationId
        }
      });

      if (!conversationExists) throw new NotFoundException("Conversation not found");
      if (conversationExists.status !== 'closed') throw new BadRequestException("Cannot rate unfinished conversations");

      const result = await this.dataSource.manager.update(Conversation, {
        id: conversationExists.id
      }, {
        rate: rateConversationDto.rating
      });

      if (result.affected > 0) {
        this.logger.log("info", `[UPDATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`);
      }

      return {
        status: 200,
        data: result
      };

    } catch (error) {
      this.logger.log(
        'error',
        `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(
          error,
        )}`,
      );

      return {
        status:
          error.status ||
          error.code ||
          error.statusCode ||
          500,
        message: error.message || error.response.message,
        error: error,
      };
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
        return {
          status: 201,
          data: result,
        };
      }

    } catch (error) {
      this.logger.log(
        'error',
        `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(
          error,
        )}`,
      );

      return {
        status:
          error.status ||
          error.code ||
          error.statusCode ||
          500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findAll(page: number = 1, limit: number = 25) {
    try {
      page = page >= 0 ? page : 0;
      limit = limit > 0 ? limit : 25;
      const [data, totalItems] = await this.dataSource.manager.findAndCount(Conversation, {
        relations: {
          consumer: true
        },
        skip: (page) * limit,
        take: limit,
        order: {
          createdAt: 'DESC'
        }
      })

      return {
        status: 200,
        data: Pagination.create(data, totalItems, page, limit),
      };

    } catch (error) {
      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}.service]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findUserClosedCoversations({ user }: RequestWithUser, page: number = 1, limit: number = 25) {
    try {
      page = page >= 0 ? page : 0;
      limit = limit > 0 ? limit : 25;
      let data: Conversation[];
      let totalItems: number;

      if (user.profile !== 'consumer') {
        [data, totalItems] = await this.dataSource.manager.findAndCount(Conversation, {
          relations: {
            consumer: true
          },
          select: {
            consumer: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          where: {
            user: {
              id: user.id
            },
            status: 'closed'
          },
          skip: (page) * limit,
          take: limit,
          order: {
            createdAt: 'DESC'
          }
        })
      } else {
        [data, totalItems] = await this.dataSource.manager.findAndCount(Conversation, {
          relations: {
            consumer: true
          },
          select: {
            user: {
              id: true,
              username: true,
            },
            consumer: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          where: {
            consumer: {
              id: user.id
            }
          },
          skip: (page) * limit,
          take: limit,
          order: {
            createdAt: 'DESC'
          }
        })
      }

      return {
        status: 200,
        data: Pagination.create(data, totalItems, page, limit),
      };
    } catch (error) {
      console.log(error);
      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}.service]: ${JSON.stringify(error) || error}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findUserOpenCoversations({ user }: RequestWithUser, page: number = 1, limit: number = 25) {
    try {
      page = page >= 0 ? page : 0;
      limit = limit > 0 ? limit : 25;
      let data: Conversation[];
      let totalItems: number;

      if (user.profile !== 'consumer') {
        [data, totalItems] = await this.dataSource.manager.findAndCount(Conversation, {
          relations: {
            consumer: true
          },
          select: {
            consumer: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          where: {
            user: {
              id: user.id
            },
            status: 'open'
          },
          skip: (page) * limit,
          take: limit,
          order: {
            createdAt: 'DESC'
          }
        })
      } else {
        [data, totalItems] = await this.dataSource.manager.findAndCount(Conversation, {
          relations: {
            consumer: true
          },
          select: {
            user: {
              id: true,
              username: true,
            },
            consumer: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          where: {
            consumer: {
              id: user.id
            }
          },
          skip: (page) * limit,
          take: limit,
          order: {
            createdAt: 'DESC'
          }
        })
      }

      const lastMessages = await Promise.all(data.map((c) =>
        this.dataSource.manager.findOne(ConversationMessage, {
          select: {
            conversation: {
              id: true,
            },
          },
          where: {
            conversation: {
              id: c.id
            }
          },
          order: {
            createdAt: 'DESC',
          },
          relations: {
            conversation: true,
          }
        }))
      )

      let result = data.map((d: Conversation & { lastMessage: ConversationMessage }): Conversation & { lastMessage: ConversationMessage } => {
        let lastMessage = lastMessages.find((m) => m?.conversation.id === d.id);
        d.lastMessage = lastMessage
        return d
      }).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

      return {
        status: 200,
        data: Pagination.create(result, totalItems, page, limit),
      };
    } catch (error) {
      console.log(error);
      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}.service]: ${JSON.stringify(error) || error}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findUserCoversations({ user }: RequestWithUser, page: number = 1, limit: number = 25) {
    try {
      page = page >= 0 ? page : 0;
      limit = limit > 0 ? limit : 25;
      let data: Conversation[];
      let totalItems: number;

      if (user.profile !== 'consumer') {
        [data, totalItems] = await this.dataSource.manager.findAndCount(Conversation, {
          relations: {
            consumer: true,
          },
          select: {
            user: {
              password: false,
            },
            consumer: {
              password: false,
            }
          },
          where: {
            user: {
              id: user.id
            }
          },
          skip: (page) * limit,
          take: limit,
          order: {
            createdAt: 'DESC'
          }
        })
      } else {
        [data, totalItems] = await this.dataSource.manager.findAndCount(Conversation, {
          relations: {
            consumer: true,
            user: true,
          },
          select: {
            user: {
              id: true,
              username: true,
            },
            consumer: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          where: {
            consumer: {
              id: user.id
            }
          },
          skip: (page) * limit,
          take: limit,
          order: {
            createdAt: 'DESC'
          }
        })
      }

      const lastMessages = await Promise.all(data.map((c) =>
        this.dataSource.manager.findOne(ConversationMessage, {
          select: {
            conversation: {
              id: true,
            },
          },
          where: {
            conversation: {
              id: c.id
            }
          },
          order: {
            createdAt: 'DESC',
          },
          relations: {
            conversation: true,
          }
        }))
      )

      let result = data.map((d: Conversation & { lastMessage: ConversationMessage }): Conversation & { lastMessage: ConversationMessage } => {
        let lastMessage = lastMessages.find((m) => m?.conversation.id === d.id);
        d.lastMessage = lastMessage
        return d
      }).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

      return {
        status: 200,
        data: Pagination.create(result, totalItems, page, limit),
      };
    } catch (error) {
      console.log(error);
      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}.service]: ${JSON.stringify(error) || error}`);

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
        select: {
          consumer: {
            id: true,
            firstName: true,
            lastName: true,
          }
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
      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}.service]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findMessages(id: string, page: number = 1, limit: number = 25) {
    try {
      page = page >= 0 ? page : 0;
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
        skip: (page) * limit,
        take: limit,
        order: {
          createdAt: 'DESC'
        }
      })

      const sortedMessages = messages.sort((a, b) => {
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      return {
        status: 200,
        data: {
          conversation,
          messages: Pagination.create(sortedMessages, count, page, limit)
        },
      };
    } catch (error) {
      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}.service]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async remove(id: string) {
    try {
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

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }

      if (result.affected > 0) {
        this.logger.log("info", `[DELETED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(conversationExists)}`);
        return {
          status: 200,
          data: result
        };
      }

    } catch (error) {
      this.logger.log(
        'error',
        `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(
          error,
        )}`,
      );

      return {
        status:
          error.status ||
          error.code ||
          error.statusCode ||
          500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }
}
