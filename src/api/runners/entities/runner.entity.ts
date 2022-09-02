import { Field, ObjectType } from '@nestjs/graphql';
import { Board } from 'src/api/boards/entities/board.entity';
import { User } from 'src/api/users/entities/user.entity';
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
export class Runner {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ default: false })
  @Field(() => Boolean)
  isChecked: boolean;

  @JoinColumn()
  @OneToOne(() => User)
  @Field(() => User)
  user: User;

  @JoinColumn()
  @ManyToOne(() => Board)
  @Field(() => Board)
  board: Board;
}
