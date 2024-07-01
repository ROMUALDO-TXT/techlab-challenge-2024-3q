import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ServiceBaseClass } from 'src/domain/helpers/service.class';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';
import { hash } from 'bcrypt';
import { User } from 'src/domain/entities/User';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { JwtService } from '@nestjs/jwt';
import { profiles } from 'src/domain/constants/profiles';
import { Pagination } from 'src/domain/helpers/pagination.dto';
import { SearchUserDto } from './dto/search-user.dto';

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
      });

      const result = await this.dataSource.manager.save(User, user);

      delete result.password;

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

  async searchUser(searchUserDto: SearchUserDto, page: number = 1, limit: number = 15) {
    try {
      page = page > 0 ? page : 1;
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

  async findAll(page: number = 1, limit: number = 25) {
    try {
      page = page > 0 ? page : 1;
      limit = limit > 0 ? limit : 25;

      const [data, totalItems] = await this.dataSource.manager.findAndCount(User, {
        select: {
          id: true,
          username: true,
          profile: true,
          email: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

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

      if (!data) throw new NotFoundException('Usuario não encontrado');

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

      if (!data) throw new NotFoundException('Usuario não encontrado');

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

  async update({ user }: RequestWithUser, updateUserDto: UpdateUserDto) {
    const userExists = await this.dataSource.manager.findOne(User, {
      where: {
        id: updateUserDto.id,
      }
    })

    if (!userExists) throw new NotFoundException('Usuário não encontrado');

    let renewToken = false;
    if (user.id === userExists.id) renewToken = true;

    const queryRunner = this.dataSource.createQueryRunner();

    let result: User;
    let token: string;

    await queryRunner.startTransaction();

    try {
      const updateUser = Object.assign({}, userExists);

      Object.assign(updateUser, updateUserDto);

      result = await queryRunner.manager.save(User, updateUser);

      await queryRunner.commitTransaction();

      if (renewToken) {
        const scopes = profiles[result.profile].scopes(user);
        const subject = {
          sub: JSON.stringify({
            id: user.id,
            email: user.email,
            scopes: Array.isArray(scopes) ? scopes : [scopes],
            username: user.username,
          }),
        };

        token = this.jwtService.sign(subject);
      }
      delete result.password;
      delete userExists.password;

      if (result) {
        this.logger.log("info", `[UPDATED - ${this.constructor.name} | ${this.getFunctionName()}]: Antigo: ${JSON.stringify(userExists)} | Novo: ${JSON.stringify(result)}`);
      }
    } catch (err) {

      if (err.status == 404) throw new NotFoundException(err.message);
      if (err) {
        this.logger.log("error", `[ERROR - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(err)}`);
        throw new Error(err);
      }
    } finally {
      await queryRunner.release();
    }
    if (renewToken) return { token, result };
    return { result }
  }

  async remove(id: string) {
    const userExists = await this.dataSource.manager.findOne(User, {
      where: {
        id: id,
      }
    })

    if (!userExists) throw new NotFoundException('Usuário não encontrado');

    const queryRunner = this.dataSource.createQueryRunner();

    let result: User;

    await queryRunner.startTransaction();

    try {

      const result = await queryRunner.manager.softDelete(User, {
        id: userExists.id
      })

      if (result.affected == 0) {
        throw new InternalServerErrorException('Não foi possivel deletar o registro')
      }

      await queryRunner.commitTransaction();

      this.logger.log("info", `[DELETED - ${this.constructor.name} | ${this.getFunctionName()}]: ${JSON.stringify(userExists)}`);
      
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
