import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventImage } from '../eventImages/entities/eventImage.entity';
import { FileService } from '../file/file.service';
import { Event } from './entities/event.entity';
import { EventsResolver } from './events.resolver';
import { EventsService } from './events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event, //
      EventImage,
    ]),
  ],
  providers: [
    EventsResolver, //
    EventsService,
    FileService,
  ],
})
export class EventsModule {}
