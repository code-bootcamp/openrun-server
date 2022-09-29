import { UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { IContext } from 'src/commons/types/type';
import { UsersService } from '../users/users.service';
import { AuthsService } from './auths.service';
import * as bcrypt from 'bcrypt';
import {
  GqlAuthAccessGuard,
  GqlAuthRefreshGuard,
} from 'src/commons/auth/gql-auth.guard';

@Resolver()
export class AuthsResolver {
  constructor(
    private readonly authsService: AuthsService, //
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: IContext,
  ) {
    //이메일 확인
    const user = await this.usersService.findOne({ email });
    if (!user) {
      throw new UnprocessableEntityException('이메일이 존재하지 않습니다.');
    }

    //비밀번호 확인
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) {
      throw new UnprocessableEntityException('비밀번호가 틀렸습니다.');
    }

    //RefreshToken 생성하여 쿠키에 세팅
    this.authsService.setRefreshToken({
      user, //
      res: context.res,
      req: context.req,
    });

    //AccessToken 생성하여 리턴
    return this.authsService.getAccessToken({ user });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  logout(@Context() context: IContext) {
    const accessToken = context.req.headers['authorization'].split(' ')[1];
    const refreshToken = context.req.headers['cookie'].split('=')[1];

    //Token검증 및 Redis저장
    return this.authsService.checkAndSaveToken({
      accessToken,
      refreshToken, //
      res: context.res,
      req: context.req,
    });
  }

  @UseGuards(GqlAuthRefreshGuard)
  @Mutation(() => String)
  restoreAccessToken(
    @Context() context: IContext, //
  ) {
    return this.authsService.getAccessToken({ user: context.req.user });
  }
}
