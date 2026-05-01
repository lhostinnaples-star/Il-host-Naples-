import { mockDb } from '../config/db';

export default class Room {
  static async create(data: any) {
    return mockDb.create('rooms', data);
  }
  static async update(id: string, data: any) {
    return mockDb.update('rooms', id, data);
  }
  static async findAll(query: { where: any }) {
    return mockDb.findAll('rooms', query.where);
  }
  static async findByPk(id: string) {
    return mockDb.findByPk('rooms', id);
  }
}
