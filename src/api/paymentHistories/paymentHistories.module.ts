import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { Runner } from '../runners/entities/runner.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { PaymentHistory } from './entities/paymentHistory.entity';
import { PaymentHistoriesResolver } from './paymentHistories.resolver';
import { PaymentHistoriesService } from './paymentHistories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentHistory, //
      User,
      BankAccount,
      Runner,
    ]),
  ],
  providers: [
    PaymentHistoriesResolver, //
    PaymentHistoriesService,
    UsersService,
    BankAccountsService,
  ],
})
export class PaymentHistoriesModule {}
