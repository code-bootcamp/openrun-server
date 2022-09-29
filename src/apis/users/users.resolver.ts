import {
  Args,
  Context,
  Float,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { CreateUserInput } from './dto/createUser.input';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserInput } from './dto/updateUser.input';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';
import { RunnersService } from '../runners/runners.service';
import { CreateAdminInput } from './dto/createAdmin.input';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService, //
    private readonly runnersService: RunnersService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [User])
  async fetchUsers(
    @Context() context: IContext, //
  ) {
    const email = context.req.user.email;

    //관리자인지 확인
    await this.usersService.checkIsAdmin({ email });

    //가공된 데이터 리턴
    return this.usersService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User)
  fetchLoginUser(@Context() context: IContext) {
    const email = context.req.user.email;
    return this.usersService.findOneForLoginUser({ email });
  }

  @Query(() => [User])
  fetchBestOfUser() {
    return this.usersService.findFourByRating();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [User])
  async fetchAdmin(
    @Context() context: IContext, //
  ) {
    const email = context.req.user.email;

    //admin 여부 확인
    await this.usersService.checkIsAdmin({ email });

    //admin 모두 찾기
    return this.usersService.findAllAdmin();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Int)
  async fetchUsersCount(
    @Context() context: IContext, //
  ) {
    const email = context.req.user.email;
    //admin 여부 확인
    await this.usersService.checkIsAdmin({ email });

    //총 유저 수 출력
    return this.usersService.findNumberOfUsers();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [User])
  async fetchUsersCountByDate(
    @Context() context: IContext, //
  ) {
    const email = context.req.user.email;

    //admin 여부 확인
    await this.usersService.checkIsAdmin({ email });

    //날짜별 생성된 유저 수 출력
    return this.usersService.findNumberOfUsersByDate();
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput, //
  ) {
    //유저가 존재하는지 확인
    await this.usersService.checkIsUserAvailable({
      email: createUserInput.email,
    });

    //패스워드 Encrypt
    const { password, ...user } = createUserInput;
    const hashedPwd = await this.usersService.encryptPassword({ password });

    //유저 생성
    return this.usersService.create({
      _user: user,
      hashedPwd,
    });
  }

  //createAdmin : 관리자 계정 생성(개발용)
  @Mutation(() => User)
  async createAdmin(
    @Args('createAdminInput') createAdminInput: CreateAdminInput, //
  ) {
    //유저가 존재하는지 확인
    await this.usersService.checkIsUserAvailable({
      email: createAdminInput.email,
    });

    //패스워드 Encrypt
    const { password, ...user } = createAdminInput;
    const hashedPwd = await this.usersService.encryptPassword({ password });

    //유저 생성
    return this.usersService.createForAdmin({
      _user: user,
      hashedPwd,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  updateLoginUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput, //
  ) {
    return this.usersService.updateUser({ updateUserInput });
  }

  //updateUserPoint : 해당한 계정에 포인트 충전(개발용)
  @Mutation(() => User)
  async updateUserPoint(
    @Args('email') email: string, //
    @Args('point') point: number,
  ) {
    const resultUser = await this.usersService.findOne({ email });

    const result = await this.usersService.updatePoint({
      resultUser,
      price: point,
      flag: true,
    });

    if (result.affected) {
      return this.usersService.findOne({ email });
    } else {
      throw new NotFoundException('포인트 업데이트에 실패하였습니다.');
    }
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteLoginUser(@Context() context: IContext) {
    const email = context.req.user.email;
    return this.usersService.delete({ email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Float)
  async createRating(
    @Args('boardId') boardId: string,
    @Args('rate') rate: number, //
  ) {
    //runner찾기
    const runner = await this.runnersService.findRunner({ boardId });

    //성공률 계산 -> ((1/유저가 거래한 총 횟수)* 성공한 거래 횟수) *100(백분율)
    const successRate = await this.usersService.calculateSuccessRate({
      runner,
    });

    //rating 계산
    const rating = await this.usersService.calculateRate({ rate, runner });

    //boardId로 runner찾아서 rating 세팅
    const result = await this.usersService.updateRates({
      runner,
      successRate,
      rating,
    });

    return result.rating;
  }
}
