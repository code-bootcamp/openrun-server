import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { Board } from '../boards/entities/board.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Runner } from '../runners/entities/runner.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Notification } from './entities/notification.entity';
import { NotificationsResolver } from './notifications.resolver';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      Runner, //
      User,
      PaymentHistory,
      Board,
      Inquiry,
      Payment,
      BankAccount,
    ]),
  ],
  providers: [
    NotificationsResolver, //
    NotificationsService,
    UsersService,
    BankAccountsService,
  ],
})
export class NotificationsModule {}
