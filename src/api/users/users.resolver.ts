import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './dto/createUser.input';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserInput } from './dto/updateUser.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/types/type';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [User])
  fetchUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User)
  fetchLoginUser(@Context() context: IContext) {
    const email = context.req.user.email;
    return this.usersService.findOne({ email });
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput, //
  ) {
    //유저가 존재하는지 확인
    await this.usersService.checkIsUserAvailable({
      email: createUserInput.email,
    });

    //닉네임이 존재하는지 확인
    await this.usersService.checkIsNickNameAvailable({
      nickName: createUserInput.nickName,
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
}
