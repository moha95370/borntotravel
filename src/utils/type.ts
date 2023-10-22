export type CreateCategoryParams = {
  name: string;
};

export type UpdateCategoryParams = {
  name: string;
};

export type CreateUserParams = {
  firstname: string;
  lastname: string;
  pseudo: string;
  password: string;
  email: string;
};

export type UpdateUserParams = {
  firstname: string;
  lastname: string;
  pseudo: string;
  password: string;
  email: string;
};

export type CreatePlaceParams = {
  name?: string;
  localite?: string;
  categorieApi?: string;
  categorie?: string;
  telephone?: string;
  adresse?: string;
  geolocalisation?: number[];
};
