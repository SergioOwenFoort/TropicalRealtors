import { useState } from 'react';
import { useIslandRealtors, useMasterIsland } from '../contexts/MasterIslandContext';
import { Mail, Phone, MapPin, Users, ExternalLink } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { obfuscateEmail } from '../utils/emailObfuscation';
import { openRealtorEmail } from '../utils/emailUtils';

export function MakelaarsPageUnified() {
  const { realtors, loading, error } = useIslandRealtors();
  const { selectedIsland } = useMasterIsland();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Function to get island display name
  const getIslandDisplayName = (island: string) => {
    switch (island) {
      case 'bonaire':
        return 'Bonaire';
      case 'aruba':
        return 'Aruba';
      case 'curacao':
        return 'Curaçao';
      case 'saba':
        return 'Saba';
      default:
        return island;
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(realtors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRealtors = realtors.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600 p-4 bg-white rounded-lg shadow">
          Er is een fout opgetreden bij het laden van de makelaars. Probeer het later opnieuw.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Makelaars op {getIslandDisplayName(selectedIsland)}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Vind de perfecte makelaar op {getIslandDisplayName(selectedIsland)} voor uw droomhuis. Onze gecertificeerde makelaars 
            staan klaar om u te helpen bij het kopen, verkopen of huren van uw woning.
          </p>
        </div>

        {/* Realtors Grid */}
        {currentRealtors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {currentRealtors.map((realtor) => (
                <div key={realtor.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Profile Image */}
                  <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
                    {realtor.image_url ? (
                      <img
                        src={realtor.image_url}
                        alt={realtor.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                          <Users className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{realtor.name}</h3>
                    
                    {realtor.specialization && (
                      <p className="text-blue-600 font-medium mb-3">{realtor.specialization}</p>
                    )}
                    
                    {realtor.bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{realtor.bio}</p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {realtor.email && (
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="text-sm">{obfuscateEmail(realtor.email)}</span>
                        </div>
                      )}
                      {realtor.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="text-sm">{realtor.phone}</span>
                        </div>
                      )}
                      {realtor.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">{realtor.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Languages */}
                    {realtor.languages && realtor.languages.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {realtor.languages.map((language: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Contact button clicked for:', realtor.name, realtor.email);
                          try {
                            openRealtorEmail(realtor.email, realtor.name, realtor.companyName);
                          } catch (error) {
                            console.error('Error opening email:', error);
                            window.open(`mailto:${realtor.email}`, '_self');
                          }
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Contact
                      </button>
                      {realtor.website && (
                        <a
                          href={realtor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5 text-gray-600" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Vorige
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border border-gray-300 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Volgende
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Geen makelaars gevonden
            </h3>
            <p className="text-gray-600">
              Er zijn momenteel geen makelaars beschikbaar voor dit eiland.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
