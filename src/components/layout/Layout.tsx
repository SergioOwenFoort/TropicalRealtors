import { Outlet } from 'react-router-dom';
import { MenuBonaire } from './menuBonaire';
import { MenuAruba } from './menuAruba';
import { MenuCuracao } from './menuCuracao';
import { MenuSaba } from './menuSaba';
import { MenuSintMaarten } from './menuSintMaarten';
import { MenuSintEustatius } from './menuSintEustatius';
import { Toaster } from 'react-hot-toast';
import { PropertyProvider } from '../../contexts/PropertyContext';
import { useIsland } from '../../contexts/MasterIslandContext';
import { LocationDetectionBanner } from './LocationDetectionBanner';
import { LocationDetectionIndicator } from './LocationDetectionIndicator';
import { HeroCarousel } from '../ui/HeroCarousel';
import { SearchBar } from '../ui/SearchBar';

export function Layout() {
  const { selectedIsland } = useIsland();
  
  // Render the appropriate menu based on the selected island
  const renderMenu = () => {
    switch (selectedIsland) {
      case 'aruba':
        return <MenuAruba />;
      case 'curacao':
        return <MenuCuracao />;
      case 'saba':
        return <MenuSaba />;
      case 'sint-maarten':
        return <MenuSintMaarten />;
      case 'sint-eustatius':
        return <MenuSintEustatius />;
      case 'bonaire':
      default:
        return <MenuBonaire />;
    }
  };
  
  return (
    <PropertyProvider>
      <div className="min-h-screen bg-gray-50">
        {renderMenu()}
        <LocationDetectionBanner />
        <LocationDetectionIndicator />
        <HeroCarousel />
        {/* SearchBar below the carousel, visible on every page */}
        <div className="py-6 flex justify-center bg-white border-b border-gray-100">
          <SearchBar />
        </div>
        <Outlet />
        <Toaster position="top-right" />
      </div>
    </PropertyProvider>
  );
}
