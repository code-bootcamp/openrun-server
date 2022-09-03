import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { Image } from '../images/entities/image.entity';
import { Location } from '../locations/entities/location.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { BoardsResolver } from './boards.resolver';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Board, //
      Image,
      Location,
      User,
      Category,
      BankAccount,
    ]),
  ],

  providers: [
    BoardsResolver, //
    BoardsService,
    UsersService,
    BankAccountsService,
    CategoriesService,
  ],
})
export class BoardsModule {}
