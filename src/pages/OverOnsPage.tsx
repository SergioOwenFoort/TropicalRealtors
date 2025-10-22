import { SEO } from '../components/seo/SEO';
import { organizationSchema } from '../utils/schemaMarkup';
import { Logo } from '../components/ui/Logo';

export function OverOnsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <SEO
        title="Over Ons - Uw droomhuis op de Caribische eilanden | TropicalRealtors.com"
        description="Op zoek naar een huis, huurwoning of vakantieverblijf in de Caribbean? TropicalRealtors.com is uw centrale platform voor al het vastgoed op de Caribische eilanden. Vind vandaag nog uw droomplek!"
        keywords="vastgoed Caribische eilanden, huis kopen Caribische eilanden, huis huren Cariben, wonen op de Caribische eilanden, TropicalRealtors.com, makelaar Caribisch gebied, vakantiewoning huren Caribbean, lange termijn huur Caribische eilanden, appartement te koop Cariben, vastgoedbeheer Caribische eilanden, hotelkamer boeken Caribbean, resort accommodatie Cariben, investeren in vastgoed Cariben, beste makelaar Caribbean, overzicht vastgoedaanbod Caribische eilanden, platform huiseigenaren Caribbean"
        url="https://tropicalrealtors.com/over-ons"
        schemaMarkup={organizationSchema}
      />

      <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
        {/* Logo at top right */}
        <div className="flex justify-end mb-8">
          <Logo className="h-16 md:h-20" />
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Uw droomhuis op de Caribische eilanden
        </h1>

        {/* Introduction */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            Welkom bij TropicalRealtors.com, dé centrale online marktplaats voor de huizenmarkt op de prachtige Caribische eilanden. Als een jonge en dynamische onderneming stroomlijnen wij uw zoektocht naar een woning en het aanbod van accommodaties in het Caribisch gebied. Of u nu een huis wilt kopen, huren voor de lange termijn of een onvergetelijke vakantie wilt plannen, bij ons vindt u eenvoudiger dan ooit het perfecte verblijf.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Eén platform voor al het vastgoed in het Caribisch gebied
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Wij zagen de uitdagingen voor zowel vastgoedeigenaren als voor kopers, huurders en vakantiegangers. Daarom hebben wij een krachtige en innovatieve oplossing ontwikkeld: een platform waar de verkoop en verhuur van woningen, hotelkamers en resortaccommodaties in de Caribbean samenkomen. U hoeft niet langer talloze websites te bezoeken; bij ons vindt u alles overzichtelijk op één plek, met alle relevante informatie direct beschikbaar.
          </p>
        </div>

        {/* Section 2 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Voor zoekers en vastgoedprofessionals op de eilanden
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Voor wie een woning zoekt:
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Bent u op zoek naar uw droomplek onder de zon? Wij maken het makkelijk om uw ideale huis, appartement of vakantiewoning op de Caribische eilanden te vinden. Bespaar tijd en moeite in uw zoektocht.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Voor vastgoedprofessionals:
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Wij bieden makelaars, vastgoedbeheerders en hoteleigenaren in het Caribisch gebied een krachtig platform om hun aanbod effectief te presenteren aan een breed en geïnteresseerd publiek. Door de krachten van alle aanbieders te bundelen, versterken we het gezamenlijke netwerk en tillen we de huizenmarkt op de eilanden naar een hoger niveau.
              </p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-blue-50 rounded-lg p-8 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Onze missie
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Onze passie voor de Caribische eilanden drijft ons om iedereen te helpen hun droomplek te vinden, in samenwerking met de beste professionals uit de vastgoedsector.
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <a
            href="/zoeken"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Ontdek ons aanbod
          </a>
        </div>
      </div>
    </main>
  );
}
