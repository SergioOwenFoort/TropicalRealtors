import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { GoogleTranslate } from '../ui/GoogleTranslate';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <Logo className="h-12" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Uw vertrouwde partner voor vastgoed op Aruba, Bonaire, Curaçao, Saba, Sint-Eustatius en Sint-Maarten.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Snelle Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/zoeken" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Alle Woningen
                </Link>
              </li>
              <li>
                <Link to="/vakantie" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Vakantie
                </Link>
              </li>
              <li>
                <Link to="/makelaars" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Makelaars
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Veelgestelde Vragen
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Informatie</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/over-ons" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Over Ons
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacyverklaring" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Privacyverklaring
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  [Bedrijfsadres wordt hier ingevoegd]
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <a 
                  href="mailto:info@tropicalrealtors.com" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  info@tropicalrealtors.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  [Telefoonnummer wordt hier ingevoegd]
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                © {currentYear} Tropical Realtors. Alle rechten voorbehouden.
              </p>
              <GoogleTranslate />
            </div>
            <div className="flex gap-6">
              <Link 
                to="/privacyverklaring" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy
              </Link>
              <Link 
                to="/disclaimer" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
