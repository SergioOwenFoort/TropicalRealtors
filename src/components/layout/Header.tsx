import { useState } from 'react';
import { Menu as MenuIcon, X, ChevronDown, LayoutDashboard, Building2, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthMenu } from '../auth/AuthMenu';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { SearchBar } from '../ui/SearchBar';
import { Logo } from '../ui/Logo';

export function Header() {
  const { user } = useAuth();
  const { isAdmin, isRealtor } = useUserRole();
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);

  const closeAllMenus = () => {
    setIsAuthMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsInfoDropdownOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-8">

            <Link to="/" className="flex items-center gap-3" onClick={closeAllMenus}>
              <Logo className="w-8 h-8" />
              <div>
                <span className="text-xl font-bold text-gray-900">TropicalRealtors</span>
                <span className="text-xl font-bold text-blue-600">.com</span>
              </div>
            </Link>

            {/* SearchBar visible on every page */}
            <div className="flex-1 px-8 max-w-2xl">
              <SearchBar />
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {/* Islands label for desktop */}
              <div className="flex items-center gap-2 text-gray-600 py-2">
                <span>Eilanden</span>
              </div>

              {/* Locaties menu: single row of clickable location links, no dropdown, no duplicate static menu */}
              <div className="flex items-center gap-2 text-gray-600 py-2">
                <span>Locaties:</span>
                <Link to="/locaties/kralendijk" className="ml-2 hover:text-blue-600">Kralendijk</Link>
                <Link to="/locaties/rincon" className="ml-2 hover:text-blue-600">Rincon</Link>
                <Link to="/locaties/sabadeco" className="ml-2 hover:text-blue-600">Sabadeco</Link>
                <Link to="/locaties/belnem" className="ml-2 hover:text-blue-600">Belnem</Link>
                <Link to="/locaties/nikiboko" className="ml-2 hover:text-blue-600">Nikiboko</Link>
              </div>

              <Link to="/makelaars" className="text-gray-600 hover:text-blue-600">
                Makelaars
              </Link>

              <div className="relative" onMouseEnter={() => setIsInfoDropdownOpen(true)} onMouseLeave={() => setIsInfoDropdownOpen(false)}>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-2">
                  <span>Informatie</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isInfoDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isInfoDropdownOpen && (
                  <div className="absolute top-full left-0 bg-white rounded-lg shadow-md py-2 min-w-[150px] z-10">
                    <Link to="/over-ons" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 whitespace-nowrap" onClick={closeAllMenus}>Over ons</Link>
                    <Link to="/faq" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 whitespace-nowrap" onClick={closeAllMenus}>FAQ</Link>
                    <Link to="/contact" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 whitespace-nowrap" onClick={closeAllMenus}>Contact</Link>
                  </div>
                )}
              </div>

              <Link to="/zoeken" className="text-gray-600 hover:text-blue-600">
                Alle woningen
              </Link>
              {user && (
                <>
                  {!isRealtor && (
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
          {/* Islands label for mobile */}
          <div className="w-full text-left py-2 text-gray-600">
            <span>Eilanden</span>
          </div>

          {/* Locaties menu with clickable location links for mobile */}
          <div className="w-full text-left py-2 text-gray-600 flex flex-wrap items-center">
            <span>Locaties:</span>
            <Link to="/locaties/kralendijk" className="ml-2 hover:text-blue-600 block">Kralendijk</Link>
            <Link to="/locaties/rincon" className="ml-2 hover:text-blue-600 block">Rincon</Link>
            <Link to="/locaties/sabadeco" className="ml-2 hover:text-blue-600 block">Sabadeco</Link>
            <Link to="/locaties/belnem" className="ml-2 hover:text-blue-600 block">Belnem</Link>
            <Link to="/locaties/nikiboko" className="ml-2 hover:text-blue-600 block">Nikiboko</Link>
          </div>
              <Link
                to="/zoeken"
                className="block py-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Alle woningen
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
                  {!isRealtor && (
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
