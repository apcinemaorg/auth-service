import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Account } from "@prisma/generated/client";
import { AccountCreateInput, AccountUpdateInput } from "@prisma/generated/models";

@Injectable()
export class AuthRepository {
    public constructor(private readonly prismaService: PrismaService) {}

    public async findAccountByPhone(phone: string): Promise<Account | null>{
        return await this.prismaService.account.findUnique({
            where: {
                phone: phone
            }
        })
    }

    public async findAccountByEmail(email: string): Promise<Account | null>{
        return await this.prismaService.account.findUnique({
            where: {
                email: email
            }
        })
    }

    public async findAccountById(id: string): Promise<Account | null> {
        return await this.prismaService.account.findUnique({
            where: {
                id,
            },
        });
    }

    public async createAccount(data: AccountCreateInput): Promise<Account>{
        return await this.prismaService.account.create({
            data: data
        })
    }

    public async updateAccount(id: string, data: AccountUpdateInput): Promise<Account>{
        return await this.prismaService.account.update({
            where: {
                id: id
            },
            data: data
        })
    }
}