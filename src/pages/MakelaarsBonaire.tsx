import { useRealtors } from '../hooks/useRealtors';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { openRealtorEmail } from '../utils/emailUtils';
import { obfuscateEmail } from '../utils/emailObfuscation';

export function MakelaarsBonaire() {
  const { 
    realtors, 
    loading, 
    error,
    page, 
    totalPages,
    nextPage,
    previousPage,
    goToPage,
    refreshRealtors
  } = useRealtors('bonaire', 12); // 12 realtors per page
  
  // Generate pagination buttons
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    
    const buttons = [];
    
    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={previousPage}
        disabled={page === 1}
        className={`px-3 py-1 rounded-md ${
          page === 1 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        &laquo; Vorige
      </button>
    );
    
    // Page number buttons
    const maxButtons = 5;
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    if (startPage > 1) {
      buttons.push(
        <button
          key="1"
          onClick={() => goToPage(1)}
          className="px-3 py-1 mx-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="px-2">...</span>);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 mx-1 rounded-md ${
            i === page 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      
      buttons.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 mx-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    buttons.push(
      <button
        key="next"
        onClick={nextPage}
        disabled={page === totalPages}
        className={`px-3 py-1 ml-1 rounded-md ${
          page === totalPages 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        Volgende &raquo;
      </button>
    );
    
    return (
      <div className="flex flex-wrap justify-center items-center mt-8 gap-1">
        {buttons}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Onze Makelaars op Bonaire</h1>
        <p className="text-lg text-gray-600 mb-8">
          Ontmoet ons team van ervaren makelaars op Bonaire. Neem direct contact op voor persoonlijk advies.
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">Er is een fout opgetreden bij het laden van de makelaars.</p>
            <button 
              onClick={() => refreshRealtors()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Probeer opnieuw
            </button>
          </div>
        ) : realtors.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">Nog geen makelaars beschikbaar</h2>
            <p className="text-gray-500 mt-2">Er zijn momenteel geen makelaars beschikbaar voor Bonaire.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {realtors.map(realtor => (
                <div key={realtor.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={realtor.imageUrl} 
                      alt={`${realtor.name} - Makelaar`}
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x300?text=Geen+Afbeelding';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900">{realtor.name}</h3>
                    
                    {realtor.rating && (
                      <div className="flex items-center mt-1">
                        <div className="text-yellow-400 flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>
                              {i < Math.floor(realtor.rating || 0) ? (
                                "★"
                              ) : i < (realtor.rating || 0) ? (
                                "⯨"
                              ) : (
                                "☆"
                              )}
                            </span>
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-500">({realtor.rating?.toFixed(1)})</span>
                      </div>
                    )}
                    
                    <p className="text-sm font-medium text-blue-600 mt-1">{realtor.specialization}</p>
                    <p className="text-sm text-gray-500 mt-1">{realtor.location}</p>
                    
                    <div className="mt-3 text-sm text-gray-700 line-clamp-3">
                      {realtor.bio}
                    </div>
                    
                    {realtor.languages && realtor.languages.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {realtor.languages.map((language, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <div className="flex items-center text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${realtor.email}`} className="hover:text-blue-600 truncate" title="Klik om email te versturen">{obfuscateEmail(realtor.email)}</a>
                      </div>
                      
                      <div className="flex items-center mt-1 text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${realtor.phone}`} className="hover:text-blue-600">{realtor.phone}</a>
                      </div>
                    </div>
                    
                    <div className="mt-4">
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
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                      >
                        Neem contact op
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination controls */}
            {renderPaginationButtons()}
          </>
        )}
      </div>
    </div>
  );
}
