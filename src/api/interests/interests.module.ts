import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entities/board.entity';
import { CardInfosService } from '../cardInfos/cardInfos.service';
import { CardInfo } from '../cardInfos/entities/cardInfo.entity';
import { Category } from '../categories/entities/category.entity';
import { Image } from '../images/entities/image.entity';
import { Location } from '../locations/entities/location.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Interest } from './entities/interests.entity';
import { InterestsResolver } from './interests.resolver';
import { InterestsService } from './interests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, //
      CardInfo,
      Interest,
      Board,
      Image,
      Location,
      Tag,
      Category,
    ]),
  ],

  providers: [
    InterestsResolver, //
    InterestsService,
    UsersService,
    CardInfosService,
    BoardsService,
  ],
})
export class InterestsModule {}
