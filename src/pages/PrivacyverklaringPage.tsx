import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

export function PrivacyverklaringPage() {
  return (
    <>
      <Helmet>
        <title>Privacyverklaring | TropicalRealtors.com – Veilig & AVG-proof reizen en boeken</title>
        <meta
          name="description"
          content="Ontdek hoe TropicalRealtors.com jouw privacy beschermt. Geen cookies, geen tracking, alleen veilige en transparante gegevensverwerking volgens de AVG."
        />
        <meta
          name="keywords"
          content="privacyverklaring TropicalRealtors.com, privacybeleid vakantieplatform, bescherming persoonsgegevens reiswebsite, privacybeleid hotels en resorts, AVG privacybeleid TropicalRealtors, geen cookies website, anonieme data analyse, IP-adres anonimiseren, persoonlijke gegevens bescherming, delen van gegevens met derden, browsercache wissen, veilige online reservering, gebruikersgegevens bescherming, privacy voor reizigers, gegevensverwerking hotels en makelaars, hoe gaat TropicalRealtors om met mijn persoonlijke gegevens, wordt mijn IP-adres opgeslagen bij TropicalRealtors, gebruikt TropicalRealtors cookies of trackers, kan ik mijn browsercache wissen voor TropicalRealtors, deelt TropicalRealtors mijn informatie met derden, hoe beschermt TropicalRealtors mijn privacy bij reserveringen, Nederland, Suriname, Caraïben, Caribisch gebied, Aruba, Curaçao, Bonaire, Europa, tropische vakantiebestemmingen"
        />
        <link rel="canonical" href="https://tropicalrealtors.com/privacyverklaring" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Privacyverklaring TropicalRealtors.com',
            description: 'Privacy policy van TropicalRealtors.com - Geen cookies, veilige gegevensverwerking volgens AVG',
            url: 'https://tropicalrealtors.com/privacyverklaring',
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header with Logo */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link to="/" className="inline-block">
              <Logo className="h-12" />
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacyverklaring — TropicalRealtors.com
            </h1>

            <p className="text-lg text-gray-700 leading-relaxed mb-10">
              Bij TropicalRealtors.com hechten we veel waarde aan de bescherming van jouw privacy. In deze privacyverklaring leggen we uit hoe we omgaan met de informatie die we van je verzamelen en hoe we zorgen dat deze zorgvuldig en veilig wordt behandeld.
            </p>

            {/* Geen cookies */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Geen cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We zijn blij je te kunnen meedelen dat TropicalRealtors.com geen gebruik maakt van cookies op onze website.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Dit betekent dat we geen kleine tekstbestanden op je apparaat plaatsen om informatie te verzamelen over je surfgedrag of om je voorkeuren te onthouden.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Je kunt onze website dus volledig gebruiken zonder dat er trackingcookies of advertentiecookies worden geplaatst.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Gebruik van IP-adres en anonieme gegevens */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Gebruik van IP-adres en anonieme gegevens</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We verzamelen anonieme gegevens zoals het aantal bezoekers per dag, de meest bezochte pagina's en de gemiddelde tijd die bezoekers op de website doorbrengen.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Deze gegevens worden via interne analyse verwerkt en uitsluitend gebruikt om onze website te verbeteren en onze dienstverlening te optimaliseren.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Om jouw privacy extra te beschermen, worden IP-adressen geanonimiseerd voordat ze worden opgeslagen, zodat deze niet te herleiden zijn tot individuele personen.
              </p>
              <p className="text-gray-700 leading-relaxed">
                De verzamelde informatie is dus volledig anoniem en kan niet aan jou als individu worden gekoppeld.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Persoonlijke gegevens en derde partijen */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Persoonlijke gegevens en derde partijen</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Wanneer je je registreert op onze website of contact met ons opneemt via een formulier, vragen we je om bepaalde persoonlijke gegevens in te vullen.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Deze gegevens zijn nodig om je account aan te maken en je toegang te geven tot onze diensten.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We garanderen dat de persoonlijke gegevens die je tijdens registratie of contactaanvraag invult, niet met derden worden gedeeld zonder jouw nadrukkelijke toestemming.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Jouw privacy is onze prioriteit. Wij zullen altijd je uitdrukkelijke goedkeuring vragen voordat we enige informatie delen, bijvoorbeeld wanneer je in contact wilt komen met een makelaar of verhuurder via ons platform.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Wettelijke verplichtingen */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Wettelijke verplichtingen</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We delen jouw persoonlijke gegevens alleen met overheids- of gerechtelijke instanties wanneer wij daartoe wettelijk verplicht zijn.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Dit kan bijvoorbeeld het geval zijn wanneer een rechter ons hiertoe dwingt door middel van een gerechtelijk bevel.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Gebruik van browsercache */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Gebruik van browsercache</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Om de laadsnelheid van onze website te optimaliseren en je een soepele gebruikservaring te bieden, maken we gebruik van de cache van je webbrowser.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Dit betekent dat bepaalde elementen van onze website, zoals afbeeldingen en scripts, tijdelijk op je apparaat worden opgeslagen.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Deze gegevens zijn niet persoonlijk identificeerbaar en worden uitsluitend gebruikt voor prestatieverbetering.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Je kunt de browsercache zelf wissen via de instellingen van je internetbrowser als je deze gegevens wilt verwijderen of opnieuw laten laden.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Contact */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Heb je nog vragen over deze privacyverklaring of over de manier waarop wij met jouw gegevens omgaan?
              </p>
              <p className="text-gray-700 leading-relaxed">
                Neem dan gerust contact met ons op via het{' '}
                <Link to="/contact" className="text-blue-600 hover:text-blue-700 underline">
                  contactformulier
                </Link>{' '}
                op onze website.
              </p>
            </section>

            {/* Back to Home */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                to="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Terug naar home
              </Link>
            </div>
          </div>
        </article>

        {/* Footer note */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <p className="text-center text-sm text-gray-500">
            TropicalRealtors.com – Actief in Nederland, Suriname en het Caribisch gebied
          </p>
        </div>
      </div>
    </>
  );
}
