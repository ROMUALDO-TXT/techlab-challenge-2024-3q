import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateConsumerDto } from './dto/create-consumer.dto';
import { Pagination } from 'src/domain/helpers/pagination.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { take, skip } from 'rxjs';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';
import { ServiceBaseClass } from 'src/domain/helpers/service.class';
import { Profile } from 'src/domain/entities/Profile';
import { User } from 'src/domain/entities/User';
import { hash } from 'bcrypt';
import { Consumer } from 'src/domain/entities/Consumer';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';


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
      const consumerProfile = await this.dataSource.manager.findOne(Profile, {
        where: {
          name: 'Consumer'
        }
      })

      const pswd = await hash(createConsumerDto.password, 8);

      const user = this.dataSource.manager.create(User, {
        username: createConsumerDto.firstName + "." + createConsumerDto.lastName + "@" + Math.floor(100000 + Math.random() * 900000),
        email: createConsumerDto.email,
        password: pswd,
        profile: consumerProfile,
      });

      const consumer = this.dataSource.manager.create(Consumer, {
        firstName: createConsumerDto.firstName,
        lastName: createConsumerDto.lastName,
        document: createConsumerDto.document,
        birthDate: createConsumerDto.birthDate,
        user: user,
      });

      const result = await this.dataSource.manager.save(Consumer, consumer);

      delete consumer.user.password;

      if (result) {
        this.logger.log("info", `[CREATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`);
      }

      const subject = {
        sub: JSON.stringify({
          id: user.id,
          email: user.email,
          profileId: user.profile.id,
          username: user.username,
        }),
      };

      const token = this.jwtService.sign(subject);

      return {
        token: token,
        id: consumer.user.id,
        email: consumer.user.email,
        profileId: consumer.user.profile.id,
        username: consumer.firstName + " " + consumer.lastName,
        consumerId: consumer.id
      }

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
      const [messages, count] = await this.dataSource.manager.findAndCount(Consumer, {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            email: true,
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
        data: Pagination.create(messages, count, page, limit),
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

  async findOne(id: string) {
    try {
      const data = await this.dataSource.manager.findOne(Consumer, {
        where:{
          id: id,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            email: true,
          }
        },
      })

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
        relations: {
          user: true,
        },
        where: {
          user:{
            id:user.id
          }
        }
      });

      if (!data) throw new NotFoundException('User not found');

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
    const consumerExists = await this.dataSource.manager.findOne(Consumer, {
      where: {
        id: id,
      }
    })

    if (!consumerExists) throw new NotFoundException('User not found');

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {

      let result = await queryRunner.manager.softDelete(Consumer, {
        id: consumerExists.id
      })

      if (result.affected == 0) {
        throw new InternalServerErrorException()
      }

      result = await queryRunner.manager.softDelete(User, {
        id: consumerExists.user.id
      })

      if (result.affected == 0) {
        throw new InternalServerErrorException()
      }

      await queryRunner.commitTransaction();

      delete consumerExists.user.password;
    
      this.logger.log("info", `[DELETED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(consumerExists)}`);

    } catch (err) {
      if (err.status == 404) throw new NotFoundException(err.message);
      if (err) {
        this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(err)}`);
        throw new Error(err);
      }
    } finally {
      await queryRunner.release();
    }
  }
}
