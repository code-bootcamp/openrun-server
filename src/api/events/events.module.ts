import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventsResolver } from './events.resolver';
import { EventsService } from './events.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event, //
    ]),
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200', //
    }),
  ],
  providers: [
    EventsResolver, //
    EventsService,
  ],
})
export class EventsModule {}
