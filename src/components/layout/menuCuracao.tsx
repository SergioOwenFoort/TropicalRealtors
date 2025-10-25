import { useState, useRef } from 'react';
import { Menu as MenuIcon, X, ChevronDown, LayoutDashboard, Building2, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthMenu } from '../auth/AuthMenu';
import { CountryMenu } from './CountryMenu';
import { IslandSelector } from './IslandSelector';
import { IslandMenu } from './IslandMenu';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { Logo } from '../ui/Logo';

export function MenuCuracao() {
  const { user } = useAuth();
  const { isAdmin, isRealtor, isHoro } = useUserRole();
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [isMobileCountryMenuOpen, setIsMobileCountryMenuOpen] = useState(false);
  const [isMobileIslandMenuOpen, setIsMobileIslandMenuOpen] = useState(false);
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);
  
  // Timeout refs for delayed menu closing
  const countryMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const infoMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const closeAllMenus = () => {
    setIsAuthMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsCountryMenuOpen(false);
    setIsMobileCountryMenuOpen(false);
    setIsMobileIslandMenuOpen(false);
    setIsInfoDropdownOpen(false);
    
    // Clear any pending timeouts
    if (countryMenuTimeoutRef.current) {
      clearTimeout(countryMenuTimeoutRef.current);
      countryMenuTimeoutRef.current = null;
    }
    if (infoMenuTimeoutRef.current) {
      clearTimeout(infoMenuTimeoutRef.current);
      infoMenuTimeoutRef.current = null;
    }
  };

  // Handlers for delayed menu closing
  const handleCountryMenuEnter = () => {
    if (countryMenuTimeoutRef.current) {
      clearTimeout(countryMenuTimeoutRef.current);
      countryMenuTimeoutRef.current = null;
    }
    setIsCountryMenuOpen(true);
  };

  const handleCountryMenuLeave = () => {
    countryMenuTimeoutRef.current = setTimeout(() => {
      setIsCountryMenuOpen(false);
    }, 300); // 300ms delay
  };

  const handleInfoMenuEnter = () => {
    if (infoMenuTimeoutRef.current) {
      clearTimeout(infoMenuTimeoutRef.current);
      infoMenuTimeoutRef.current = null;
    }
    setIsInfoDropdownOpen(true);
  };

  const handleInfoMenuLeave = () => {
    infoMenuTimeoutRef.current = setTimeout(() => {
      setIsInfoDropdownOpen(false);
    }, 300); // 300ms delay
  };

  return (
    <>
      <header className="bg-white shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3" onClick={closeAllMenus}>
              <Logo className="block" />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {/* Island Selector */}
              <IslandSelector />

              {/* Locations Menu */}
              <div 
                className="relative"
                onMouseEnter={handleCountryMenuEnter}
                onMouseLeave={handleCountryMenuLeave}
              >
                <button
                  onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-2"
                >
                  <span>Locaties</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isCountryMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCountryMenuOpen && (
                  <div 
                    className="absolute top-full left-0 pt-2"
                    onMouseEnter={handleCountryMenuEnter}
                    onMouseLeave={handleCountryMenuLeave}
                  >
                    <CountryMenu onSelect={() => setIsCountryMenuOpen(false)} />
                  </div>
                )}
              </div>

              <Link to="/zoeken" className="text-gray-600 hover:text-blue-600">
                Alle woningen
              </Link>

              <Link to="/vakantie" className="text-gray-600 hover:text-blue-600">
                Vakantie
              </Link>

              <Link to="/makelaars" className="text-gray-600 hover:text-blue-600">
                Makelaars
              </Link>

              <div className="relative" onMouseEnter={handleInfoMenuEnter} onMouseLeave={handleInfoMenuLeave}>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-2">
                  <span>Informatie</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isInfoDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isInfoDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 bg-white rounded-lg shadow-md py-2 min-w-[150px] z-10"
                    onMouseEnter={handleInfoMenuEnter}
                    onMouseLeave={handleInfoMenuLeave}
                  >
                    <Link to="/over-ons" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 whitespace-nowrap" onClick={closeAllMenus}>Over ons</Link>
                    <Link to="/faq" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 whitespace-nowrap" onClick={closeAllMenus}>FAQ</Link>
                    <Link to="/contact" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 whitespace-nowrap" onClick={closeAllMenus}>Contact</Link>
                  </div>
                )}
              </div>

              {user && (
                <>
                  {!isRealtor && !isHoro && (
                    <Link to="/account" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {isRealtor && (
                    <Link to="/makelaar" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {isHoro && (
                    <Link to="/horo" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      <span>HoRe Dashboard</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      <span>Admin</span>
                    </Link>
                  )}
                </>
              )}

              {/* Add the authentication menu button for desktop view */}
              <button
                onClick={() => setIsAuthMenuOpen(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-2"
              >
                <User className="w-5 h-5" />
                <span className="max-w-[150px] truncate" title={user ? user.email : ''}>
                  {user ? user.email : 'Inloggen'}
                </span>
              </button>
            </nav>

            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={() => setIsAuthMenuOpen(true)}
                className="text-gray-600 hover:text-blue-600"
              >
                <User className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-blue-600"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-1">
              {/* Mobile Island Selector */}
              <button
                onClick={() => setIsMobileIslandMenuOpen(!isMobileIslandMenuOpen)}
                className="w-full text-left py-2 text-gray-600"
              >
                Eilanden
              </button>
              {isMobileIslandMenuOpen && (
                <div className="pl-4">
                  <IslandMenu 
                    mobile 
                    onSelect={() => {
                      setIsMobileIslandMenuOpen(false);
                      setIsMobileMenuOpen(false);
                    }} 
                  />
                </div>
              )}
              {/* Mobile Locations Menu */}
              <button
                onClick={() => setIsMobileCountryMenuOpen(!isMobileCountryMenuOpen)}
                className="w-full text-left py-2 text-gray-600"
              >
                Locaties
              </button>
              {isMobileCountryMenuOpen && (
                <div className="pl-4">
                  <CountryMenu 
                    mobile 
                    onSelect={() => {
                      setIsMobileCountryMenuOpen(false);
                      setIsMobileMenuOpen(false);
                    }} 
                  />
                </div>
              )}
              <Link
                to="/zoeken"
                className="block py-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Alle woningen
              </Link>
              <Link
                to="/vakantie"
                className="block py-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Vakantie
              </Link>
              <Link
                to="/makelaars"
                className="block py-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Makelaars
              </Link>
              <Link
                to="/over-ons"
                className="block py-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Over ons
              </Link>
              <Link
                to="/faq"
                className="block py-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                to="/contact"
                className="block py-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {user && (
                <>
                  {!isRealtor && !isHoro && (
                    <Link
                      to="/account"
                      className="flex items-center gap-2 py-2 text-gray-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {isRealtor && (
                    <Link
                      to="/makelaar"
                      className="flex items-center gap-2 py-2 text-gray-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Building2 className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {isHoro && (
                    <Link
                      to="/horo"
                      className="flex items-center gap-2 py-2 text-gray-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Building2 className="w-5 h-5" />
                      <span>HoRe Dashboard</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 py-2 text-gray-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Admin</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthMenu isOpen={isAuthMenuOpen} onClose={() => setIsAuthMenuOpen(false)} />
    </>
  );
}
