import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

async function generateSitemap() {
  const urls: SitemapURL[] = [];
  const today = formatDate(new Date());
  const baseUrl = 'https://tropicalrealtors.com';

  // Static pages
  const staticPages = [
    { loc: '/', priority: 1.0, changefreq: 'daily' as const },
    { loc: '/woningen', priority: 0.9, changefreq: 'daily' as const },
    { loc: '/vakantie', priority: 0.9, changefreq: 'daily' as const },
    { loc: '/over-ons', priority: 0.7, changefreq: 'monthly' as const },
    { loc: '/contact', priority: 0.8, changefreq: 'monthly' as const },
    { loc: '/eilanden', priority: 0.8, changefreq: 'weekly' as const },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.loc}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  // Island pages
  const islands = ['aruba', 'curacao', 'bonaire', 'sint-maarten', 'saba', 'sint-eustatius'];
  islands.forEach(island => {
    urls.push({
      loc: `${baseUrl}/eiland/${island}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8,
    });
  });

  // Property types
  const propertyTypes = [
    'appartement', 'villa', 'huis', 'penthouse', 'studio',
    'duplex', 'bungalow', 'landhuis'
  ];
  propertyTypes.forEach(type => {
    urls.push({
      loc: `${baseUrl}/woningen?type=${type}`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.7,
    });
  });

  // Transaction types
  const transactionTypes = ['koop', 'huur', 'huur-koop'];
  transactionTypes.forEach(type => {
    urls.push({
      loc: `${baseUrl}/woningen?transactie=${type}`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.7,
    });
  });

  try {
    // Fetch all properties
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, updated_at, status')
      .eq('status', 'available')
      .order('updated_at', { ascending: false });

    if (propError) {
      console.error('Error fetching properties:', propError);
    } else if (properties) {
      properties.forEach((property) => {
        urls.push({
          loc: `${baseUrl}/woning/${property.id}`,
          lastmod: property.updated_at ? formatDate(new Date(property.updated_at)) : today,
          changefreq: 'weekly',
          priority: 0.8,
        });
      });
      console.log(`Added ${properties.length} properties to sitemap`);
    }

    // Fetch vacation rentals
    const { data: vacations, error: vacError } = await supabase
      .from('vacation_rentals')
      .select('id, updated_at, available')
      .eq('available', true)
      .order('updated_at', { ascending: false });

    if (vacError) {
      console.error('Error fetching vacation rentals:', vacError);
    } else if (vacations) {
      vacations.forEach((vacation) => {
        urls.push({
          loc: `${baseUrl}/vakantie/${vacation.id}`,
          lastmod: vacation.updated_at ? formatDate(new Date(vacation.updated_at)) : today,
          changefreq: 'weekly',
          priority: 0.8,
        });
      });
      console.log(`Added ${vacations.length} vacation rentals to sitemap`);
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    if (url.changefreq) {
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    if (url.priority !== undefined) {
      xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
    }
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  // Write to file
  const outputPath = './public/sitemap.xml';
  fs.writeFileSync(outputPath, xml, 'utf-8');
  console.log(`✅ Sitemap generated successfully with ${urls.length} URLs`);
  console.log(`📄 Saved to: ${outputPath}`);
  console.log(`🌐 Submit to: https://search.google.com/search-console`);
}

// Run the generator
generateSitemap().catch(console.error);
