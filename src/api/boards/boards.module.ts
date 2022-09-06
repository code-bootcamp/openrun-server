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
      Image,
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
  ],
})
export class BoardsModule {}
