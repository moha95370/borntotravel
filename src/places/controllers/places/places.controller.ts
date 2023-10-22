import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PlacesService } from 'src/places/services/places/places.service';

@Controller('places')
export class PlacesController {
  constructor(private placesService: PlacesService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAllPlaces(
    @Query('category') category: string,
    @Query('subcategory') subcategory?: string,
  ) {
    const normalizedMainCategory = this.normalizeString(category);
    let allPlacesData = await this.placesService.fetchMuseums();
    allPlacesData = allPlacesData.concat(
      await this.placesService.fetchMonuments(),
    );
    allPlacesData = allPlacesData.concat(
      await this.placesService.fetchPointOfView(),
    );
    allPlacesData = allPlacesData.concat(
      await this.placesService.fetchTouristOffice(),
    );
    allPlacesData = allPlacesData.concat(
      await this.placesService.fetchDivertissement(),
    );

    if (subcategory) {
      const normalizedSubCategory = this.normalizeString(subcategory);
      allPlacesData = allPlacesData.filter(
        (place) =>
          this.normalizeString(place.categorie) === normalizedMainCategory &&
          this.normalizeString(place.categorieApi) === normalizedSubCategory,
      );
    } else {
      allPlacesData = allPlacesData.filter(
        (place) =>
          this.normalizeString(place.categorie) === normalizedMainCategory,
      );
    }

    return allPlacesData;
  }

  private normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();
  }
}
