import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { IamportsService } from '../iamport/iamport.service';
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
