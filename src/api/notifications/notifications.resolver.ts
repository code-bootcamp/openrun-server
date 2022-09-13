import { UseGuards } from '@nestjs/common';
import { Context, Int, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { UsersService } from '../users/users.service';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';

@Resolver()
export class NotificationsResolver {
  constructor(
    private readonly notificationsService: NotificationsService, //
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Int)
  async fetchNotiCount(
    @Context() context: IContext, //
  ) {
    const email = context.req.user.email;

    //유저 찾기
    const user = await this.usersService.findOne({ email });

    //유저의 마지막 로그인 날짜가 오늘보다 이전이라면 보드를 체크하여 예정된 일정의 3일 전인 게 있다면 repository에 save
    //알림 업데이트 확인

    //새로운 알림이 있는지 확인
    const number = await this.notificationsService.countByUser({ user });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Notification])
  async fetchNotifications(
    @Context() context: IContext, //
  ) {
    const email = context.req.user.email;

    //유저 찾기
    const user = await this.usersService.findOne({ email });

    //유저의 알림 데이터 가져오기
    return this.notificationsService.findAllByUser({ user });
  }
}
