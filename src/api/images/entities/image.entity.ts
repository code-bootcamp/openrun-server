import { Field, ObjectType } from '@nestjs/graphql';
import { Board } from 'src/api/boards/entities/board.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({
    nullable: true,
  })
  @Field(() => String, { nullable: true, name: 'url' })
  url: string;

  @JoinColumn()
  @OneToOne(() => Board)
  @Field(() => Board, { nullable: true })
  board: Board;
}
