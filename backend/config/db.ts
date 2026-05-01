// Mock Database Implementation
// This replaces Sequelize and SQLite to avoid GLIBC errors

export const db = {
  authenticate: async () => Promise.resolve(),
  sync: async () => Promise.resolve(),
};

// Simple in-memory store
export const store: { [key: string]: any[] } = {
  users: [],
  hotels: [],
  rooms: [],
  bookings: [],
  reviews: [],
  services: [
    {
      id: 's1',
      name: 'Luxury Capri Boat Tour',
      category: 'Tours',
      subCategory: 'boat_rental',
      description: 'A full-day private boat tour around Capri and the Amalfi Coast. Includes drinks and snacks.',
      price: 450,
      priceUnit: 'group',
      location: 'Naples Harbor',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800',
      features: ['Private Boat', 'Local Guide', 'Drinks Included'],
      providerId: 'provider-1',
      createdAt: new Date()
    },
    {
      id: 's2',
      name: 'Private Chef Dinner',
      category: 'Lifestyle',
      subCategory: 'private_chef',
      description: 'Authentic 4-course Neapolitan dinner prepared at your villa or hotel suite.',
      price: 85,
      priceUnit: 'person',
      location: 'Your Location',
      imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800',
      features: ['Local Ingredients', 'Wine Pairing', 'Cleanup Included'],
      providerId: 'provider-2',
      createdAt: new Date()
    },
    {
      id: 's3',
      name: 'Vintage Vespa Rental',
      category: 'Transport',
      subCategory: 'rent_scooter',
      description: 'Explore Naples and the surrounding hills on a classic vintage Vespa.',
      price: 65,
      priceUnit: 'day',
      location: 'Naples Center',
      imageUrl: 'https://images.unsplash.com/photo-1563297058-2045cc919630?q=80&w=800',
      features: ['Helmets Included', 'Insurance', 'Full Tank'],
      providerId: 'provider-3',
      createdAt: new Date()
    },
    {
      id: 's4',
      name: 'Fiat 500 Vintage Rental',
      category: 'Transport',
      subCategory: 'rent_a_car',
      description: 'The ultimate Italian driving experience in a classic Fiat 500.',
      price: 120,
      priceUnit: 'day',
      location: 'Naples Center',
      imageUrl: 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=800',
      features: ['Classic Car', 'Delivery Included', 'Photo Ops'],
      providerId: 'provider-4',
      createdAt: new Date()
    },
    {
      id: 's5',
      name: 'Amalfi Coast Skyline Tour',
      category: 'Tours',
      subCategory: 'coastline',
      description: 'Guided drive along the world-famous Amalfi Coast with stops in Positano and Ravello.',
      price: 180,
      priceUnit: 'group',
      location: 'Naples Station',
      imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800',
      features: ['Air Conditioned', 'Expert Driver', 'Photo Stops'],
      providerId: 'provider-1',
      createdAt: new Date()
    },
    {
      id: 's6',
      name: 'Neapolitan Cooking Class',
      category: 'Lifestyle',
      subCategory: 'cooking_class',
      description: 'Learn to make authentic pizza and pasta from scratch in a local family home.',
      price: 75,
      priceUnit: 'person',
      location: 'Naples Old Town',
      imageUrl: 'https://images.unsplash.com/photo-1507048331167-7d49e93bc9ca?q=80&w=800',
      features: ['Hands-on Class', 'Full Meal Included', 'Wine Included'],
      providerId: 'provider-2',
      createdAt: new Date()
    },
    {
      id: 's7',
      name: 'Mountain Bike Vesuvius Trail',
      category: 'Transport',
      subCategory: 'bike_rental',
      description: 'Full-day mountain bike rental with specialized maps for Mt. Vesuvius trails.',
      price: 35,
      priceUnit: 'day',
      location: 'Ercolano',
      imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ee0c9eef4b4?q=80&w=800',
      features: ['High-end Bicycles', 'Safety Gear', 'GPX Maps'],
      providerId: 'provider-3',
      createdAt: new Date()
    },
    {
      id: 's8',
      name: 'Sorento Spa Experience',
      category: 'Lifestyle',
      subCategory: 'spa_massage',
      description: 'Total relaxation with volcanic mud treatments and panoramic sea-view massages.',
      price: 150,
      priceUnit: 'person',
      location: 'Sorrento',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800',
      features: ['Ocean View', 'Full Access', 'Treatment Included'],
      providerId: 'provider-5',
      createdAt: new Date()
    }
  ],
  service_requests: []
};

// Helper for simple CRUD
export const mockDb = {
  create: async (collection: string, data: any) => {
    const newItem = { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date(), updatedAt: new Date() };
    store[collection].push(newItem);
    return newItem;
  },
  findAll: async (collection: string, filter?: any) => {
    let results = store[collection];
    if (filter) {
      results = results.filter(item => {
        return Object.keys(filter).every(key => item[key] === filter[key]);
      });
    }
    return results;
  },
  findOne: async (collection: string, filter: any) => {
    return store[collection].find(item => {
      return Object.keys(filter).every(key => item[key] === filter[key]);
    });
  },
  findByPk: async (collection: string, id: string) => {
    return store[collection].find(item => item.id === id);
  },
  update: async (collection: string, id: string, data: any) => {
    const index = store[collection].findIndex(item => item.id === id);
    if (index !== -1) {
      store[collection][index] = { ...store[collection][index], ...data, updatedAt: new Date() };
      return store[collection][index];
    }
    return null;
  },
  delete: async (collection: string, id: string) => {
    const index = store[collection].findIndex(item => item.id === id);
    if (index !== -1) {
      store[collection].splice(index, 1);
      return true;
    }
    return false;
  }
};
