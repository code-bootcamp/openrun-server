import { Field, ObjectType } from '@nestjs/graphql';
import { Board } from 'src/api/boards/entities/board.entity';
import { User } from 'src/api/users/entities/user.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  room: string;

  @ManyToOne(() => User)
  @Field(() => User)
  seller: User;

  @ManyToOne(() => User)
  @Field(() => User)
  runner: User;

  @JoinColumn()
  @OneToOne(() => Board)
  @Field(() => Board)
  board: Board;
}
