import { useNavigate, useParams } from 'react-router-dom';
import { ListingUploader } from '../../components/realtor/ListingUploader';
import { useProperties } from '../../hooks/useProperties';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Property } from '../../types';

export function OwnerListingUploader() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { properties } = useProperties();
  const [initialData, setInitialData] = useState<Partial<Property> | undefined>(undefined);
  
  // Get user's properties
  const userProperties = properties.filter(p => p.makelaarId === user?.id);
  
  // Check if user has reached the limit of 3 properties
  const hasReachedLimit = userProperties.length >= 3 && !id;
  
  // Load property data for editing
  useEffect(() => {
    if (id && properties.length > 0) {
      const property = properties.find(p => p.id === id && p.makelaarId === user?.id);
      
      if (property) {
        setInitialData(property);
      } else {
        toast.error('Woning niet gevonden of u heeft geen toegang tot deze woning');
        navigate('/owner');
      }
    }
  }, [id, properties, user?.id, navigate]);
  
  if (hasReachedLimit) {
    toast.error('U kunt maximaal 3 woningen beheren als huiseigenaar');
    navigate('/owner');
    return null;
  }

  const handleSuccess = () => {
    toast.success(id ? 'Woning succesvol bijgewerkt!' : 'Woning succesvol toegevoegd!');
    navigate('/owner');
  };

  const handleClose = () => {
    navigate('/owner');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {id ? 'Woning bewerken' : 'Nieuwe woning toevoegen'}
        </h1>
        <p className="text-gray-600">
          Als huiseigenaar kunt u maximaal 3 woningen beheren. 
          {userProperties.length > 0 && (
            <span> U heeft momenteel {userProperties.length} van de 3 woningen toegevoegd.</span>
          )}
        </p>
      </div>
      
      <ListingUploader
        onClose={handleClose}
        onSuccess={handleSuccess}
        initialData={initialData}
        isEditing={!!id}
        listingId={id}
      />
    </div>
  );
}
