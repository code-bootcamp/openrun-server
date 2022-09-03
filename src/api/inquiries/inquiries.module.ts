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
import { Inquiry } from './entities/inquiry.entity';
import { InquiriesResolver } from './inquiries.resolver';
import { InquiriesService } from './inquiries.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inquiry, //
      CardInfo,
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
    CardInfosService,
    CategoriesService,
  ],
})
export class InquiriesModule {}
