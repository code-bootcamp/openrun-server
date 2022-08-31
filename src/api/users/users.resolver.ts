import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './dto/createUser.input';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

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
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput, //
  ) {
    return this.usersService.create({ createUserInput });
  }
}
