import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './dto/createUser.input';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService, //
  ) {}

  @Query(() => String)
  helloWorld() {
    return 'helloworld!';
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
    const { password, cardInfoInput, ...user } = createUserInput;
    const hashedPwd = await bcrypt.hash(password, 10);

    //유저 생성
    return this.usersService.create({ _user: user, hashedPwd, cardInfoInput });
  }
}
