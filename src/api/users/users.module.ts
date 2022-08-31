import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardInfosService } from '../cardInfos/cardInfos.service';
import { CardInfo } from '../cardInfos/entities/cardInfo.entity';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, CardInfo])],
  providers: [
    UsersService, //
    UsersResolver,
    CardInfosService,
  ],
})
export class UsersModule {}
