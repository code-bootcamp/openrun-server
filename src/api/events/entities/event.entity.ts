import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => String)
  contents: string;

  @Column()
  @Field(() => Date)
  period: Date;

  @Column()
  @Field(() => String)
  location: string;

  @Column()
  @Field(() => String)
  image: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;
}
