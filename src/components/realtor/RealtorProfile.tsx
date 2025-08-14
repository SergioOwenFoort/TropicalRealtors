import { useState } from 'react';
import { useRealtors } from '../../hooks/useRealtors';
import { RealtorUploader } from '../shared/RealtorUploader';
import { useAuth } from '../../hooks/useAuth';
import { useIsland } from '../../contexts/MasterIslandContext';
import { UserPlus } from 'lucide-react';
import { obfuscateEmail } from '../../utils/emailObfuscation';

export function RealtorProfile() {
  const { user } = useAuth();
  const { selectedIsland } = useIsland();
  const { realtors, loading, refreshRealtors } = useRealtors(selectedIsland as 'bonaire' | 'aruba' | 'curacao');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Check how many realtor profiles the current user has (max 3 allowed)
  const userProfiles = realtors.filter(realtor => realtor.userId === user?.id);
  const profileCount = userProfiles.length;
  const hasProfile = profileCount > 0;
  const canCreateMore = profileCount < 3;

  const handleProfileCreated = () => {
    setShowAddForm(false);
    refreshRealtors();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Jouw makelaarsprofiel(en)</h2>
          <p className="text-sm text-gray-600 mt-1">
            {profileCount > 0 ? `${profileCount} van 3 profielen` : 'Nog geen profielen'}
          </p>
        </div>
        
        {canCreateMore && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
          >
            <UserPlus size={18} />
            <span>Profiel aanmaken</span>
          </button>
        )}
        
        {showAddForm && (
          <button
            onClick={() => setShowAddForm(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            Annuleren
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : hasProfile ? (
        <div className="space-y-4">
          {userProfiles.map((realtor, index) => (
              <div key={realtor.id} className="bg-white border border-gray-200 rounded-lg p-4 flex">
                <div className="w-24 h-24 mr-4 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <img
                    src={realtor.image_url}
                    alt={realtor.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/96x96/6B7280/FFFFFF?text=Geen+Foto';
                    }}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{realtor.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Profiel {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mb-1">{realtor.specialization}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    {realtor.location}, {realtor.island.charAt(0).toUpperCase() + realtor.island.slice(1)}
                  </p>
                  
                  <div className="flex gap-3 text-sm text-gray-600 mt-2">
                    <div>
                      <span className="font-medium">Email:</span> {obfuscateEmail(realtor.email)}
                    </div>
                    <div>
                      <span className="font-medium">Telefoon:</span> {realtor.phone}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Bio:</span> {realtor.bio}
                  </p>
                </div>
              </div>
            ))}
          
          {!canCreateMore && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-yellow-800 text-sm">
                Je hebt het maximum aantal profielen (3) bereikt. Je kunt bestaande profielen bewerken maar geen nieuwe aanmaken.
              </p>
            </div>
          )}
        </div>
      ) : showAddForm ? (
        <RealtorUploader 
          onSuccess={handleProfileCreated}
          onCancel={() => setShowAddForm(false)}
          currentUserEmail={user?.email}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          Je hebt nog geen makelaarsprofiel. Maak er een aan om zichtbaar te zijn op de website.
          <br />
          <span className="text-xs text-gray-400 mt-2 block">Je kunt tot 3 profielen aanmaken.</span>
        </div>
      )}
    </div>
  );
}
