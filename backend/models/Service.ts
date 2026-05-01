import { mockDb } from '../config/db';

export default class Service {
  id!: string;
  name!: string;
  category!: string;
  subCategory!: string;
  description!: string;
  price!: number;
  priceUnit!: string;
  location!: string;
  imageUrl!: string;
  features!: string[];
  providerId!: string;
  createdAt!: Date;

  static async create(data: any) {
    return mockDb.create('services', data);
  }
  static async findByPk(id: string) {
    return mockDb.findByPk('services', id);
  }
  static async findAll(query?: { where: any }) {
    return mockDb.findAll('services', query?.where);
  }
  static async destroy(query: { where: { id: string } }) {
    return mockDb.delete('services', query.where.id);
  }
}
