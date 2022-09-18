import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationesService {
  @InjectRepository(Location)
  private readonly locationRepository: Repository<Location>;

  createLocation({ location }) {
    return this.locationRepository.save({
      address: location,
    });
  }
}
