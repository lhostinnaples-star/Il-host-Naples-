
import { generateSlug } from './seo';

export const generateSitemapXML = (hotels: any[], experiences: any[]) => {
  const baseUrl = 'https://www.ilhostinnaples.com';
  const areas = ['centro-storico', 'posillipo', 'vomero', 'chiaia', 'mergellina', 'pozzuoli', 'ischia', 'procida'];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Homepage
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <priority>1.0</priority>\n    <changefreq>daily</changefreq>\n  </url>\n`;

  // Area Pages
  areas.forEach(area => {
    xml += `  <url>\n    <loc>${baseUrl}/naples/${area}</loc>\n    <priority>0.7</priority>\n    <changefreq>weekly</changefreq>\n  </url>\n`;
  });

  // Property Pages
  hotels.forEach(hotel => {
    const type = generateSlug(hotel.type || 'holiday-house');
    const area = generateSlug(hotel.area || 'naples');
    const slug = generateSlug(hotel.name);
    xml += `  <url>\n    <loc>${baseUrl}/naples/${type}/${area}/${slug}-${hotel.id}</loc>\n    <priority>0.9</priority>\n    <changefreq>daily</changefreq>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </url>\n`;
  });

  // Experience Pages
  experiences.forEach(exp => {
    const category = generateSlug(exp.serviceType || 'city-tour');
    const slug = generateSlug(exp.name || exp.businessName || '');
    xml += `  <url>\n    <loc>${baseUrl}/experiences/naples/${category}/${slug}-${exp.id}</loc>\n    <priority>0.8</priority>\n    <changefreq>weekly</changefreq>\n  </url>\n`;
  });

  xml += '</urlset>';
  return xml;
};
