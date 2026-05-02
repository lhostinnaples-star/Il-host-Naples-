
import { UserRole } from '../contexts/AuthContext';

export const MOCK_BOOKINGS = [
  {
    id: 'b1',
    checkIn: '2026-06-01',
    checkOut: '2026-06-05',
    status: 'confirmed',
    totalPrice: 600,
    guests: 2,
    Room: {
      type: 'Entire Villa',
      Hotel: {
        id: 'h1',
        name: 'Villa Roma',
        city: 'Naples',
        country: 'Italy',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
      }
    }
  },
  {
    id: 'b2',
    checkIn: '2026-07-10',
    checkOut: '2026-07-12',
    status: 'pending',
    totalPrice: 160,
    guests: 2,
    Room: {
      type: 'Double Room',
      Hotel: {
        id: 'h2',
        name: 'Casa Mare',
        city: 'Naples',
        country: 'Italy',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'
      }
    }
  }
];

export const MOCK_PROPERTIES = [
  {
    id: 'h1',
    name: 'Villa Roma',
    type: 'Holiday House',
    price: 150,
    guests: 6,
    bedrooms: 3,
    status: 'active',
    area: 'Centro Storico',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
  },
  {
    id: 'h2',
    name: 'Casa Mare',
    type: 'BnB',
    price: 80,
    guests: 2,
    bedrooms: 1,
    status: 'active',
    area: 'Posillipo',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'
  }
];

export const MOCK_SERVICES = [
  { id: 's1', name: 'Capri Boat Tour', price: 85, serviceType: 'Boat Tour', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750' },
  { id: 's2', name: 'Airport Transfer', price: 45, serviceType: 'Airport Transfer', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945' },
  { id: 's3', name: 'Private Chef Dinner', price: 120, serviceType: 'Private Chef', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750' }
];

export const MOCK_SUPPLIER_SERVICES = [
  { id: 'ss1', name: 'Deep Cleaning', price: 80, category: 'Cleaning' },
  { id: 'ss2', name: 'Linen Set Premium', price: 25, category: 'Linen & Towels' },
  { id: 'ss3', name: 'Welcome Kit', price: 35, category: 'Welcome Kits' }
];

export const MOCK_ADMIN_APPROVALS = [
  { 
    id: 'a1', 
    name: 'Giuseppe Marino', 
    role: 'hotel_owner', 
    email: 'giuseppe@test.com', 
    status: 'pending_approval',
    details: {
      businessName: 'Marino Apartments',
      vatNumber: 'IT12345678901',
      address: 'Via Toledo 12, Napoli',
      propertiesCount: 2
    }
  },
  { 
    id: 'a2', 
    name: 'Cleaning Pro Napoli', 
    role: 'supplier', 
    email: 'pro@cleaning.it', 
    status: 'pending_approval',
    details: {
      companyName: 'Pulizie Napoli Srl',
      founded: 2018,
      employees: 15,
      specialization: 'High-end B&B maintenance'
    }
  },
  { 
    id: 'a3', 
    name: 'Vespa Rental Naples', 
    role: 'service_provider', 
    email: 'rent@vespa.napoli', 
    status: 'pending_approval',
    details: {
      fleetSize: 12,
      insuranceType: 'Kasko Full',
      licenseNumber: 'NAP-V-992',
      yearsActive: 5
    }
  }
];

export const MOCK_BOOKING_POOL = [
  {
    id: 'p1',
    guestName: 'John Smith',
    nights: 4,
    checkIn: '2026-06-15',
    checkOut: '2026-06-19',
    status: 'open',
    timerEnds: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
  }
];
