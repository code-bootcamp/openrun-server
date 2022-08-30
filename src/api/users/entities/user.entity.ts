import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column()
  @Field(() => String)
  nickName: string;

  @Column()
  @Field(() => String)
  phone: string;

  @Column()
  @Field(() => Int)
  point: number;

  @Column()
  @Field(() => Int)
  rating: number;

  @Column()
  @Field(() => String)
  profile: string;

  @Column()
  @Field(() => Int)
  report: number;

  @Column()
  @Field(() => Boolean)
  isAdmin: boolean;

  @Column()
  @Field(() => String)
  type: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deleteAt: Date;
}
