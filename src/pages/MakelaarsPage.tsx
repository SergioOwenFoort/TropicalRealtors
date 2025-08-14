import { useRealtors } from '../hooks/useRealtors';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RealtorCard } from '../components/realtor/RealtorCard';

export function MakelaarsBonaire() {
  // Use the hook to fetch realtors for Bonaire with pagination (12 per page)
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
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">Er zijn momenteel geen makelaars beschikbaar voor Bonaire.</p>
            <p className="text-sm text-gray-400">Kom later terug of neem contact op met de beheerder.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {realtors.map(realtor => (
                <RealtorCard key={realtor.id} realtor={realtor} />
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

export function MakelaarsAruba() {
  // Use the hook to fetch realtors for Aruba with pagination (12 per page)
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
  } = useRealtors('aruba', 12); // 12 realtors per page

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Onze Makelaars op Aruba</h1>
        <p className="text-lg text-gray-600 mb-8">
          Ontmoet ons team van ervaren makelaars op Aruba. Neem direct contact op voor persoonlijk advies.
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
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">Er zijn momenteel geen makelaars beschikbaar voor Aruba.</p>
            <p className="text-sm text-gray-400">Kom later terug of neem contact op met de beheerder.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {realtors.map(realtor => (
                <RealtorCard key={realtor.id} realtor={realtor} />
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

export function MakelaarsCuracao() {
  // Use the hook to fetch realtors for Curaçao with pagination (12 per page)
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
  } = useRealtors('curacao', 12); // 12 realtors per page

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Onze Makelaars op Curaçao</h1>
        <p className="text-lg text-gray-600 mb-8">
          Ontmoet ons team van ervaren makelaars op Curaçao. Neem direct contact op voor persoonlijk advies.
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
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">Er zijn momenteel geen makelaars beschikbaar voor Curaçao.</p>
            <p className="text-sm text-gray-400">Kom later terug of neem contact op met de beheerder.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {realtors.map(realtor => (
                <RealtorCard key={realtor.id} realtor={realtor} />
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
