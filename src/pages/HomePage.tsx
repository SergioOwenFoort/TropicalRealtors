import { FeaturedProperties } from '../components/home/FeaturedProperties';
import PopularCountries from '../components/home/PopularCountries';
import { WhyChooseUs } from '../components/home/WhyChooseUs';

export function HomePage() {
  return (
    <main>
      <PopularCountries />
      <FeaturedProperties />
      <WhyChooseUs />
    </main>
  );
}
