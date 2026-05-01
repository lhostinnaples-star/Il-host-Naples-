import { 
  Car, Bike, Ship, Palmtree, UserCheck, Utensils, 
  ChefHat, Sparkles, ShieldCheck 
} from 'lucide-react';

export const SERVICE_CATEGORIES = [
  {
    id: 'Transport',
    label: 'TRANSPORT',
    icon: Car,
    subCategories: [
      { id: 'rent_a_car', label: 'Rent a Car', icon: Car },
      { id: 'rent_scooter', label: 'Rent Scooter', icon: Bike },
      { id: 'bike_rental', label: 'Bike Rental', icon: Bike },
      { id: 'taxi_services', label: 'Taxi Services', icon: Car },
      { id: 'ncc_private', label: 'NCC Private', icon: ShieldCheck },
    ]
  },
  {
    id: 'Tours',
    label: 'TOURS & LEISURE',
    icon: Palmtree,
    subCategories: [
      { id: 'boat_rental', label: 'Boat Rental', icon: Ship },
      { id: 'coastline', label: 'Coastline', icon: Palmtree },
      { id: 'private_tour', label: 'Private Tour', icon: UserCheck },
    ]
  },
  {
    id: 'Lifestyle',
    label: 'FOOD & LIFESTYLE',
    icon: Utensils,
    subCategories: [
      { id: 'restaurant_booking', label: 'Restaurant Table Booking', icon: Utensils },
      { id: 'private_chef', label: 'Private Chef', icon: ChefHat },
      { id: 'cooking_class', label: 'Cooking Class', icon: Utensils },
      { id: 'spa_massage', label: 'Spa Massage', icon: Sparkles },
    ]
  }
];
