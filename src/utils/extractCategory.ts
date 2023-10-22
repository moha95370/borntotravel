import { Place } from 'src/typeorm/entities/Place';
import { swimmingPool, museums } from './keywords';

export const extractCategories = (data: any[]): Partial<Place>[] => {
  const categorizedData: Partial<Place>[] = [];

  data.forEach((record: any) => {
    const name = record.fields.nom.toLowerCase();
    let category = null;

    if (swimmingPool.some((keyword) => name.includes(keyword))) {
      category = 'Piscine';
    } else if (museums.some((keyword) => name.includes(keyword))) {
      category = 'Musée';
    }

    if (category) {
      categorizedData.push({
        id: record.recordid,
        name: name,
        localite: record.fields.adresse1_localite_value || null,
        categorieApi: record.fields.typeoffre_label_value || null,
        categorie: category,
        telephone: record.fields.telephone || null,
        adresse:
          record.fields.adresse1_rue +
            ' ' +
            record.fields.adresse1_organisme_idmdt || null,
        geolocalisation: record.fields.coordinates || null,
      });
    }
  });

  return categorizedData;
};
