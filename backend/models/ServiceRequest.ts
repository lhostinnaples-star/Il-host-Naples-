import { mockDb } from '../config/db';

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export default class ServiceRequest {
  id!: string;
  serviceId!: string;
  customerId!: string;
  providerId!: string;
  status!: RequestStatus;
  details!: string;
  date!: string;
  createdAt!: Date;

  static async create(data: any) {
    return mockDb.create('service_requests', data);
  }
  static async findByPk(id: string) {
    return mockDb.findByPk('service_requests', id);
  }
  static async findAll(query?: { where: any }) {
    return mockDb.findAll('service_requests', query?.where);
  }
  static async update(data: any, query: { where: { id: string } }) {
    return mockDb.update('service_requests', query.where.id, data);
  }
}
