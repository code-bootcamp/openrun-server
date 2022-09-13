import { UseGuards } from '@nestjs/common';
import { Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';

@Resolver()
export class NotificationsResolver {
  constructor(
    private readonly notificationsService: NotificationsService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Notification])
  async fetchNotifications(
    @Context() context: IContext, //
  ) {
    const email = context.req.user.email;

    //유저 찾기
    const runner = await this.notificationsService.findRunner({ email });

    //D-day 구하기
    const contents = await this.notificationsService.getDday({ runner });

    //기존에 데이터가 있는지 확인하고 없으면 새로 생성, 있으면 update & isNew에 표시해주기
    return await this.notificationsService.create({ runner, contents });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  updateNotifications(
    @Context() context: IContext, //
  ) {
    const email = context.req.user.email;

    //Notifications db false로 업데이트
    return this.notificationsService.update({ email });
  }
}
