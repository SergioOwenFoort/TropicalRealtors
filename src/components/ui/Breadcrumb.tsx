import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { usePropertyData } from '../../hooks/usePropertyData';

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive?: boolean;
}

export function Breadcrumb() {
  const location = useLocation();
  
  // Extract property ID from URL path if it exists (e.g., /woning/123 or /woning/uuid)
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const propertyIdIndex = pathSegments.findIndex(segment => segment === 'woning') + 1;
  
  // Check for numeric ID, UUID, or mock ID
  const propertySegment = propertyIdIndex > 0 && propertyIdIndex < pathSegments.length 
    ? pathSegments[propertyIdIndex] 
    : null;
    
  let finalPropertyId = null;
  if (propertySegment) {
    // Check if it's a numeric ID, UUID pattern, or mock ID
    if (/^\d+$/.test(propertySegment) || 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertySegment) ||
        propertySegment.startsWith('mock-')) {
      finalPropertyId = propertySegment;
    }
  }
  
  // Debug logging for property ID detection
  if (finalPropertyId) {
    console.log('Breadcrumb: Property ID detected:', finalPropertyId, 'from path:', location.pathname);
  }
  
  // Fetch property data if we have a property ID
  const { property, loading, error } = usePropertyData(finalPropertyId);
  
  // Debug logging for property data
  if (finalPropertyId) {
    console.log('Breadcrumb: Property data:', { 
      id: finalPropertyId, 
      property: property ? { id: property.id, title: property.title } : null, 
      loading, 
      error 
    });
  }
  
  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/' }
    ];

    // Build breadcrumbs from path segments
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Create readable labels for common paths
      let label = segment;
      
      // Handle special cases for better UX
      switch (segment) {
        case 'zoeken':
          label = 'Zoeken';
          break;
        case 'woning':
          label = 'Woning';
          break;
        case 'makelaars':
          label = 'Makelaars';
          break;
        case 'makelaar':
          label = 'Makelaar Dashboard';
          break;
        case 'admin':
          label = 'Admin Dashboard';
          break;
        case 'user':
          label = 'Dashboard';
          break;
        case 'owner':
          label = 'Eigenaar Dashboard';
          break;
        case 'business':
          label = 'Business Dashboard';
          break;
        case 'profiel':
          label = 'Profiel';
          break;
        case 'account':
          label = 'Account';
          break;
        case 'dashboard':
          label = 'Dashboard';
          break;
        case 'nieuw':
          label = 'Nieuwe Woning';
          break;
        case 'bewerken':
          label = 'Bewerken';
          break;
        case 'afspraken':
          label = 'Afspraken';
          break;
        case 'auth':
          label = 'Authenticatie';
          break;
        case 'login':
          label = 'Inloggen';
          break;
        case 'registreren':
          label = 'Registreren';
          break;
        case 'reset-password':
          label = 'Wachtwoord Resetten';
          break;
        case 'locaties':
          label = 'Locaties';
          break;
        case 'kralendijk':
          label = 'Kralendijk';
          break;
        case 'rincon':
          label = 'Rincon';
          break;
        case 'sabadeco':
          label = 'Sabadeco';
          break;
        case 'belnem':
          label = 'Belnem';
          break;
        case 'nikiboko':
          label = 'Nikiboko';
          break;
        case 'over-ons':
          label = 'Over Ons';
          break;
        case 'contact':
          label = 'Contact';
          break;
        case 'faq':
          label = 'FAQ';
          break;
        case 'prijzen':
          label = 'Prijzen';
          break;
        default:
          // If it's a number, UUID, or mock ID, show property title or fallback
          if (/^\d+$/.test(segment) || 
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
              segment.startsWith('mock-')) {
            // Check if previous segment was 'woning'
            if (pathSegments[index - 1] === 'woning') {
              // Use property title if available, otherwise fallback to "Woning #ID" or "Woning #{segment}"
              if (property?.title) {
                label = property.title;
                console.log('Breadcrumb: Using property title:', label);
              } else {
                label = `Woning #${segment}`;
                console.log('Breadcrumb: Using fallback:', label);
              }
            } else {
              label = segment;
            }
          } else {
            // Capitalize first letter for other segments
            label = segment.charAt(0).toUpperCase() + segment.slice(1);
          }
          break;
      }
      
      breadcrumbs.push({
        label,
        path: currentPath,
        isActive: isLast
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  
  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
              
              {breadcrumb.isActive ? (
                <span className="text-gray-700 font-medium flex items-center">
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  to={breadcrumb.path}
                  className="text-blue-600 hover:text-blue-800 transition-colors flex items-center hover:underline"
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
