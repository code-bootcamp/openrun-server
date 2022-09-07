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
import { Location } from '../locations/entities/location.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Runner } from '../runners/entities/runner.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ChatGateway } from './chat.gateway';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chatMessage.entity';
import { ChatRoom } from './entities/chatRoom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoom, //
      ChatMessage,
      User,
      BankAccount,
      Board,
      Image,
      Location,
      Category,
      Runner,
      Inquiry,
      Payment,
    ]),
  ],
  providers: [
    ChatService, //
    ChatGateway,
    ChatResolver,
    UsersService,
    BankAccountsService,
    BoardsService,
    CategoriesService,
    ImagesService,
    FileService,
  ],
})
export class ChatModule {}
