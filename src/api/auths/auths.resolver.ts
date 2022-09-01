import { UnprocessableEntityException } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { IContext } from 'src/commons/types/type';
import { UsersService } from '../users/users.service';
import { AuthsService } from './auths.service';
import * as bcrypt from 'bcrypt';

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
    });

    //AccessToken 생성하여 리턴
    return this.authsService.getAccessToken({ user });
  }
}
