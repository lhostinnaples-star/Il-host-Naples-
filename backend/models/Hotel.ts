import { mockDb, store } from '../config/db';

export default class Hotel {
  static async create(data: any) {
    return mockDb.create('hotels', data);
  }
  static async update(id: string, data: any) {
    return mockDb.update('hotels', id, data);
  }
  static async findAll(query?: { where?: any; include?: any[] }) {
    let hotels = await mockDb.findAll('hotels');
    if (query?.where) {
      hotels = hotels.filter(h => {
        return Object.entries(query.where).every(([key, value]) => h[key] === value);
      });
    }
    // Simple mock join
    return hotels.map(hotel => {
      const owner = store.users.find(u => u.id === hotel.ownerId);
      return { ...hotel, owner };
    });
  }
  static async findByPk(id: string, query?: { include?: any[] }) {
    const hotel = await mockDb.findByPk('hotels', id);
    if (hotel) {
      const owner = store.users.find(u => u.id === hotel.ownerId);
      return { ...hotel, owner };
    }
    return null;
  }
}
