import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'places' })
export class Place {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ default: null })
  name: string;

  @Column({ default: null })
  localite: string;

  @Column({ default: null })
  categorieApi: string;

  @Column({ default: null })
  categorie: string;

  @Column({ default: null })
  telephone: string;

  @Column({ default: null })
  adresse: string;

  @Column('simple-array', { nullable: true })
  geolocalisation: [number, number];
}
