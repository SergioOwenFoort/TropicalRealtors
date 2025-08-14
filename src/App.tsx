import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import { MasterIslandProvider } from './contexts/MasterIslandContext';

export default function App() {
  return (
    <AuthProvider>
      <MasterIslandProvider>
        <PropertyProvider>
          <div className="min-h-screen bg-gray-100">
            <Outlet />
            <Toaster position="top-right" />
          </div>
        </PropertyProvider>
      </MasterIslandProvider>
    </AuthProvider>
  );
}
