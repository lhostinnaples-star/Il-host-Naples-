const fs = require('fs');
const path = require('path');

const areas = ['ISLANDS', 'CENTER', 'SEAFRONT', 'STATION', 'STADIUM', 'VOMERO'];

// Exactly 40 names
const baseNames = {
  'ISLANDS': ['Capri Tiberio Palace', 'Hotel Quisisana', 'Excelsior Parco', 'B&B Il Bacio di Capri', 'Ischia Blu Resort', 'San Montano Resort & Spa', 'Procida Camp & Resort'], // 7
  'CENTER': ['Lhost in Naples', 'Grand Hotel Oriente', 'Decumani Hotel de Charme', 'B&B Centro Storico', 'Palazzo Caracciolo', 'Santa Chiara Boutique Hotel', 'Spaccanapoli Comfort Suites'], // 7
  'SEAFRONT': ['Grand Hotel Vesuvio', 'Eurostars Hotel Excelsior', 'Royal Continental', 'Relais sul Mare', 'Partenope Relais', 'B&B Lungomare', 'Miramare'], // 7
  'STATION': ['Starhotels Terminus', 'UNAHOTELS Napoli', 'B&B Napoli Binario 1', 'B&B Sweet Sleep', 'Hotel Vergilius Billia', 'B&B Firenze 32', 'B&B Central Station'], // 7
  'STADIUM': ['Hotel Leopardi', 'LHP Napoli Palace & SPA', 'B&B Fuorigrotta', 'B&B Mostra d\'Oltremare', 'Hotel Serius', 'B&B Domus Campi Flegrei'], // 6
  'VOMERO': ['Hotel Cimarosa', 'B&B Scarlatti', 'Villa Maria', 'B&B La Casa di Plinio', 'Gentile Relais', '7th Floor Suite'] // 6
};

const images = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1514890547357-a9ee2887ad8e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1590603740183-980e7f6920eb?auto=format&fit=crop&q=80&w=800'
];

const areaCoords = {
  'ISLANDS': { lat: 40.5500, lng: 14.2400 },
  'CENTER': { lat: 40.8450, lng: 14.2500 },
  'SEAFRONT': { lat: 40.8300, lng: 14.2450 },
  'STATION': { lat: 40.8520, lng: 14.2700 },
  'STADIUM': { lat: 40.8270, lng: 14.1930 },
  'VOMERO': { lat: 40.8430, lng: 14.2330 }
};

let properties = [];
let idCounter = 1;

for (const area of areas) {
  const names = baseNames[area];
  for (const name of names) {
    const isBnb = name.includes('B&B') || name.includes('Lhost') || name.includes('Relais') || name.includes('Camp') || name.includes('Suite');
    const category = isBnb ? 'bnb' : 'holiday_house';
    let propertyCategory = 'Hotels';
    if (isBnb) {
      propertyCategory = 'Bed and Breakfasts (BnB)';
    } else {
      const rand = Math.random();
      if (rand > 0.7) propertyCategory = 'Apartments';
      else if (rand > 0.4) propertyCategory = 'Villas';
      else if (rand > 0.2) propertyCategory = 'Resorts';
    }
    
    // Generate slight random offset for coordinates
    const baseLat = areaCoords[area].lat;
    const baseLng = areaCoords[area].lng;
    const lat = baseLat + (Math.random() - 0.5) * 0.01;
    const lng = baseLng + (Math.random() - 0.5) * 0.01;

    const amenities = ['WiFi', 'Air Conditioning', 'Shower', 'Flat-screen TV'];
    if (Math.random() > 0.2) amenities.push('Streaming Services (Netflix)');
    if (category === 'holiday_house' || Math.random() > 0.8) amenities.push('Swimming Pool');
    if (category === 'holiday_house' || Math.random() > 0.7) amenities.push('Fitness Center');
    if (Math.random() > 0.3) amenities.push('Parking');
    if (category === 'holiday_house' && Math.random() > 0.2) amenities.push('Room Service');

    const policies = [];
    if (Math.random() > 0.1) policies.push('Free Cancellation');
    if (Math.random() > 0.5) policies.push('No Prepayment');
    if (Math.random() > 0.6) policies.push('Book without Credit Card');

    const price = isBnb ? Math.floor(Math.random() * 80) + 60 : Math.floor(Math.random() * 250) + 150;
    const rating = parseFloat((Math.random() * 1.5 + 8.5).toFixed(1));
    const reviews = Math.floor(Math.random() * 800) + 50;
    const image = images[idCounter % images.length];

    properties.push({
      name,
      description: `Experience the best of Naples in this stunning ${category === 'bnb' ? 'bed and breakfast' : 'hotel'} located in the vibrant ${area} area.`,
      address: `Via Napoli ${idCounter}`,
      city: 'Naples',
      country: 'Italy',
      price,
      rating,
      reviews,
      distance: `${(Math.random() * 4 + 0.1).toFixed(1)} km from center`,
      type: propertyCategory,
      propertyCategory,
      category,
      area,
      lat,
      lng,
      amenities,
      policies,
      imageUrl: image,
      badges: Math.random() > 0.6 ? ['Genius'] : (Math.random() > 0.5 ? ['Getaway Deal'] : [])
    });
    idCounter++;
  }
}

fs.mkdirSync(path.join(__dirname, 'backend/data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'backend/data/seedData.ts'), `export const seedProperties = ${JSON.stringify(properties, null, 2)};\n`);
console.log('Generated 40 properties');
