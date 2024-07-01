import { BadRequestException, Injectable } from '@nestjs/common';
import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource, Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domain/entities/User';

@ValidatorConstraint({ name: 'email', async: true })
@Injectable()
export class EmailValidation implements ValidatorConstraintInterface {

    constructor(
        private dataSource: DataSource
    ) { }

    async validate(email: string, args: ValidationArguments): Promise<boolean> {

        if(!email) return false;

        const dto = args.object as any;

        const emailExists = await this.dataSource.manager.findOne(User, {
            where:{
                email: email
            }
        });

        if(dto.id){
            if(emailExists && emailExists.id !== dto.id) throw new BadRequestException("endereço de email ja está em uso");
        }else{
            if (emailExists) throw new BadRequestException("endereço de email ja está em uso");
        }
        return true;
    }

    defaultMessage(): string {
        return "endereço de email inválido";
    }
}