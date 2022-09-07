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
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { InquiriesService } from '../inquiries/inquiries.service';
import { Location } from '../locations/entities/location.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Runner } from '../runners/entities/runner.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { InquiryAnswer } from './entities/inquiryAnswer.entity';
import { InquiriesAnswerResolver } from './inquiriesAnswer.resolver';
import { InquiriesAnswerService } from './inquiriesAnswer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inquiry, //
      InquiryAnswer,
      User,
      Board,
      Image,
      Location,
      Category,
      BankAccount,
      Runner,
      Payment,
    ]),
  ],
  providers: [
    InquiriesAnswerResolver, //
    InquiriesAnswerService,
    InquiriesService,
    UsersService,
    BoardsService,
    BankAccountsService,
    CategoriesService,
    ImagesService,
    FileService,
  ],
})
export class InquiriesAnswerModule {}
