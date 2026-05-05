
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
        id: 'hotel-1',
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
        id: 'hotel-2',
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
    id: 'hotel-1',
    name: 'Villa Partenope',
    type: 'Holiday House',
    category: 'holiday_house',
    area: 'Seafront (Chiaia - Posillipo)',
    price: 180,
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    status: 'approved',
    isFeatured: true,
    rating: 4.9,
    reviews: 24,
    amenities: ['WiFi', 'AC', 'Pool', 'Sea View', 'Kitchen'],
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
    ],
    lat: 40.8322,
    lng: 14.2195,
    description: 'A stunning villa overlooking the Gulf of Naples, offering luxury and comfort for large groups.'
  },
  {
    id: 'hotel-2',
    name: 'Casa Spaccanapoli',
    type: 'BnB',
    category: 'bnb',
    area: 'Center (Centro Storico)',
    price: 75,
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    status: 'approved',
    isFeatured: true,
    rating: 4.8,
    reviews: 18,
    amenities: ['WiFi', 'AC', 'Kitchen'],
    imageUrl: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&q=80&w=1200'
    ],
    lat: 40.8518,
    lng: 14.2681,
    description: 'Authentic living in the heart of the historic center, just steps away from the best pizzerias.'
  },
  {
    id: 'hotel-3',
    name: 'Luxury Suite Chiaia',
    type: 'Holiday House',
    category: 'holiday_house',
    area: 'Seafront (Chiaia - Posillipo)',
    price: 250,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    status: 'approved',
    isFeatured: true,
    rating: 5.0,
    reviews: 31,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Balcony', 'Sea View'],
    imageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=1200'
    ],
    lat: 40.8322,
    lng: 14.2195,
    description: 'Elegant penthouse in the most exclusive neighborhood of Naples.'
  },
  {
    id: 'hotel-4',
    name: 'Vomero Hideaway',
    type: 'BnB',
    category: 'bnb',
    area: 'Vomero',
    price: 90,
    guests: 3,
    bedrooms: 2,
    bathrooms: 1,
    status: 'approved',
    isFeatured: true,
    rating: 4.7,
    reviews: 15,
    amenities: ['WiFi', 'AC', 'Kitchen', 'City View'],
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1200'
    ],
    lat: 40.8554,
    lng: 14.2407,
    description: 'Peaceful retreat in the Vomero hill district with breathtaking views of Vesuvius.'
  },
  {
    id: 'hotel-5',
    name: 'Island Retreat Ischia',
    type: 'Holiday House',
    category: 'holiday_house',
    area: 'Islands (Ischia & Procida)',
    price: 200,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    status: 'approved',
    isFeatured: true,
    rating: 4.9,
    reviews: 22,
    amenities: ['WiFi', 'Pool', 'Sea View', 'Garden'],
    imageUrl: 'https://images.unsplash.com/photo-1549110664-413a68bb7b95?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1549110664-413a68bb7b95?auto=format&fit=crop&q=80&w=1200'
    ],
    lat: 40.7311,
    lng: 13.8973,
    description: 'ESCAPE to the thermal island of Ischia in this beautiful seaside villa.'
  },
  {
    id: 'hotel-6',
    name: 'Mergellina Seaview',
    type: 'BnB',
    category: 'bnb',
    area: 'Mergellina',
    price: 110,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    status: 'approved',
    isFeatured: true,
    rating: 4.8,
    reviews: 19,
    amenities: ['WiFi', 'AC', 'Sea View', 'Balcony'],
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200'
    ],
    lat: 40.8277,
    lng: 14.2159,
    description: 'Wake up to the sound of waves in this charming seaside bed and breakfast.'
  }
];

export const MOCK_SERVICES = [
  { 
    id: 's1', 
    name: 'Capri Boat Tour', 
    description: 'Full-day group or private boat tour to the island of Capri, including Blue Grotto visit.',
    price: 85, 
    priceUnit: 'per person',
    status: 'approved',
    isFeatured: true,
    serviceType: 'B2C', 
    category: 'Tours',
    subCategory: 'Boat Tour',
    imageUrl: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's2', 
    name: 'Pompeii Guided Tour', 
    description: 'Skip-the-line archaeologist-led tour of the ancient ruins of Pompeii.',
    price: 45, 
    priceUnit: 'per person',
    status: 'approved',
    isFeatured: true,
    serviceType: 'B2C', 
    category: 'Tours',
    subCategory: 'Guided Tour',
    imageUrl: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's3', 
    name: 'Pizza Making Class', 
    description: 'Learn to make authentic Neapolitan pizza with a professional pizzaiolo in a historic pizzeria.',
    price: 60, 
    priceUnit: 'per person',
    status: 'approved',
    isFeatured: true,
    serviceType: 'B2C', 
    category: 'Lifestyle',
    subCategory: 'Cooking Class',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's4', 
    name: 'Airport Transfer (Mercedes E-Class)', 
    description: 'Premium private transfer from Naples Capodichino Airport to any city location.',
    price: 50, 
    priceUnit: 'per trip',
    status: 'approved',
    isFeatured: false,
    serviceType: 'B2C', 
    category: 'Transport',
    subCategory: 'NCC Private',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's5', 
    name: 'Vespa Rental (24h)', 
    description: 'Rent an authentic Vespa to explore the narrow streets and hills of Naples independently.',
    price: 70, 
    priceUnit: 'per day',
    status: 'approved',
    isFeatured: true,
    serviceType: 'B2C', 
    category: 'Transport',
    subCategory: 'Scooter Rental',
    imageUrl: 'https://images.unsplash.com/photo-1506901437675-cde80ff9c746?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's6', 
    name: 'Street Food Walking Tour', 
    description: 'Taste the best frittatina, sfogliatella, and pizza a portafoglio in the Spaccanapoli district.',
    price: 40, 
    priceUnit: 'per person',
    status: 'approved',
    isFeatured: true,
    serviceType: 'B2C', 
    category: 'Tours',
    subCategory: 'Food Tour',
    imageUrl: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's7', 
    name: 'Private Chef Dinner', 
    description: 'An exclusive 4-course seafood dinner prepared in your holiday house by a local chef.',
    price: 150, 
    priceUnit: 'per person',
    status: 'approved',
    isFeatured: false,
    serviceType: 'B2C', 
    category: 'Lifestyle',
    subCategory: 'Private Chef',
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's8', 
    name: 'Amalfi Coast Drive', 
    description: 'Private day trip along the stunning Amalfi Coast with stops in Positano and Ravello.',
    price: 350, 
    priceUnit: 'per trip',
    status: 'approved',
    isFeatured: true,
    serviceType: 'B2C', 
    category: 'Tours',
    subCategory: 'Private Tour',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's9', 
    name: 'Deep Sea Fishing', 
    description: 'Morning fishing expedition with traditional Neapolitan fisherman in the Gulf.',
    price: 120, 
    priceUnit: 'per person',
    status: 'approved',
    isFeatured: false,
    serviceType: 'B2C', 
    category: 'Lifestyle',
    subCategory: 'Outdoor',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-47a0160cdd7a?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's10', 
    name: 'Naples Undergound Tour', 
    description: 'Discover the hidden history 40 meters below the city level.',
    price: 15, 
    priceUnit: 'per person',
    status: 'approved',
    isFeatured: false,
    serviceType: 'B2C', 
    category: 'Tours',
    subCategory: 'Guided Tour',
    imageUrl: 'https://images.unsplash.com/photo-1590603740183-980e7f6920eb?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's11', 
    name: 'Vintage Car Tour', 
    description: 'A romantic tour of Naples in a vintage Fiat 500.',
    price: 180, 
    priceUnit: 'per trip',
    status: 'approved',
    isFeatured: true,
    serviceType: 'B2C', 
    category: 'Tours',
    subCategory: 'Private Tour',
    imageUrl: 'https://images.unsplash.com/photo-1555589621-8a506883f07a?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's12', 
    name: 'Wine Tasting at Vesuvius', 
    description: 'Visit a vineyard on the slopes of Vesuvius and taste Lacryma Christi wines.',
    price: 55, 
    priceUnit: 'per person',
    status: 'approved',
    isFeatured: true,
    serviceType: 'B2C', 
    category: 'Lifestyle',
    subCategory: 'Wine Tasting',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's13', 
    name: 'Shopping Personal Assistant', 
    description: 'Find the best custom-made suits and artisanal ties with a local expert.',
    price: 100, 
    priceUnit: 'per session',
    status: 'approved',
    isFeatured: false,
    serviceType: 'B2C', 
    category: 'Lifestyle',
    subCategory: 'Shopping',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 's14', 
    name: 'Procida Day Trip', 
    description: 'Visit the 2022 Italian Capital of Culture, Procida, including ferry and lunch.',
    price: 95, 
    priceUnit: 'per person',
    status: 'approved',
    isFeatured: true,
    serviceType: 'B2C', 
    category: 'Tours',
    subCategory: 'Island Trip',
    imageUrl: 'https://images.unsplash.com/photo-1563820986796-728b78997ef8?auto=format&fit=crop&q=80&w=1200' 
  }
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
