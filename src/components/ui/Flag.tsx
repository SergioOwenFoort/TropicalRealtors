interface FlagProps {
  country: 'aruba' | 'bonaire' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Flag({ country, size = 'md', className = '' }: FlagProps) {
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6'
  };

  const flagClass = `inline-block ${sizeClasses[size]} ${className}`;

  switch (country) {
    case 'aruba':
      return (
        <svg className={flagClass} viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg">
          <rect width="18" height="12" fill="#418FDE"/>
          <rect y="8" width="18" height="1" fill="#FFCD00"/>
          <rect y="9" width="18" height="1" fill="#FFFFFF"/>
          <polygon points="4,3 5,2 6,3 5,4" fill="#FFFFFF"/>
          <polygon points="4.2,3 4.8,2.4 5.8,3 4.8,3.6" fill="#DE3831"/>
        </svg>
      );

    case 'bonaire':
      return (
        <svg className={flagClass} viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg">
          {/* Blue background (bottom part) */}
          <rect width="18" height="12" fill="#21468B"/>
          {/* White middle diagonal band */}
          <polygon points="0,4 18,0 18,8 0,12" fill="#FFFFFF"/>
          {/* Yellow top-left triangle */}
          <polygon points="0,0 0,4 18,0" fill="#FFE900"/>
          {/* Black compass star in the yellow triangle */}
          <g transform="translate(3,1.5)">
            <polygon points="1,0 1.3,0.7 2,0.7 1.5,1.1 1.7,1.8 1,1.4 0.3,1.8 0.5,1.1 0,0.7 0.7,0.7" fill="#000000"/>
            {/* Red circle in center of compass */}
            <circle cx="1" cy="1" r="0.4" fill="#DE3831"/>
          </g>
        </svg>
      );

    case 'curacao':
      return (
        <svg className={flagClass} viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg">
          {/* Dark blue background */}
          <rect width="18" height="12" fill="#002868"/>
          {/* Yellow stripe across top 3/4 of the flag */}
          <rect y="9" width="18" height="3" fill="#FFCD00"/>
          {/* Two white five-pointed stars in upper left */}
          <g transform="translate(2,2)">
            <polygon points="1,0 1.2,0.6 1.8,0.6 1.3,1 1.5,1.6 1,1.2 0.5,1.6 0.7,1 0.2,0.6 0.8,0.6" fill="#FFFFFF"/>
            <polygon points="3,1 3.2,1.6 3.8,1.6 3.3,2 3.5,2.6 3,2.2 2.5,2.6 2.7,2 2.2,1.6 2.8,1.6" fill="#FFFFFF"/>
          </g>
        </svg>
      );

    case 'saba':
      return (
        <svg className={flagClass} viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg">
          {/* White diamond that extends almost to the edges */}
          <polygon points="9,1 17,6 9,11 1,6" fill="#FFFFFF"/>
          {/* Red triangular areas in top corners (smaller) */}
          <polygon points="0,0 9,1 1,6 0,0" fill="#DE3831"/>
          <polygon points="18,0 17,6 9,1 18,0" fill="#DE3831"/>
          {/* Blue triangular areas in bottom corners (smaller) */}
          <polygon points="0,12 1,6 9,11 0,12" fill="#0047AB"/>
          <polygon points="18,12 9,11 17,6 18,12" fill="#0047AB"/>
          {/* Yellow star in center of white diamond */}
          <g transform="translate(9,6)">
            <polygon points="0,-1.5 0.3,-0.5 1.4,-0.5 0.6,0.1 0.9,1.1 0,0.5 -0.9,1.1 -0.6,0.1 -1.4,-0.5 -0.3,-0.5" fill="#FFD700"/>
          </g>
        </svg>
      );

    case 'sint-eustatius':
      return (
        <svg className={flagClass} viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg">
          {/* Blue background */}
          <rect width="18" height="12" fill="#002868"/>
          {/* Red border */}
          <rect width="18" height="12" fill="none" stroke="#DE3831" strokeWidth="0.8"/>
          {/* Horizontal red stripe through middle */}
          <rect y="5.2" width="18" height="1.6" fill="#DE3831"/>
          {/* Vertical red stripe through middle */}
          <rect x="8.2" y="0" width="1.6" height="12" fill="#DE3831"/>
          {/* White diamond in center */}
          <polygon points="9,2 12,6 9,10 6,6" fill="#FFFFFF"/>
          {/* Green hills inside diamond */}
          <g transform="translate(9,6)">
            {/* Left hill */}
            <polygon points="-2,2 -1.5,0.5 -1,2" fill="#228B22"/>
            {/* Right hill */}
            <polygon points="0,2 0.5,1 1,2" fill="#228B22"/>
            {/* Yellow star above hills */}
            <polygon points="0,-1.5 0.2,-0.8 0.9,-0.8 0.4,-0.3 0.6,0.4 0,-0.1 -0.6,0.4 -0.4,-0.3 -0.9,-0.8 -0.2,-0.8" fill="#FFD700"/>
          </g>
        </svg>
      );

    case 'sint-maarten':
      return (
        <svg className={flagClass} viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg">
          <rect width="18" height="6" fill="#DE3831"/>
          <rect y="6" width="18" height="6" fill="#21468B"/>
          <polygon points="0,0 9,6 0,12" fill="#FFFFFF"/>
          <circle cx="6" cy="6" r="2" fill="#FFE900"/>
          <rect x="5" y="5" width="2" height="2" fill="#8B4513"/>
        </svg>
      );

    default:
      return (
        <div className={`${sizeClasses[size]} bg-gray-200 ${className}`}></div>
      );
  }
}
