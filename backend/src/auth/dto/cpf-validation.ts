import { Injectable, BadRequestException } from '@nestjs/common';
import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { cpf as cpfFormatter } from 'cpf-cnpj-validator';
import { Consumer } from 'src/domain/entities/Consumer';
import { DataSource } from 'typeorm';


@ValidatorConstraint({ name: 'cpf', async: true })
@Injectable()
export class CpfValidation implements ValidatorConstraintInterface {

    constructor(
        private readonly dataSource: DataSource    
    ) { }

    async validate(cpf: string, args: ValidationArguments): Promise<boolean> {

        const dto = args.object as any;

        if (!cpf || !cpfFormatter.isValid(cpf)) {
            return false;
        }


        const cpfExists = await this.dataSource.manager.findOne(Consumer, {
            where:{
                document: cpf
            }
        });

        if(dto.id){
            if(cpfExists && cpfExists.id !== dto.id) throw new BadRequestException("CPF ja está em uso");
        }else{
            if (cpfExists) throw new BadRequestException("CPF ja está em uso");
        }
        return true;
    }

    defaultMessage(): string {
        return "CPF inválido";
    }
}