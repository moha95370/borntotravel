import { Module } from '@nestjs/common';
import { PlacesController } from './controllers/places/places.controller';
import { PlacesService } from './services/places/places.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from 'src/typeorm/entities/Place';

@Module({
  imports: [TypeOrmModule.forFeature([Place])],
  controllers: [PlacesController],
  providers: [PlacesService],
})
export class PlacesModule {}
