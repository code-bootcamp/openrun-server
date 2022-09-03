import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateEventInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  contents: string;

  @Field(() => Date)
  period: Date;

  @Field(() => String)
  location: string;

  @Field(() => String)
  image: string;

  @Field(() => String)
  fakeData: string;
}
