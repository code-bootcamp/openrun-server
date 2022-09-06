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
      Image,
      Location,
      Category,
      Runner,
    ]),
  ],

  providers: [
    InterestsResolver, //
    InterestsService,
    UsersService,
    BankAccountsService,
    BoardsService,
    CategoriesService,
    ImagesService,
    FileService,
  ],
})
export class InterestsModule {}
