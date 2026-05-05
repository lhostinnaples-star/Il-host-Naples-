import { 
  Car, Bike, Ship, Palmtree, UserCheck, Utensils, 
  ChefHat, Sparkles, ShieldCheck, Truck, Hammer, Camera, Paintbrush, HardHat, ShieldAlert,
  Map as MapIcon
} from 'lucide-react';

export const SUPPLIER_CATEGORIES = [
  { id: 'cleaning', label: 'Cleaning & Housekeeping', icon: Sparkles },
  { id: 'linen', label: 'Linen & Towels', icon: Sparkles },
  { id: 'welcome_kits', label: 'Welcome Kits', icon: Sparkles },
  { id: 'furniture', label: 'Furniture & Decor', icon: Hammer },
  { id: 'maintenance', label: 'Maintenance & Repairs', icon: Hammer },
  { id: 'laundry', label: 'Laundry Service', icon: Truck },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'interior_design', label: 'Interior Design', icon: Paintbrush },
  { id: 'plumber', label: 'Plumber & Electrician', icon: HardHat },
  { id: 'sos', label: 'SOS Emergency', icon: ShieldAlert, priority: true },
  { id: 'other', label: 'Other', icon: Sparkles }
];

export const PROPERTY_AREAS = [
  'Islands (Ischia & Procida)',
  'Center (Centro Storico)',
  'Seafront (Chiaia - Posillipo)',
  'Station (Piazza Garibaldi)',
  'Stadium (Fuorigrotta - Fair)',
  'Vomero',
  'Mergellina',
  'Pozzuoli'
];

export const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Islands (Ischia & Procida)': { lat: 40.7311, lng: 13.8973 },
  'Center (Centro Storico)': { lat: 40.8518, lng: 14.2681 },
  'Seafront (Chiaia - Posillipo)': { lat: 40.8322, lng: 14.2195 },
  'Station (Piazza Garibaldi)': { lat: 40.8530, lng: 14.2731 },
  'Stadium (Fuorigrotta - Fair)': { lat: 40.8278, lng: 14.1938 },
  'Vomero': { lat: 40.8554, lng: 14.2407 },
  'Mergellina': { lat: 40.8277, lng: 14.2159 },
  'Pozzuoli': { lat: 40.8226, lng: 14.1215 }
};

export const SERVICE_CATEGORIES = [
  {
    id: 'Transport',
    label: 'Transport',
    icon: Car,
    subCategories: [
      { id: 'rent_a_car', label: 'Rent a Car', icon: Car },
      { id: 'rent_scooter', label: 'Rent a Scooter', icon: Bike },
      { id: 'bike_rental', label: 'Bike Rental', icon: Bike },
      { id: 'taxi_services', label: 'Taxi Services', icon: Car },
      { id: 'ncc_private', label: 'Private NCC', icon: ShieldCheck },
      { id: 'airport_transfer', label: 'Airport Transfer', icon: Car },
      { id: 'transport_other', label: 'Other', icon: Sparkles }
    ]
  },
  {
    id: 'Tours',
    label: 'Tours & Leisure',
    icon: Palmtree,
    subCategories: [
      { id: 'boat_rental', label: 'Boat Rental', icon: Ship },
      { id: 'coastline_tour', label: 'Coastline Tour', icon: Palmtree },
      { id: 'private_tour', label: 'Private Tour', icon: UserCheck },
      { id: 'city_tour', label: 'City Tour', icon: MapIcon },
      { id: 'tours_other', label: 'Other', icon: Sparkles }
    ]
  },
  {
    id: 'Lifestyle',
    label: 'Food & Lifestyle',
    icon: Utensils,
    subCategories: [
      { id: 'restaurant_booking', label: 'Restaurant Table Booking', icon: Utensils },
      { id: 'private_chef', label: 'Private Chef', icon: ChefHat },
      { id: 'cooking_class', label: 'Cooking Class', icon: Utensils },
      { id: 'spa_massage', label: 'Spa & Massage', icon: Sparkles },
      { id: 'lifestyle_other', label: 'Other', icon: Sparkles }
    ]
  }
];
