import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { nullable: true, name: 'email' })
  email: string;

  @Field(() => String, { nullable: true, name: 'password' })
  password: string;

  @Field(() => String, { nullable: true, name: 'nickName' })
  nickName: string;

  @Field(() => String, { nullable: true, name: 'phone' })
  phone: string;
}
