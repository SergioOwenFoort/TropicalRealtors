import React, { useState } from 'react';
import { Realtor } from '../../types';
import { openRealtorEmail } from '../../utils/emailUtils';
import { createRevealableEmail } from '../../utils/emailObfuscation';

interface Props {
  realtor: Realtor;
}

export const RealtorCard: React.FC<Props> = ({ realtor }) => {
  // Debug: Log realtor data to see what we're receiving
  console.log('🔍 RealtorCard received realtor:', realtor);
  console.log('🔍 RealtorCard image_url:', realtor.image_url);
  
  // Email obfuscation state
  const [showFullEmail, setShowFullEmail] = useState(false);
  const emailData = createRevealableEmail(realtor.email);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="h-64 overflow-hidden bg-gray-100 flex items-center justify-center">
        <img 
          src={realtor.image_url?.split('?')[0] || 'https://via.placeholder.com/300x300/6B7280/FFFFFF?text=Geen+Afbeelding'} // Remove any query parameters and handle empty URLs
          alt={`${realtor.name} - Makelaar`}
          className="w-full h-full object-cover object-center" 
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x300/6B7280/FFFFFF?text=Geen+Afbeelding';
          }}
        />
      </div>
      <div className="p-4">
        {/* Company name at the top */}
        <div className="mb-2">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {realtor.companyName}
          </span>
        </div>

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
            <div className="flex items-center truncate">
              <a 
                href={`mailto:${realtor.email}`} 
                className="hover:text-blue-600 truncate"
                title={showFullEmail ? realtor.email : "Klik om volledig emailadres te tonen"}
              >
                {showFullEmail ? realtor.email : emailData.obfuscated}
              </a>
              {emailData.isObfuscated && !showFullEmail && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowFullEmail(true);
                  }}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  title="Toon volledig emailadres"
                >
                  toon
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center mt-1 text-sm text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${realtor.phone}`} className="hover:text-blue-600">{realtor.phone}</a>
          </div>
        </div>
        
        <div className="mt-4">
          {/* Primary button with JavaScript */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              console.log('Contact button clicked for:', realtor.name, realtor.email);
              try {
                openRealtorEmail(realtor.email, realtor.name, realtor.companyName);
              } catch (error) {
                console.error('Error opening email:', error);
                // Fallback: create a simple mailto link
                window.open(`mailto:${realtor.email}`, '_self');
              }
            }}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors mb-2"
          >
            Neem contact op
          </button>
          
          {/* Fallback direct mailto link */}
          <a 
            href={`mailto:${realtor.email}?subject=${encodeURIComponent(`Interesse in uw diensten - ${realtor.name}`)}&body=${encodeURIComponent(`Beste ${realtor.name},\n\nIk ben geïnteresseerd in uw diensten als makelaar.\n\nMet vriendelijke groet,\n[Uw naam]`)}`}
            className="block w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors text-center"
          >
            Direct email (alternatief)
          </a>
        </div>
      </div>
    </div>
  );
};
