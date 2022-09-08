import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountsService } from '../bankAccounts/bankAccounts.service';
import { BankAccount } from '../bankAccounts/entities/ bankAccount.entity';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/entities/category.entity';
import { FileService } from '../file/file.service';
import { Image } from '../images/entities/image.entity';
import { ImagesService } from '../images/images.service';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { Location } from '../locations/entities/location.entity';
import { PaymentHistory } from '../paymentHistories/entities/paymentHistory.entity';
import { PaymentHistoriesService } from '../paymentHistories/paymentHistories.service';
import { Payment } from '../payments/entities/payment.entity';
import { Runner } from '../runners/entities/runner.entity';
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
      Image,
      Runner,
      Inquiry,
      Payment,
      PaymentHistory,
    ]),
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200', //
    }),
  ],

  providers: [
    BoardsResolver, //
    BoardsService,
    UsersService,
    BankAccountsService,
    CategoriesService,
    ImagesService,
    FileService,
    PaymentHistoriesService,
  ],
})
export class BoardsModule {}
