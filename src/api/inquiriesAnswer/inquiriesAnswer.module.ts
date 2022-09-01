import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entities/board.entity';
import { CardInfosService } from '../cardInfos/cardInfos.service';
import { CardInfo } from '../cardInfos/entities/cardInfo.entity';
import { Category } from '../categories/entities/category.entity';
import { Image } from '../images/entities/image.entity';
import { Inquiry } from '../inquiries/entities/inquiry.entity';
import { InquiriesService } from '../inquiries/inquiries.service';
import { Location } from '../locations/entities/location.entity';
import { Tag } from '../tags/entities/tag.entity';
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
      Tag,
      Category,
      CardInfo,
    ]),
  ],
  providers: [
    InquiriesAnswerResolver, //
    InquiriesAnswerService,
    InquiriesService,
    UsersService,
    BoardsService,
    CardInfosService,
  ],
})
export class InquiriesAnswerModule {}
