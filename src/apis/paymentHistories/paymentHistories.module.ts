import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entities/board.entity';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { FileService } from '../file/file.service';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { Location } from '../locations/entities/location.entity';
import { Payment } from '../payments/entities/payment.entity';
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
      Board,
      Location,
      Category,
      Inquiry,
      Payment,
    ]),
  ],
  providers: [
    PaymentHistoriesResolver, //
    PaymentHistoriesService,
    UsersService,
    BankAccountsService,
    BoardsService,
    CategoriesService,
    FileService,
  ],
})
export class PaymentHistoriesModule {}
