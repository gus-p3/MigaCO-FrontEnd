import React from 'react';
import { useLocation } from 'react-router-dom';

export default function BreadcrumbSchema({ items }) {
  const location = useLocation();
  const origin = window.location.origin;
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.path ? `${origin}${item.path}` : undefined
    }))
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}