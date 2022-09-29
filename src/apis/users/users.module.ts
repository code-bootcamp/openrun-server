import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { Board } from '../boards/entities/board.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Runner } from '../runners/entities/runner.entity';
import { RunnersService } from '../runners/runners.service';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, //
      BankAccount,
      Runner,
      Board,
      Inquiry,
      Payment,
      PaymentHistory,
    ]),
  ],
  providers: [
    UsersService, //
    UsersResolver,
    BankAccountsService,
    RunnersService,
  ],
})
export class UsersModule {}
