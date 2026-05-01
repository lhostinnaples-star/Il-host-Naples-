import { mockDb } from '../config/db';

export default class Review {
  static async create(data: any) {
    return mockDb.create('reviews', data);
  }
  static async findAll(query: { where: any }) {
    return mockDb.findAll('reviews', query.where);
  }
}
