import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class LocationInput {
  @Field(() => String)
  address: string;

  @Field(() => String)
  addressDetail: string;

  @Field(() => Float)
  lat: number;

  @Field(() => Float)
  lng: number;
}
