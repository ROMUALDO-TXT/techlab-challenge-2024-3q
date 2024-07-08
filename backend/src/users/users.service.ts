import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAvailabilityDto, UpdateUserDto } from './dto/update-user.dto';
import { ServiceBaseClass } from 'src/domain/helpers/service.class';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource, UpdateResult } from 'typeorm';
import { Logger } from 'winston';
import { hash } from 'bcryptjs';
import { User } from 'src/domain/entities/User';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { JwtService } from '@nestjs/jwt';
import { Pagination } from 'src/domain/helpers/pagination.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { Conversation } from 'src/domain/entities/Conversation';

@Injectable()
export class UsersService extends ServiceBaseClass {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private jwtService: JwtService,
  ) {
    super();
  }
  async create(createUserDto: CreateUserDto) {
    try {
      const pswd = await hash(createUserDto.password, 8);

      const user = this.dataSource.manager.create(User, {
        username: createUserDto.username,
        email: createUserDto.email,
        password: pswd,
        profile: createUserDto.profile,
        available: false,
      });

      const result = await this.dataSource.manager.save(User, user);

      delete result.password;

      if (result) {
        this.logger.log("info", `[CREATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`);
        return {
          status: 201,
          data: result
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
          error.statusCode || 500,
        message: error.message,
        error: error,
      };
    }
  }

  async searchUser(searchUserDto: SearchUserDto, page: number = 1, limit: number = 15) {
    try {
      page = page >= 0 ? page : 0;
      limit = limit > 0 ? limit : 15;

      const query = this.dataSource.createQueryBuilder()
        .select([
          'user.id',
          'user.username',
          'user.email',
          'user.profile',
        ])
        .from(User, 'user');

      if (searchUserDto.username) query.andWhere('user.name ilike :name', { name: "%" + searchUserDto.username + "%" });
      if (searchUserDto.email) query.andWhere('user.email ilike :email', { email: "%" + searchUserDto.email + "%" });
      if (searchUserDto.profile) query.andWhere('user.profile = :profile', { profile: searchUserDto.profile });

      const [data, totalItems] = await query.orderBy('user.username', 'ASC').skip((page - 1) * limit).take(limit).getManyAndCount();

      return {
        status: 200,
        data: Pagination.create(data, totalItems, page, limit),
      };
    } catch (error) {


      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findAll(page: number = 1, limit: number = 25) {
    try {
      page = page >= 0 ? page : 0;
      limit = limit > 0 ? limit : 25;

      const [data, totalItems] = await this.dataSource.manager.findAndCount(User, {
        select: {
          id: true,
          username: true,
          profile: true,
          email: true,
        },
        skip: (page) * limit,
        take: limit,
      });

      const ratings = await Promise.all(data.map((d) => {
        return this.dataSource.manager.createQueryBuilder(Conversation, 'c')
          .select('AVG(c.rate)', 'averageRate')
          .addSelect('c.userId', 'userId')
          .where('c.userId = :userId', { userId: d.id })
          .andWhere('c.status = :status', { status: 'closed' })
          .andWhere('c.rate IS NOT NULL')
          .groupBy('c.userId')
          .getRawOne();
      }))

      let result = data.map((d: User & { ratings: number }): User & { ratings: number } => {
        let rate = ratings.find((r) => r && r.userId === d.id);
        if (rate) {
          d.ratings = rate.averageRate
        }else{
          d.ratings = 0
        }
        return d
      })

      return {
        status: 200,
        data: Pagination.create(result, totalItems, page, limit),
      };

    } catch (error) {


      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.dataSource.manager.findOne(User, {
        select: {
          id: true,
          username: true,
          profile: true,
          email: true,
        },

        where: {
          id: id
        }
      });

      if (!data) throw new NotFoundException('User not found');

      return {
        status: 200,
        data: data,
      };
    } catch (error) {


      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async findSelf({ user }: RequestWithUser) {
    try {
      const data = await this.dataSource.manager.findOne(User, {
        select: {
          id: true,
          username: true,
          profile: true,
          email: true,
        },
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


      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async getAvailabilityStatus({ user }: RequestWithUser) {
    try {
      const data = await this.dataSource.manager.findOne(User, {
        select: {
          available: true,
        },
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


      this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(error)}`);

      return {
        status: error.status || error.code || error.statusCode || 500,
        message: error.message || error.response.message,
        error: error,
      };
    }
  }

  async update({ user }: RequestWithUser, updateUserDto: UpdateUserDto) {
    try {
      const userExists = await this.dataSource.manager.findOne(User, {
        where: {
          id: updateUserDto.id,
        }
      })

      if (!userExists) throw new NotFoundException('User not found');

      let renewToken = false;
      if (user.id === userExists.id) renewToken = true;

      const queryRunner = this.dataSource.createQueryRunner();

      let result: User;
      let token: string;

      await queryRunner.startTransaction();

      try {
        Object.assign(userExists, updateUserDto);

        result = await queryRunner.manager.save(User, userExists);

        await queryRunner.commitTransaction();

        if (renewToken) {
          const subject = {
            sub: JSON.stringify({
              id: user.id,
              email: user.email,
              profile: user.profile,
              username: user.username,
            }),
          };

          token = this.jwtService.sign(subject);
        }
        delete result.password;
        delete userExists.password;

      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }

      if (result) {
        this.logger.log(
          'info',
          `[UPDATED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(result)}`,
        );

        if (renewToken) return {
          status: 200,
          token,
          data: result
        };

        return {
          status: 200,
          data: result
        }
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

  async updateAvailability(userId: string, { available }: UpdateAvailabilityDto) {
    try {
      console.log(userId);

      const result = await this.dataSource.manager.update(User, {
        id: userId,
      }, {
        available: available
      });

      if (result.affected > 0) {
        this.logger.log(
          'info',
          `[UPDATED - ${this.constructor.name} | ${this.getFunctionName()}]: id: ${userId}`,
        );

        return {
          status: 200,
          data: available,
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


  async remove(id: string) {
    try {
      const userExists = await this.dataSource.manager.findOne(User, {
        where: {
          id: id,
        }
      })

      if (!userExists) throw new NotFoundException('User not found');

      const queryRunner = this.dataSource.createQueryRunner();

      let result: UpdateResult;

      await queryRunner.startTransaction();

      try {
        result = await queryRunner.manager.softDelete(User, {
          id: userExists.id
        })

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }

      if (result.affected > 0) {
        this.logger.log(
          'info',
          `[DELETED - ${this.constructor.name} | ${this.getFunctionName()}]: id: ${id}`,
        );

        return {
          status: 200,
          data: result,
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
