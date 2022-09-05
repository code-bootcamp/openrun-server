import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({
    nullable: true,
  })
  @Field(() => String)
  address: string;

  @Column({ nullable: true })
  @Field(() => String)
  addressDetail: string;

  @Column({ nullable: true })
  @Field(() => Float)
  lat: number;

  @Column({ nullable: true })
  @Field(() => Float)
  lng: number;

  @Column({ nullable: true })
  @Field(() => String)
  zipcode: string;
}
