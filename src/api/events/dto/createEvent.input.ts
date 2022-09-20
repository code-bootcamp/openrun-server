import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateEventInput {
  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  brand: string;

  @Field(() => [String], { nullable: true, name: 'contentsImage' })
  contentsImage: [string];

  @Field(() => Date, { nullable: true, name: 'period' })
  period: Date;

  @Field(() => String, { nullable: true, name: 'location' })
  location: string;

  @Field(() => String, { nullable: true, name: 'image' })
  image: string;

  @Field(() => String, { nullable: true, name: 'fakeData' })
  fakeData: string;

  @Field(() => String, { nullable: true, name: 'category' })
  category: string;
}
