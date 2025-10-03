import { FeaturedProperties } from '../components/home/FeaturedProperties';
import PopularCountries from '../components/home/PopularCountries';

export function HomePage() {
  return (
    <main>
      <PopularCountries />
      <FeaturedProperties />
    </main>
  );
}
