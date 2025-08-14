import { useState } from 'react';
import { supabase } from '../../config/supabase.config';
import { toast } from 'react-hot-toast';

// Define types for database validation/repair results
type Issue = {
  type: string;
  name: string;
  description: string;
  fixable: boolean;
  count?: number;
};

type RepairedItem = {
  type: string;
  name: string;
  description: string;
  count?: number;
};

type FailedItem = {
  type: string;
  name: string;
  description: string;
  error: string;
};

type ValidationResult = {
  status: 'success' | 'issues_found' | 'partial_success';
  issues?: Issue[];
  repaired?: RepairedItem[];
  failed?: FailedItem[];
  details?: Record<string, unknown>;
  initial_validation?: ValidationResult;
  repair?: ValidationResult;
  final_validation?: ValidationResult;
};

/**
 * This component provides database maintenance functionality for admins
 */
export function DatabaseMaintenance() {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<'validate' | 'repair' | 'both' | ''>('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  
  /**
   * Validates the database structure without making any changes
   */
  const validateDatabase = async () => {
    setLoading(true);
    setActionType('validate');
    
    try {
      // Call the validation function
      const { data, error } = await supabase.rpc('validate_profiles');
      
      if (error) throw error;
      
      setResult(data as ValidationResult);
      
      if (data?.status === 'issues_found') {
        toast.error('Database validation found issues that need to be fixed');
      } else {
        toast.success('Database validation completed successfully');
      }
    } catch (error) {
      console.error('Error validating database:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Database validation failed: ${errorMessage}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Repairs detected database issues
   */
  const repairDatabase = async () => {
    setLoading(true);
    setActionType('repair');
    
    try {
      // Call the repair function
      const { data, error } = await supabase.rpc('repair_profiles');
      
      if (error) throw error;
      
      setResult(data as ValidationResult);
      
      if (data?.status === 'partial_success') {
        toast.error('Some database issues were fixed, but others could not be repaired');
      } else {
        toast.success('Database repair completed successfully');
      }
    } catch (error) {
      console.error('Error repairing database:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Database repair failed: ${errorMessage}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Validates and then repairs the database in one operation
   */
  const validateAndRepairDatabase = async () => {
    setLoading(true);
    setActionType('both');
    
    try {
      // Call the combined function with auto_repair=true
      const { data, error } = await supabase.rpc('validate_and_repair_profiles', {
        auto_repair: true
      });
      
      if (error) throw error;
      
      setResult(data as ValidationResult);
      
      const finalStatus = data?.final_validation?.status || data?.status;
      
      if (finalStatus === 'issues_found') {
        toast.error('Some database issues could not be automatically repaired');
      } else {
        toast.success('Database validation and repair completed successfully');
      }
    } catch (error) {
      console.error('Error validating and repairing database:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Database maintenance failed: ${errorMessage}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Renders a list of issues or repairs with appropriate styling
   */
  const renderList = (
    items: Issue[] | RepairedItem[] | FailedItem[] | undefined, 
    type: 'issues' | 'repaired' | 'failed'
  ) => {
    if (!items || items.length === 0) return null;
    
    const getIconClass = (itemType: string) => {
      switch (itemType) {
        case 'constraint':
          return 'text-purple-500';
        case 'column':
          return 'text-blue-500';
        case 'data':
          return 'text-orange-500';
        case 'policy':
          return 'text-green-500';
        default:
          return 'text-gray-500';
      }
    };
    
    const getBgClass = () => {
      switch (type) {
        case 'issues':
          return 'bg-amber-50 border-amber-200';
        case 'repaired':
          return 'bg-green-50 border-green-200';
        case 'failed':
          return 'bg-red-50 border-red-200';
        default:
          return 'bg-gray-50 border-gray-200';
      }
    };
    
    const getTitle = () => {
      switch (type) {
        case 'issues':
          return 'Gedetecteerde problemen';
        case 'repaired':
          return 'Gerepareerde items';
        case 'failed':
          return 'Niet-gerepareerde items';
        default:
          return 'Items';
      }
    };
    
    return (
      <div className={`mt-4 p-4 rounded border ${getBgClass()}`}>
        <h4 className="font-medium mb-2">{getTitle()} ({items.length}):</h4>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className={`mr-2 ${getIconClass(item.type)}`}>
                {type === 'failed' ? '❌' : type === 'repaired' ? '✓' : '•'}
              </span>
              <div>
                <span className="font-medium">{item.name || item.type}: </span>
                <span>{item.description}</span>                {('count' in item && item.count) && 
                  <span className="text-sm ml-1">({item.count} items)</span>
                }
                {'error' in item && (
                  <div className="text-red-600 text-sm mt-1">Error: {item.error}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  /**
   * Renders the detailed results section
   */
  const renderResults = () => {
    if (!result) return null;
    
    // For combined validation and repair
    if (result.initial_validation && result.repair && result.final_validation) {
      return (
        <div className="space-y-4 mt-4">
          <h3 className="font-semibold text-lg">Resultaten van validatie en reparatie</h3>
          
          <div className="border rounded p-4">
            <h4 className="font-medium mb-2">1. Initiële validatie</h4>
            {renderList(result.initial_validation.issues, 'issues')}
            {result.initial_validation.issues?.length === 0 && (
              <div className="text-green-600">Geen problemen gedetecteerd</div>
            )}
          </div>
          
          <div className="border rounded p-4">
            <h4 className="font-medium mb-2">2. Reparatie acties</h4>
            {renderList(result.repair.repaired, 'repaired')}
            {renderList(result.repair.failed, 'failed')}
            {(result.repair.repaired?.length === 0 && result.repair.failed?.length === 0) && (
              <div className="text-gray-600">Geen reparaties uitgevoerd</div>
            )}
          </div>
          
          <div className="border rounded p-4">
            <h4 className="font-medium mb-2">3. Finale validatie</h4>
            {renderList(result.final_validation.issues, 'issues')}
            {result.final_validation.issues?.length === 0 && (
              <div className="text-green-600">Alle problemen opgelost</div>
            )}
          </div>
        </div>
      );
    }
    
    // For simple validation or repair
    return (
      <div className="space-y-4 mt-4">
        <h3 className="font-semibold text-lg">
          Resultaten van {actionType === 'validate' ? 'validatie' : 'reparatie'}
        </h3>
        
        {result.status === 'success' && !result.issues?.length && !result.repaired?.length && (
          <div className="bg-green-50 text-green-700 p-4 rounded">
            <p className="font-medium">✓ Geen problemen gedetecteerd in de database</p>
          </div>
        )}
        
        {renderList(result.issues, 'issues')}
        {renderList(result.repaired, 'repaired')}
        {renderList(result.failed, 'failed')}
      </div>
    );
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Database Onderhoud</h2>
      
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="font-medium text-gray-800 mb-2">Valideer database structuur</h3>
          <p className="text-gray-600 mb-3">
            Controleert de databasestructuur op problemen zonder wijzigingen aan te brengen.
            Gebruik deze optie als u wilt weten of er problemen zijn die gerepareerd moeten worden.
          </p>
          
          <button 
            onClick={validateDatabase}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center gap-2 disabled:opacity-50"
          >
            {loading && actionType === 'validate' ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Bezig met valideren...</span>
              </>
            ) : (
              <span>Database Valideren</span>
            )}
          </button>
        </div>
        
        <div className="border-b pb-4">
          <h3 className="font-medium text-gray-800 mb-2">Herstel database problemen</h3>
          <p className="text-gray-600 mb-3">
            Repareert bekende problemen in de database.
            Gebruik deze optie als u al weet dat er problemen zijn die gerepareerd moeten worden.
          </p>
          
          <button 
            onClick={repairDatabase}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded flex items-center gap-2 disabled:opacity-50"
          >
            {loading && actionType === 'repair' ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Bezig met repareren...</span>
              </>
            ) : (
              <span>Database Repareren</span>
            )}
          </button>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Valideer en herstel database structuur</h3>
          <p className="text-gray-600 mb-3">
            Dit hulpmiddel controleert de databasestructuur op problemen en repareert ze automatisch.
            Gebruik deze functie als u 500-fouten krijgt of als gebruikers problemen hebben met het bekijken van hun rollen of favorieten.
          </p>
          
          <button 
            onClick={validateAndRepairDatabase}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center gap-2 disabled:opacity-50"
          >
            {loading && actionType === 'both' ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Bezig met valideren en repareren...</span>
              </>
            ) : (
              <span>Database Valideren en Repareren</span>
            )}
          </button>
        </div>
        
        {renderResults()}
      </div>
    </div>
  );
}
