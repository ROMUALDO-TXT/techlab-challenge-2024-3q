import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ServiceBaseClass } from 'src/domain/helpers/service.class';
import { DataSource } from 'typeorm';
import { ConversationFile } from 'src/domain/entities/ConversationFile';
import { ConversationMessage } from 'src/domain/entities/ConversationMessage';
import { Conversation } from 'src/domain/entities/Conversation';
import { Consumer } from 'src/domain/entities/Consumer';
import { rename } from 'fs';

@Injectable()
export class FilesService extends ServiceBaseClass {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async create(createFileDto: CreateFileDto, file: Express.Multer.File) {
    try {
      const conversationExists = await this.dataSource.manager.findOne(Conversation, {
        where: {
          id: createFileDto.conversationId
        }
      })

      if (!conversationExists) throw new NotFoundException('conversation not found');

      let result: ConversationMessage;

      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.startTransaction();
      try {

        const newFile = await queryRunner.manager.save(ConversationFile,
          queryRunner.manager.create(ConversationFile, {
            name: file.filename,
            type: file.mimetype,
            url: `uploads/` + file.filename,
            size: file.size
          })
        )

        result = await queryRunner.manager.save(ConversationMessage,
          queryRunner.manager.create(ConversationMessage, {
            conversation: conversationExists,
            by: createFileDto.by,
            content: createFileDto.content,
            type: createFileDto.type,
            file: newFile,
          })
        )

        rename(
          `./temp/` + file.filename,
          `./uploads/` + file.filename,
          (err) => {
            if (err) throw err;
          },
        );

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }

      this.logger.log("info", `[CREATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`);

      return {
        status: 201,
        data: result,
        message: 'created',
      }

    } catch (error) {
      if (!(error as any).status) {
        console.log(error)
        return {
          status: 500,
          message: 'internal server error'
        }
      }

      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(error)} | ${error}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findDocumentoById(id: string) {
    try {
      const file = await this.dataSource.manager.findOne(ConversationFile, {
        where: {
          id: id,
        },
      });

      return file;

    } catch (error) {
      if (!(error as any).status) {
        console.log(error)
      }

      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(error)} | ${error}`);
    }
  }
}
