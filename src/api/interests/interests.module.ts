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
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { PaymentHistoriesService } from '../paymentHistories/paymentHistories.service';
import { Payment } from '../payments/entities/payment.entity';
import { Runner } from '../runners/entities/runner.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Interest } from './entities/interests.entity';
import { InterestsResolver } from './interests.resolver';
import { InterestsService } from './interests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, //
      BankAccount,
      Interest,
      Board,
      Location,
      Category,
      Runner,
      Payment,
      Inquiry,
      PaymentHistory,
    ]),
  ],

  providers: [
    InterestsResolver, //
    InterestsService,
    UsersService,
    BankAccountsService,
    BoardsService,
    CategoriesService,
    FileService,
    PaymentHistoriesService,
  ],
})
export class InterestsModule {}
