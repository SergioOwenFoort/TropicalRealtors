import { Link } from 'react-router-dom';
import { useState } from 'react';

interface LogoProps {
  onClick?: () => void;
  className?: string;
}

export function Logo({ onClick, className = "" }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link 
      to="/" 
      className={`flex items-center gap-3 ${className}`} 
      onClick={onClick}
    >
      {!imageError ? (
        <img 
          src="/logo.jpg" 
          alt="TropicalRealtors.com" 
          className="h-24 w-auto object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="text-2xl font-bold">
          <span className="text-blue-600">Tropical</span>
          <span className="text-green-600">Realtors</span>
          <span className="text-orange-500">.com</span>
        </div>
      )}
    </Link>
  );
}
