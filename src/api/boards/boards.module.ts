import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardInfosService } from '../cardInfos/cardInfos.service';
import { CardInfo } from '../cardInfos/entities/cardInfo.entity';
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
      CardInfo,
    ]),
  ],

  providers: [
    BoardsResolver, //
    BoardsService,
    UsersService,
    CardInfosService,
    CategoriesService,
  ],
})
export class BoardsModule {}
