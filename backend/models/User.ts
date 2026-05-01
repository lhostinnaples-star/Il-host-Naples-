import { mockDb } from '../config/db';

export enum UserRole {
  ADMIN = 'admin',
  HOTEL_OWNER = 'hotel_owner',
  CUSTOMER = 'customer',
  SERVICE_PROVIDER = 'service_provider',
  SUPPLIER = 'supplier'
}

export default class User {
  id!: string;
  name!: string;
  email!: string;
  password!: string;
  role!: UserRole;
  businessName?: string;

  static async create(data: any) {
    return mockDb.create('users', data);
  }
  static async findOne(query: { where: any }) {
    return mockDb.findOne('users', query.where);
  }
  static async findByPk(id: string) {
    return mockDb.findByPk('users', id);
  }
  static async findAll() {
    return mockDb.findAll('users');
  }
}
