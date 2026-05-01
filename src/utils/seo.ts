
export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
};

export interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

export const getDefaultMetaTags = (path: string): MetaTagsProps => {
  const isPrivate = 
    path.startsWith('/dashboard') || 
    path.startsWith('/owner') || 
    path.startsWith('/supplier') || 
    path.startsWith('/service-dashboard') || 
    path.startsWith('/admin') ||
    ['/login', '/register', '/verify-email', '/shared-pool', '/supplier-directory'].includes(path);

  const isSearchWithParams = path.startsWith('/search') && path.includes('?');

  return {
    title: 'Il Host in Naples - Holiday Houses, B&Bs & Experiences in Naples',
    description: 'Find and book the best holiday houses, B&Bs and experiences in Naples. Compare prices, read reviews and book instantly.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    url: `https://www.ilhostinnaples.com${path}`,
    type: 'website',
    noindex: isPrivate || isSearchWithParams
  };
};

export const generatePropertySchema = (property: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": property.name,
    "description": property.description,
    "image": property.images || [property.imageUrl],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address || 'Naples',
      "addressLocality": "Naples",
      "addressCountry": "IT"
    },
    "priceRange": "€€",
    "starRating": property.rating || 5,
    "numberOfRooms": property.bedrooms || 1,
    "amenityFeature": property.amenities?.map((a: string) => ({
      "@type": "LocationFeatureSpecification",
      "name": a,
      "value": true
    })) || []
  };
};

export const generateExperienceSchema = (service: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": service.name,
    "description": service.description || service.shortDescription,
    "offers": {
      "@type": "Offer",
      "price": service.price,
      "priceCurrency": "EUR"
    }
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Il Host in Naples",
    "url": "https://www.ilhostinnaples.com",
    "logo": "https://www.ilhostinnaples.com/logo.png",
    "sameAs": [
      "https://facebook.com/ilhostinnaples",
      "https://instagram.com/ilhostinnaples"
    ]
  };
};

export const generateBreadcrumbSchema = (items: { name: string, item: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://www.ilhostinnaples.com${item.item}`
    }))
  };
};
