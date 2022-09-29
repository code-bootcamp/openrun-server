import { Field, ObjectType } from '@nestjs/graphql';
import { Board } from 'src/apis/boards/entities/board.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  contents: string;

  @Column({ nullable: true })
  @Field(() => Boolean, { nullable: true })
  isNew: boolean;

  @ManyToOne(() => User, { nullable: true })
  @Field(() => User, { nullable: true })
  user: User;

  @JoinColumn()
  @OneToOne(() => Board)
  @Field(() => Board, { nullable: true })
  board: Board;
}
