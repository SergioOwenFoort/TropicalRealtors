import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListFilter, User, Eye, Home, TrendingUp, BarChart3 } from 'lucide-react';
import { CsvUploader } from '../../components/realtor/CsvUploader';
import { RealtorPropertyTable } from '../../components/realtor/RealtorPropertyTable';
import { PropertyViewTracker } from '../../services/propertyViewTracker';
// ...existing code...
// import { WebhookTest } from '../../components/realtor/WebhookTest';
import { RealtorProfile } from '../../components/realtor/RealtorProfile';
import { CarouselManagement } from '../../components/admin/CarouselManagement';
import { SimpleMessagesDashboard } from '../../components/messages/SimpleMessagesDashboard';
import { useProperties } from '../../hooks/useProperties';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { Property } from '../../types';

export function RealtorDashboard() {
  const { properties, refreshProperties } = useProperties();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [statusFilter, setStatusFilter] = useState<Property['status'] | 'all'>('all');
  
  // Statistics state
  const [totalViews, setTotalViews] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Load property statistics
  useEffect(() => {
    const loadStats = async () => {
      if (user?.id) {
        try {
          setStatsLoading(true);
          const total = await PropertyViewTracker.getTotalViews({ userId: user.id });
          setTotalViews(total);
        } catch (error) {
          console.error('Error loading stats:', error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    loadStats();
  }, [user?.id]);

  // Calculate statistics
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'actief').length;
  const avgViewsPerProperty = totalProperties > 0 ? Math.round(totalViews / totalProperties) : 0;
  
  // ...existing code...

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/* Removed Afspraken button */}
      </div>

      {/* Profile Section */}
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <span className="text-lg font-medium text-gray-900">
                {profile?.display_name || user?.email?.split('@')[0] || 'Gebruiker'}
              </span>
            </div>
            <Link
              to="/profiel"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <User className="w-4 h-4" />
              Profiel bewerken
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <RealtorProfile />
        
        <SimpleMessagesDashboard 
          title="Makelaar Berichten" 
          className="mb-8" 
        />
        
        <CsvUploader />
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mijn woningen</h2>
              <div className="flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Property['status'] | 'all')}
                  className="border-0 bg-transparent text-gray-600 focus:ring-0"
                >
                  <option value="all">Alle statussen</option>
                  <option value="actief">Actief</option>
                  <option value="concept">Concept</option>
                  <option value="verkocht">Verkocht</option>
                  <option value="verhuurd">Verhuurd</option>
                  <option value="ingetrokken">Ingetrokken</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Statistics Cards */}
          <div className="p-6 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Totaal Weergaven</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {statsLoading ? '...' : totalViews.toLocaleString()}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Totaal Properties</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">{totalProperties}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Actieve Properties</span>
                </div>
                <p className="text-2xl font-bold text-purple-900 mt-1">{activeProperties}</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-600">Gem. per Property</span>
                </div>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {statsLoading ? '...' : avgViewsPerProperty}
                </p>
              </div>
            </div>
          </div>

          <RealtorPropertyTable 
            properties={properties}
            onPropertyDeleted={refreshProperties}
            statusFilter={statusFilter}
          />
        </div>
        
        <CarouselManagement />
        {/* ListingUrlInput removed */}
        {/* <WebhookTest /> */}

      </div>

      {/* ListingUploader removed */}
    </main>
  );
}
