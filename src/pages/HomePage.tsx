import { FeaturedProperties } from '../components/home/FeaturedProperties';
import PopularCountries from '../components/home/PopularCountries';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { SEO } from '../components/seo/SEO';
import { organizationSchema } from '../utils/schemaMarkup';

export function HomePage() {
  return (
    <main>
      <SEO
        title="Tropical Realtors - Caribbean Real Estate & Vacation Rentals"
        description="Find your dream property in the Caribbean. Luxury homes, beachfront villas, and vacation rentals across Aruba, Curaçao, Bonaire, Sint Maarten, Saba, and Sint Eustatius."
        keywords="Caribbean real estate, Aruba property, Curaçao homes, Bonaire villas, Sint Maarten real estate, Caribbean vacation rentals, tropical property, beachfront homes, luxury Caribbean villas"
        url="https://tropicalrealtors.com"
        type="website"
        schemaMarkup={organizationSchema}
      />
      <PopularCountries />
      <FeaturedProperties />
      <WhyChooseUs />
    </main>
  );
}
