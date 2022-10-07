import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './entities/ bankAccount.entity';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  create({ company, bankAccountNum }) {
    return this.bankAccountRepository.save({
      company,
      bankAccountNum,
    });
  }

  async update({ bankAccountId, bankAccount }) {
    const account = await this.bankAccountRepository.findOne({
      where: { id: bankAccountId },
    });

    return this.bankAccountRepository.save({
      ...account,
      ...bankAccount,
    });
  }
}
