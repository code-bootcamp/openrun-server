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
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Inquiry } from './entities/inquiry.entity';
import { InquiriesResolver } from './inquiries.resolver';
import { InquiriesService } from './inquiries.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inquiry, //
      BankAccount,
      User,
      Board,
      Image,
      Location,
      Category,
    ]),
  ],
  providers: [
    InquiriesResolver, //
    InquiriesService,
    UsersService,
    BoardsService,
    BankAccountsService,
    CategoriesService,
    ImagesService,
    FileService,
  ],
})
export class InquiriesModule {}
