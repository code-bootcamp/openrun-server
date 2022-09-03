import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entities/board.entity';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { Image } from '../images/entities/image.entity';
import { Location } from '../locations/entities/location.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Runner } from './entities/runner.entity';
import { RunnersResolver } from './runners.resolver';
import { RunnersService } from './runners.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Runner, //
      Board,
      User,
      Image,
      Location,
      Category,
      BankAccount,
    ]),
  ],
  providers: [
    RunnersResolver, //
    RunnersService,
    BoardsService,
    UsersService,
    BankAccountsService,
    CategoriesService,
  ],
})
export class RunnersModule {}
