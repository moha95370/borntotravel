import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from 'src/typeorm/entities/Place';
import { extractCategories } from 'src/utils/extractCategory';

@Injectable()
export class PlacesService {
  constructor() {}

  private async fetchAPI(api: string): Promise<any> {
    try {
      const response = await fetch(api);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch data from API: ${error.message}`);
    }
  }

  async fetchMuseums(): Promise<Partial<Place>[]> {
    const api =
      'https://www.odwb.be/api/records/1.0/search/?dataset=adresses-des-musees-reconnus-en-communaute-francaise&q=&facet=categorie&facet=bassin_de_vie_fwb&facet=categorie0';

    const data = await this.fetchAPI(api);

    const filteredData = data.records.map((record: any) => ({
      id: record.recordid,
      name: record.fields.denomination || null,
      localite: record.fields.localite || null,
      categorieApi: record.fields.categorie || null,
      categorie: 'visite',
      telephone: record.fields.telephone || null,
      adresse: record.fields.adresse || null,
      geolocalisation: record.fields.geolocalisation || null,
    }));

    return filteredData;
  }

  async fetchMonuments(): Promise<Partial<Place>[]> {
    const api =
      'https://www.odwb.be/api/records/1.0/search/?dataset=patrimoine-wallon-monuments&q=&facet=referentie&facet=province&facet=arrondissement&facet=canton&facet=commune';

    const data = await this.fetchAPI(api);

    const filteredData = data.records.map((record: any) => ({
      id: record.recordid,
      name: record.fields.libelle || null,
      localite: record.fields.commune || null,
      categorieApi: record.fields.referentie || null,
      categorie: 'visite',
      telephone: record.fields.telephone || null,
      adresse: record.fields.adresse || null,
      geolocalisation: record.fields.geo_point_2d || null,
    }));

    return filteredData;
  }

  async fetchPointOfView(): Promise<Partial<Place>[]> {
    const api =
      'https://www.odwb.be/api/records/1.0/search/?dataset=points-et-lignes-de-vue-remarquables-en-wallonie1&q=&facet=label&facet=orient&facet=province&facet=arrondissement&facet=canton&facet=commune';

    const data = await this.fetchAPI(api);

    const filteredData = data.records.map((record: any) => ({
      id: record.recordid,
      name: record.fields.label || null,
      localite: record.fields.commune || null,
      categorieApi: 'point de vue',
      categorie: 'visite',
      telephone: record.fields.telephone || null,
      adresse: record.fields.adresse || null,
      geolocalisation: record.fields.geo_point_2d || null,
    }));

    return filteredData;
  }

  async fetchTouristOffice(): Promise<Partial<Place>[]> {
    const api =
      'https://www.odwb.be/api/records/1.0/search/?dataset=cgt-pivot-organismes-touristiques&q=';

    const data = await this.fetchAPI(api);

    const filteredData = data.records.map((record: any) => ({
      id: record.recordid,
      name: record.fields.nom || null,
      localite: record.fields.adresse1_commune_value || null,
      categorieApi: 'office de tourisme',
      categorie: 'information',
      telephone: record.fields.telephone || null,
      adresse:
        record.fields.adresse1_rue +
          ' ' +
          record.fields.adresse1_organisme_idmdt || null,
      geolocalisation: record.fields.coordinates || null,
    }));

    return filteredData;
  }

  async fetchDivertissement(): Promise<Partial<Place>[]> {
    const api =
      'https://www.odwb.be/api/records/1.0/search/?dataset=cgt-pivot-attractions-et-loisirs&q=&rows=100';

    const data = await this.fetchAPI(api);
    const categorizedData = extractCategories(data.records);

    return categorizedData;
  }
}
