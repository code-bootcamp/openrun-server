import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateEventInput {
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true, name: 'contents' })
  contents: string;

  @Field(() => Date, { nullable: true, name: 'period' })
  period: Date;

  @Field(() => String, { nullable: true, name: 'location' })
  location: string;

  @Field(() => String, { nullable: true, name: 'image' })
  image: string;

  @Field(() => String, { nullable: true, name: 'fakeData' })
  fakeData: string;
}
