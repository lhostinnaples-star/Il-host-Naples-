import { mockDb } from '../config/db';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export default class Payment {
  static async create(data: any) {
    return mockDb.create('payments', data);
  }
}
