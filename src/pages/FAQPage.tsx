import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'account' | 'particulier' | 'zakelijk' | 'algemeen';
}

const faqData: FAQItem[] = [
  {
    category: 'account',
    question: 'Waarom zou ik een account aanmaken als de informatie ook zonder account beschikbaar is?',
    answer: 'Het aanmaken van een account is gratis en is als het hebben van je eigen persoonlijke reis assistent. Zonder een account kun je rondkijken, maar een account stelt je in staat om je favoriete woningen, hotels en resorts op te slaan. Dit maakt het plannen van een reis, of het kopen/huren van een huis makkelijker en persoonlijker. Je kunt een lijst maken van de locaties die je het meest interessant vindt, zodat je later gemakkelijker kunt vergelijken en de volgende stap kunt zetten. Zoals het leggen van contact met een makelaar, hotel, resort of huiseigenaar via bijvoorbeeld de ingebouwde chat in je account.'
  },
  {
    category: 'account',
    question: 'Is het aanmaken van een account echt gratis?',
    answer: 'Ja, het aanmaken van een account is volledig gratis. Er zijn geen verborgen kosten en er is geen verplichting om iets te kopen of te huren. We willen je alleen de tools geven die je nodig hebt om je droomhuis te vinden of de perfecte vakantie te plannen.'
  },
  {
    category: 'account',
    question: 'Wat gebeurt er met mijn persoonlijke gegevens nadat ik een account heb aangemaakt?',
    answer: 'We hechten veel waarde aan je privacy. De enige gegevens die wij verzamelen zijn de gegevens die je zelf invult tijdens het maken van een account, zoals je emailadres. Deze gegevens worden beveiligd opgeslagen en nooit gedeeld met derden zonder jouw toestemming.'
  },
  {
    category: 'account',
    question: 'Welke voordelen heb ik als ik een account aanmaak in vergelijking met het gebruiken van andere websites?',
    answer: 'Onze website richt zich specifiek op de zes unieke eilanden: Aruba, Bonaire, Curaçao, Saba, Sint-Eustatius en Sint-Maarten. Door een account aan te maken krijg je toegang tot gecentraliseerde en overzichtelijke omgeving waar alle opties van deze eilanden samenkomen. Hierdoor hoef je niet langer verschillende websites te bezoeken om woningen, makelaars of vakantieaccommodaties te vinden. Alles wat je nodig hebt is hier te vinden en te beheren. Plus het is makkelijk bij het plannen van een vakantie waarbij je gaat eilandhoppen.'
  },
  {
    category: 'account',
    question: 'Kan ik mijn account later weer verwijderen als ik dat wil?',
    answer: 'Dat kan zeker. Als je besluit dat je het account niet langer wilt gebruiken, kun je dat op elk gewenst zelf verwijderen. We maken het je gemakkelijk door je de volledige controle over jouw account te geven.'
  },
  {
    category: 'particulier',
    question: 'Is het uploaden van huizen gratis voor particulieren?',
    answer: 'Ja, het uploaden van huizen voor particulieren is gratis. U kunt het dan alleen voor de verhuur uploaden. Wij vragen dan per verhuurde periode een commissie van 12,5%. Dit wordt bij de verhuurder in rekening gebracht en niet bij de huurder.'
  },
  {
    category: 'particulier',
    question: 'Welke voordelen biedt het adverteren van mijn huis op de homepage of in de carrousel?',
    answer: 'Het adverteren van je huis op de homepage of in de carrousel vergroot de zichtbaarheid van je woning of andere advertentie aanzienlijk. Door te adverteren op de homepage met je huis plaats je jouw huis voor een week direct in de schijnwerpers. Terwijl een advertentie in de carrousel jouw zichtbaarheid nog meer vergroot. Dit komt omdat de advertentie op bijna elke pagina te zien is en dat voor een periode van 4 weken. Bovendien kun je ook de statistieken van je advertentie in de carrousel inzien in je persoonlijke dashboard. Ook kun je een link plaatsen bij je advertentie, zodat de bezoeker wordt omgeleid naar uw website.'
  },
  {
    category: 'particulier',
    question: 'Hoe kan ik bijhouden hoe mijn woning presteert?',
    answer: 'Nadat je je woning hebt geplaatst en eventueel een advertentie hebt geboekt, krijg je toegang tot een persoonlijk dashboard. Hier kun je real-time statistieken bekijken. Je ziet onder meer het aantal keer dat je woning is bekeken en hoe vaak deze is toegevoegd aan favorieten. Dit inzicht helpt je om de interesse in je woning te meten en indien nodig je strategie aan te passen.'
  },
  {
    category: 'particulier',
    question: 'Hoe snel wordt mijn woning geplaatst en hoelang blijft het online staan?',
    answer: 'Nadat je hebt betaald staat is je woning gelijk online bij ons. Er is geen tijdslimiet voor hoe lang een woning online blijft staan. Je kunt zelf bij de woning aangeven of het verhuurd is en je kunt je woning zelf weer verwijderen.'
  },
  {
    category: 'particulier',
    question: 'Zijn er extra kosten verbonden aan het plaatsen of adverteren van mijn huis?',
    answer: 'De kosten voor het plaatsen van je woning voor particulieren zijn er niet. Dit komt omdat wij op basis van commissie werken. Echter geldt er voor particulieren dat zij alleen hun huizen kunnen verhuren en niet verkopen. Dit laatste gebeurd door een makelaar die u bij ons kunt vinden. De advertentiekosten worden apart in rekening gebracht. De duur van een homepage advertentie is een week en voor een carrousel-advertentie is vier weken.'
  },
  {
    category: 'zakelijk',
    question: 'Wat zijn de voordelen van een account voor makelaars, hotels en resorts?',
    answer: 'Als makelaar, hotel of resort op ons platform verkrijg je dan een account waarmee jij je aanbod op een professionele manier kunt aanbieden aan de bezoekers. Ook kun je de statistieken inzien van jouw aanbod. Als u een zakelijk account heeft kunt u maximaal drie profielen aanmaken voor uw bedrijf. Voor hotels en resorts is er ook de mogelijkheid om aanbiedingen kenbaar te maken. Dit kan omdat je elke listing apart kunt bewerken en zo samen met de statistieken een mooie aanbieding kunt geven.'
  },
  {
    category: 'zakelijk',
    question: 'Hoe kan ik een makelaars-, hotel- of resortaccount aanvragen?',
    answer: 'Om een van deze accounts te krijgen, dien je contact met ons op te nemen via het contactformulier. U kunt er dan voor kiezen om tegen betaling al uw huizen en/of accommodaties te laten uploaden door. Of dat u ervoor kiest om het zelf te uploaden naar onze website.'
  },
  {
    category: 'zakelijk',
    question: 'Hoe zit het met de contractduur en opzeggen?',
    answer: 'We begrijpen dat flexibiliteit belangrijk is. Daarom bieden we een proefperiode van zes maanden aan. Dit geeft je de kans om de effectiviteit van ons platform te ervaren zonder langdurige verplichtingen. Als je na de proefperiode tevreden bent met de resultaten, wordt je contract omgezet in een jaarcontract, wat zorgt voor continuïteit en stabiliteit. U kunt vanaf het moment dat het jaarcontract ingaat uw contract laten ontbinden met een opzegtermijn van 30 dagen.'
  },
  {
    category: 'algemeen',
    question: 'Zijn de woningen en advertenties eiland-specifiek?',
    answer: 'Ja, de woningen en advertenties zijn specifiek gericht per eiland. Dit betekent dat een woning of advertentie van een makelaar op Aruba alleen zichtbaar is voor gebruikers die op zoek zijn naar woningen op Aruba. Dit zorgt ervoor dat je je kunt richten op de juiste doelgroep en je advertentiebudget optimaal wordt ingezet, wat leidt tot een hogere kans op conversie en succesvolle contactaanvragen.'
  }
];

const categories = {
  account: { label: 'Account & Privacy', color: 'bg-blue-100 text-blue-800' },
  particulier: { label: 'Particulieren', color: 'bg-green-100 text-green-800' },
  zakelijk: { label: 'Zakelijk', color: 'bg-purple-100 text-purple-800' },
  algemeen: { label: 'Algemeen', color: 'bg-gray-100 text-gray-800' }
};

export function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      <Helmet>
        <title>Veel gestelde vragen | Huizen, Hotels & Resorts op de Eilanden</title>
        <meta 
          name="description" 
          content="Ontdek hoe je gratis een account aanmaakt, huizen verhuurt of advertenties plaatst op Aruba, Bonaire, Curaçao, Saba, Sint-Eustatius en Sint-Maarten." 
        />
        <meta name="keywords" content="account aanmaken vakantieplatform, gratis account woningverhuur, huizen verhuren Aruba, vakantiehuizen Caribisch Nederland, woningen Aruba Bonaire Curaçao, makelaars ABC-eilanden, hotel resort account, woning plaatsen dashboard, adverteren homepage, carrousel advertentie, woningstatistieken, commissie verhuur, eilandhoppen Caribisch gebied" />
        <link rel="canonical" href="https://tropicalrealtors.com/faq" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Veel gestelde vragen
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vind antwoorden op de meest gestelde vragen over ons platform, accounts, verhuur en meer.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Zoek in veelgestelde vragen..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Alle vragen ({faqData.length})
              </button>
              {Object.entries(categories).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? color
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {label} ({faqData.filter(f => f.category === key).length})
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Geen vragen gevonden voor "{searchTerm}". Probeer een andere zoekterm.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="w-full px-6 py-4 text-left flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${categories[faq.category].color}`}>
                            {categories[faq.category].label}
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h2>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {expandedIndex === index ? (
                          <ChevronUp className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {expandedIndex === index && (
                      <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-center text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-4">
              Heeft u nog vragen?
            </h2>
            <p className="text-blue-50 mb-6 max-w-2xl mx-auto">
              Staat uw vraag er niet bij? Neem gerust contact met ons op. Ons team staat klaar om u te helpen!
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Neem contact op
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
