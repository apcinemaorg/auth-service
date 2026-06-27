import type{ SendOtpRequest } from '@apcinema/contracts/gen/auth';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { Account } from '@prisma/generated/client';

@Injectable()
export class AuthService {

    public constructor(private readonly authRepository: AuthRepository) {}
    public async sendOtp(data: SendOtpRequest){
        const {identifier, type} = data;
        let account: Account | null = null
        if(type === 'phone'){
            account = await this.authRepository.findAccountByPhone(identifier)
        }
        if(type === 'email'){
            account = await this.authRepository.findAccountByEmail(identifier)
        }
        if(!account){
            account = await this.authRepository.createAccount({
                phone: type === 'phone' ? identifier : undefined,
                email: type === 'email' ? identifier : undefined,
            })
        }
        return {ok:true};
    }
}
