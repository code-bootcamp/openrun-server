import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from 'src/apis/events/entities/event.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class EventImage {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({
    nullable: true,
  })
  @Field(() => String, { nullable: true, name: 'url' })
  url: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Event)
  @Field(() => Event)
  event: Event;
}
