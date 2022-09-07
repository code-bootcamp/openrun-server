import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entities/board.entity';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { FileService } from '../file/file.service';
import { Image } from '../images/entities/image.entity';
import { ImagesService } from '../images/images.service';
import { Location } from '../locations/entities/location.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { PaymentHistoriesService } from '../paymentHistories/paymentHistories.service';
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
      PaymentHistory,
      Board,
      Image,
      Location,
      Category,
    ]),
  ],
  providers: [
    UsersService, //
    UsersResolver,
    BankAccountsService,
    PaymentHistoriesService,
    BoardsService,
    CategoriesService,
    ImagesService,
    FileService,
    RunnersService,
  ],
})
export class UsersModule {}
