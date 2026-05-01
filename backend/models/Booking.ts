import { mockDb, store } from '../config/db';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  SHARED = 'shared',
  ACCEPTED = 'accepted'
}

export default class Booking {
  static async create(data: any) {
    return mockDb.create('bookings', data);
  }
  static async update(id: string, data: any) {
    return mockDb.update('bookings', id, data);
  }
  static async findByPk(id: string) {
    const booking = await mockDb.findByPk('bookings', id);
    if (booking) {
      const room = store.rooms.find(r => r.id === booking.roomId);
      const hotel = room ? store.hotels.find(h => h.id === room.hotelId) : null;
      return { ...booking, Room: { ...room, Hotel: hotel } };
    }
    return null;
  }
  static async findOne(query: { where: any }) {
    return mockDb.findOne('bookings', query.where);
  }
  static async findAll(query: { where: any, include?: any[] }) {
    const bookings = await mockDb.findAll('bookings', query.where);
    // Simple mock join
    return bookings.map(booking => {
      const room = store.rooms.find(r => r.id === booking.roomId);
      const hotel = room ? store.hotels.find(h => h.id === room.hotelId) : null;
      return { ...booking, Room: { ...room, Hotel: hotel } };
    });
  }
}
