
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getDefaultMetaTags } from '../utils/seo';
import { useSettings } from '../contexts/SettingsContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  schema?: any;
  canonical?: string;
  noindex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description, 
  image, 
  type, 
  schema, 
  canonical,
  noindex 
}) => {
  const location = useLocation();
  const { settings } = useSettings();
  const defaults = getDefaultMetaTags(location.pathname + location.search);

  const finalTitle = title ? `${title} | L Host in Naples` : defaults.title;
  const finalDescription = description || defaults.description;
  const finalImage = image || defaults.image;
  const finalType = type || defaults.type;
  const finalUrl = canonical ? `https://www.ilhostinnaples.com${canonical}` : defaults.url;
  
  // Site-wide setting overrides component-specific indexing if it's set to off, 
  // otherwise we use component-specific or default noindex strategy
  const shouldNoIndex = settings.seo.allowIndexing === false ? true : (noindex !== undefined ? noindex : defaults.noindex);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {shouldNoIndex && <meta name="robots" content="noindex, nofollow" />}
      {!shouldNoIndex && <meta name="robots" content="index, follow" />}
      
      {/* Canonical & Hreflang */}
      <link rel="canonical" href={finalUrl} />
      <link rel="alternate" hrefLang="en" href={finalUrl} />
      <link rel="alternate" hrefLang="it" href={finalUrl} />
      <link rel="alternate" hrefLang="x-default" href={finalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={finalType} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
