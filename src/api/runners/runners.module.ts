import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entities/board.entity';
import { CardInfosService } from '../cardInfos/cardInfos.service';
import { CardInfo } from '../cardInfos/entities/cardInfo.entity';
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
      CardInfo,
    ]),
  ],
  providers: [
    RunnersResolver, //
    RunnersService,
    BoardsService,
    UsersService,
    CardInfosService,
    CategoriesService,
  ],
})
export class RunnersModule {}
