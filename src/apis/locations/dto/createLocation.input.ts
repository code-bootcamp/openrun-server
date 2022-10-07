import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class LocationInput {
  @Field(() => String, { nullable: true, name: 'address' })
  address: string;

  @Field(() => String, { nullable: true, name: 'addressDetail' })
  addressDetail: string;

  @Field(() => Float, { nullable: true, name: 'lat' })
  lat: number;

  @Field(() => Float, { nullable: true, name: 'lng' })
  lng: number;

  @Field(() => String, { nullable: true, name: 'zipcode' })
  zipcode: string;
}
