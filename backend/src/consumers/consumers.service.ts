import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateConsumerDto } from './dto/create-consumer.dto';
import { Pagination } from 'src/domain/helpers/pagination.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource, UpdateResult } from 'typeorm';
import { Logger } from 'winston';
import { ServiceBaseClass } from 'src/domain/helpers/service.class';
import { User } from 'src/domain/entities/User';
import { hash } from 'bcrypt';
import { Consumer } from 'src/domain/entities/Consumer';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Profiles } from 'src/domain/constants/profiles';

@Injectable()
export class ConsumersService extends ServiceBaseClass {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private jwtService: JwtService,
  ) {
    super();
  }

  async create(createConsumerDto: CreateConsumerDto) {
    try {
      const emailExists = await this.dataSource.manager.findOne(User, {
        where: {
          email: createConsumerDto.email,
        }
      })

      if (emailExists) throw new BadRequestException("Email already exists");

      const document = await this.dataSource.manager.findOne(Consumer, {
        where: {
          document: createConsumerDto.document
        }
      })

      if (document) throw new BadRequestException("Document already exists");
      let result: Consumer;

      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.startTransaction();

      try {
        const pswd = await hash(createConsumerDto.password, 8);

        result = await queryRunner.manager.save(Consumer,
          queryRunner.manager.create(Consumer, {
            firstName: createConsumerDto.firstName,
            lastName: createConsumerDto.lastName,
            document: createConsumerDto.document,
            birthDate: createConsumerDto.birthDate,
            email: createConsumerDto.email,
            password: pswd,
          })
        );

        await queryRunner.commitTransaction()
        delete result.password;

      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }

      this.logger.log("info", `[CREATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`);
      const subject = {
        sub: JSON.stringify({
          id: result.id,
          email: result.email,
          profile: result.profile,
        }),
      };

      const token = this.jwtService.sign(subject);

      return {
        status: 201,
        token: token,
        data: {
          id: result.id,
          email: result.email,
          profile: result.profile,
          name: result.firstName,
        }
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
          error.statusCode || 500,
        message: error.message,
        error: error,
      };
    }
  }


  async findAll(page: number = 1, limit: number = 25) {
    try {
      page = page > 0 ? page : 1;
      limit = limit > 0 ? limit : 25;
      const [messages, count] = await this.dataSource.manager.findAndCount(Consumer, {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC'
        }
      })

      return {
        status: 200,
        data: Pagination.create(messages, count, page, limit),
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

  async findOne(id: string) {
    try {
      const data = await this.dataSource.manager.findOne(Consumer, {
        where: {
          id: id,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      })

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

  async findSelf({ user }: RequestWithUser) {
    try {
      const data = await this.dataSource.manager.findOne(Consumer, {
        where: {
          id: user.id
        }
      });

      if (!data) throw new NotFoundException('User not found');

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

  // async update({ user }: RequestWithUser, updateConsumerDto: UpdateConsumerDto) {
  //   const consumerExists = await this.dataSource.manager.findOne(Consumer, {
  //     where: {
  //       id: updateConsumerDto.id,
  //     }
  //   })

  //   if (!consumerExists) throw new NotFoundException('Consumer not found');

  //   const queryRunner = this.dataSource.createQueryRunner();

  //   let result: User;
  //   let token: string;

  //   await queryRunner.startTransaction();

  //   try {
  //     const updateUser = Object.assign({}, userExists);

  //     Object.assign(updateUser, updateConsumerDto);

  //     result = await queryRunner.manager.save(User, updateUser);

  //     await queryRunner.commitTransaction();

  //     if (renewToken) {
  //       const subject = {
  //         sub: JSON.stringify({
  //           id: user.id,
  //           email: user.email,
  //           profileId: user.profile.id,
  //           username: user.username,
  //         }),
  //       };

  //       token = this.jwtService.sign(subject);
  //     }
  //     delete result.password;
  //     delete userExists.password;

  //     if (result) {
  //       this.logger.log("info", `[UPDATED - ${this.constructor.name} | ${this.getFunctionName()}]: old: ${JSON.stringify(userExists)} | new: ${JSON.stringify(result)}`);
  //     }
  //   } catch (err) {

  //     if (err.status == 404) throw new NotFoundException(err.message);
  //     if (err) {
  //       this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(err)}`);
  //       throw new Error(err);
  //     }
  //   } finally {
  //     await queryRunner.release();
  //   }
  //   if (renewToken) return { token, result };
  //   return { result }
  // }

  async remove(id: string) {
    try {
      const consumerExists = await this.dataSource.manager.findOne(Consumer, {
        where: {
          id: id,
        }
      })

      if (!consumerExists) throw new NotFoundException('User not found');

      let results: UpdateResult;

      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.startTransaction();

      try {

        results = await queryRunner.manager.softDelete(Consumer, {
          id: consumerExists.id
        })

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }

      if (results.affected > 0) {
        this.logger.log(
          'info',
          `[DELETED - ${this.constructor.name} | ${this.getFunctionName()}]: id: ${id}`,
        );

        return {
          status: 200,
          data: results,
          message: 'deleted',
        };
      }

      throw new InternalServerErrorException(
        'Não foi possível concluir a operação',
      );
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