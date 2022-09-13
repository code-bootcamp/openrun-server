import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { Board } from '../boards/entities/board.entity';
import { IamportsService } from '../iamport/iamport.service';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { Runner } from '../runners/entities/runner.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Payment } from './entities/payment.entity';
import { PaymentsResolver } from './payments.resolver';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment, //
      User,
      BankAccount,
      Runner,
      Board,
      Inquiry,
      PaymentHistory,
    ]),
  ],
  providers: [
    PaymentsResolver, //
    PaymentsService,
    IamportsService,
    UsersService,
    BankAccountsService,
  ],
})
export class PaymentsModule {}
