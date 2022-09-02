import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  nickName: string;

  @Field(() => String)
  phone: string;

  @Field(() => String)
  profileImg: string;
}
