import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

export function DisclaimerPage() {
  return (
    <>
      <Helmet>
        <title>Disclaimer - TropicalRealtors.com | Gebruiksvoorwaarden Vastgoed Platform</title>
        <meta
          name="description"
          content="Disclaimer en gebruiksvoorwaarden van TropicalRealtors.com. Informatie over aansprakelijkheid, intellectueel eigendom, privacy en het gebruik van ons vastgoedplatform voor tropische eilanden."
        />
        <meta
          name="keywords"
          content="TropicalRealtors.com, vastgoedplatform tropische eilanden, tropisch vastgoed, internationale vastgoedwebsite, betrouwbare vastgoedinformatie, hotels en resorts platform, huisverkoop via makelaars, online vastgoed advertenties, vastgoed listings, vastgoed disclaimer, gebruiksvoorwaarden website, aansprakelijkheid vastgoed, financiële afhandeling vastgoed, reserveringen en overeenkomsten, makelaarsvergoeding, privacyverklaring vastgoed, intellectueel eigendom website, technische aspecten website, externe links vastgoed, website optimalisatie, Aruba, Bonaire, Curaçao, Sint Maarten, Saba, Sint Eustatius, Caribisch vastgoed, vastgoedbeheer, woningverhuur, accommodatieplatform, real estate listings, gebruikersvoorwaarden, gegevensbescherming, advertentieplatform, digitale diensten, contentverantwoordelijkheid, juridische informatie"
        />
        <link rel="canonical" href="https://tropicalrealtors.com/disclaimer" />
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Disclaimer TropicalRealtors.com
            </h1>

            {/* Algemeen */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Algemeen</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Wij, TropicalRealtors.com, doen ons uiterste best om accurate en betrouwbare informatie te bieden op onze website. Ondanks deze zorgvuldigheid wijzen wij elke aansprakelijkheid uitdrukkelijk af met betrekking tot de nauwkeurigheid, volledigheid en betrouwbaarheid van de aangeboden listings, advertenties en makelaarsprofielen.
              </p>
              <p className="text-gray-700 leading-relaxed">
                De inhoud van deze listings en advertenties wordt aangeleverd door derden. Wij aanvaarden geen verantwoordelijkheid voor de juistheid hiervan.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Gebruik van de website */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Gebruik van de website</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                U gebruikt onze website en de aangeboden informatie, functionaliteiten en middelen volledig op eigen risico. TropicalRealtors.com aanvaardt geen aansprakelijkheid voor onjuist gebruik of interpretatie van de aangeboden informatie en tools.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                TropicalRealtors.com handelt uitsluitend het financiële gedeelte af voor hotels, resorts en huiseigenaren.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Voor makelaars geldt dat zij een maandelijkse vergoeding betalen voor het gebruik van onze diensten.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                De verkoop of verhuur van een woning vindt rechtstreeks plaats tussen de makelaar en de koper of huurder.
              </p>
              <p className="text-gray-700 leading-relaxed">
                De verdere overeenkomst, communicatie en afhandeling van reserveringen of overeenkomsten dient eveneens rechtstreeks te gebeuren tussen de gebruikers en de aanbieders.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Externe links */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Externe links</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                De listings, advertenties, makelaarsprofielen en informatieve pagina's op TropicalRealtors.com kunnen verwijzingen bevatten naar externe websites of platforms. Deze externe links vallen volledig buiten onze controle.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Wij kunnen daarom geen verantwoordelijkheid dragen voor de inhoud, functionaliteit, beveiliging of het privacybeleid van deze websites. Het bezoeken van externe sites gebeurt geheel op eigen risico.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Wij adviseren gebruikers altijd het privacybeleid en de algemene voorwaarden van deze externe websites zorgvuldig door te lezen.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Intellectueel eigendom */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectueel eigendom</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Het logo van TropicalRealtors.com, de unieke ontwerpkenmerken zoals de eilandenswitch, én alle technische aspecten van de website – waaronder de structuur, code, functionaliteiten, databaseopbouw en gebruikersinterface – zijn beschermd onder het intellectueel eigendomsrecht.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Al deze elementen zijn exclusief eigendom van TropicalRealtors.com en mogen niet worden gereproduceerd, gekopieerd, verspreid, bewerkt of op enige andere wijze worden gebruikt zonder voorafgaande schriftelijke toestemming.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Elk ongeoorloofd gebruik kan leiden tot juridische stappen.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Privacy en gegevensverzameling */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy en gegevensverzameling</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Door het gebruik van onze website stemt u in met het verzamelen van geanonimiseerde gebruiksgegevens, zoals website-statistieken en klikgedrag, zoals beschreven in onze{' '}
                <Link to="/privacyverklaring" className="text-blue-600 hover:text-blue-700 underline">
                  Privacyverklaring
                </Link>
                .
              </p>
              <p className="text-gray-700 leading-relaxed">
                Deze informatie helpt ons de gebruikservaring te verbeteren, de website te optimaliseren en onze diensten aan te passen aan de behoeften van bezoekers, zonder dat uw privacy in gevaar komt.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Wijzigingen in de disclaimer */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Wijzigingen in de disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                TropicalRealtors.com behoudt zich het recht voor om deze disclaimer te wijzigen wanneer dit nodig blijkt. Aanpassingen worden direct van kracht na publicatie op deze pagina. Wij adviseren u deze pagina regelmatig te raadplegen om op de hoogte te blijven van eventuele wijzigingen.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Geografische dekking */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Geografische dekking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TropicalRealtors.com biedt informatie en vastgoedadvertenties over tropische eilanden en regio's, waaronder bestemmingen als Aruba, Bonaire, Curaçao, Sint Maarten, Saba en Sint Eustatius.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Ons doel is om betrouwbare vastgoedinformatie te bieden voor iedereen die geïnteresseerd is in tropisch vastgoed of het kopen van woningen op eilanden wereldwijd.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* Contact */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Voor vragen over deze disclaimer, privacy of andere juridische zaken kunt u contact met ons opnemen via het{' '}
                <Link to="/contact" className="text-blue-600 hover:text-blue-700 underline">
                  contactformulier
                </Link>{' '}
                op TropicalRealtors.com/contact.
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
      </div>
    </>
  );
}
