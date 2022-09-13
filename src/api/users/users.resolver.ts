import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './dto/createUser.input';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserInput } from './dto/updateUser.input';
import { UseGuards } from '@nestjs/common';
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
    return this.usersService.findOne({ email });
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

    //닉네임이 존재하는지 확인 -> unique값이 풀리면서 삭제 예정
    // await this.usersService.checkIsNickNameAvailable({
    //   nickName: createUserInput.nickName,
    // });

    //패스워드 Encrypt
    const { password, ...user } = createUserInput;
    const hashedPwd = await this.usersService.encryptPassword({ password });

    //유저 생성
    return this.usersService.create({
      _user: user,
      hashedPwd,
    });
  }

  //createAdmin : 관리자 계정 생성
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

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteLoginUser(@Context() context: IContext) {
    const email = context.req.user.email;
    return this.usersService.delete({ email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean) //굳이 user를 반환해줘야하나..?(여기서는 runner를 점수매기는 것이기 때문에 user필요없을 듯)
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

    return result ? true : false;

    //현재 user정보를 통하여 find paymentHistory해서 price받아오고 아래에 넘겨주기
    // const email = context.req.user.email;
    // const user = await this.usersService.findOne({ email });

    // const payment = await this.paymentHistoryService.findOne({
    //   boardId,
    //   userId: user.id,
    // });
    // 1. 상태를 거래완료로 바꿀 게시물 boardId 찾기
    //2. 포인트 계산 ( 보증금을 채택된 러너에게 의뢰비랑 함께 돌려주기 )-- usersService에 포인트 업데이트(러너한테 )
    //3.  paymentHistory (러너한테)기록 남기기
    //4.  상태 변경
    // //Runner에 point 넘겨주기
    // const result = await this.usersService.updatePoint({
    //   resultUser: updatedRunner,
    //   price: payment.price,
    //   flag: true,
    // });

    // //board찾기(paymentHistory를 위한)
    // const board = await this.boardsService.findOne({ boardId });

    // //create paymentHistory(runner의 paymentHistory)
    // await this.paymentHistoryService.create({
    //   board: board,
    //   user: updatedRunner,
    //   price: payment.price,
    //   flag: true,
    // });

    // return result.affected;
  }
}
