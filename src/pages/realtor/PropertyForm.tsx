import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Property } from '../../types';
import { ImageUploader } from '../../components/realtor/ImageUploader';
import { FeatureSelector } from '../../components/realtor/FeatureSelector';
import { BackButton } from '../../components/ui/BackButton';
import { getLocationsByIsland } from '../../data/countries';
import { useUserRole } from '../../hooks/useUserRole';
import { useIsland } from '../../contexts/MasterIslandContext';
import { useProperties } from '../../hooks/useProperties';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { FormHeader } from '../../components/property/form/FormHeader';
import { ValidationErrors } from '../../components/property/form/ValidationErrors';
import { BasicInfoSection } from '../../components/property/form/BasicInfoSection';
import { DeleteConfirmModal } from '../../components/property/form/DeleteConfirmModal';

const INITIAL_PROPERTY: Omit<Property, 'id' | 'datePosted' | 'makelaarId'> = {
  title: '',
  price: 0,
  address: '',
  city: '',
  country: '',
  postalCode: '',
  bedrooms: 1,
  bathrooms: 1,
  size: 0,
  images: [],
  description: '',
  type: 'koop',
  category: 'appartementen',
  features: [],
  status: 'concept',
  featured: false
};

interface PropertyFormProps {
  ownerMode?: boolean;
  businessMode?: boolean;
}

export function PropertyForm({ ownerMode = false, businessMode = false }: PropertyFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const { user } = useAuth();
  const { selectedIsland } = useIsland();
  const { properties, updateProperty, addProperty, deleteProperty } = useProperties();
  const [property, setProperty] = useState<typeof INITIAL_PROPERTY>(INITIAL_PROPERTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      const existingProperty = properties.find(p => p.id === id);
      if (existingProperty) {
        const { id: _, datePosted: __, makelaarId: ___, ...rest } = existingProperty;
        setProperty(rest);
      }
    }
  }, [id, properties]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!property.title) newErrors.title = 'Titel is verplicht';
    if (!property.price || property.price <= 0) newErrors.price = 'Voer een geldige prijs in';
    if (!property.address) newErrors.address = 'Adres is verplicht';
    if (!property.city) newErrors.city = 'Stad is verplicht';
    if (!property.country) newErrors.country = 'Land is verplicht';
    // Removed postalCode validation - it's now optional
    if (property.images.length === 0) newErrors.images = 'Voeg minimaal één afbeelding toe';
    if (!property.description) newErrors.description = 'Beschrijving is verplicht';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      if (id) {
        await updateProperty(id, property);
      } else {
        await addProperty({
          ...property,
          makelaarId: user?.id || 'unknown'
        });
      }
      
      // Navigate back to the appropriate dashboard
      if (isAdmin) {
        navigate('/admin');
      } else if (businessMode) {
        navigate('/business');
      } else if (ownerMode) {
        navigate('/owner');
      } else {
        navigate('/makelaar');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Er is een fout opgetreden bij het opslaan van de woning');
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteProperty(id);
      toast.success('Woning succesvol verwijderd');
      // Redirect based on user role
      if (isAdmin) {
        navigate('/admin');
      } else if (businessMode) {
        navigate('/business');
      } else if (ownerMode) {
        navigate('/owner');
      } else {
        navigate('/makelaar');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Er is een fout opgetreden bij het verwijderen van de woning');
    }
  };

  const handlePropertyChange = (updates: Partial<typeof property>) => {
    setProperty(prev => ({ ...prev, ...updates }));
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton />
      </div>

      <FormHeader
        title={id ? 'Woning Bewerken' : 'Nieuwe Woning'}
        isAdmin={isAdmin}
        isRealtor={!ownerMode && !businessMode && !isAdmin}
        isOwner={ownerMode}
        isBusiness={businessMode}
        showDelete={!!id}
        onDelete={() => setShowDeleteConfirm(true)}
        onSave={handleSubmit}
      />

      <ValidationErrors errors={errors} />

      <form onSubmit={handleSubmit} className="space-y-8">
        <BasicInfoSection
          property={property}
          onChange={handlePropertyChange}
          isAdmin={isAdmin}
        />

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Locatie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Land
              </label>
              <select
                value={property.country}
                onChange={e => handlePropertyChange({ country: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                required
              >
                <option value="">Selecteer een land</option>
                {getLocationsByIsland(selectedIsland).map(country => (
                  <option key={country.name} value={country.name}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stad
              </label>
              <input
                type="text"
                value={property.city}
                onChange={e => handlePropertyChange({ city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres
              </label>
              <input
                type="text"
                value={property.address}
                onChange={e => handlePropertyChange({ address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postcode
              </label>
              <input
                type="text"
                value={property.postalCode}
                onChange={e => handlePropertyChange({ postalCode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                placeholder="Optioneel"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Kenmerken</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slaapkamers
              </label>
              <input
                type="number"
                value={property.bedrooms}
                onChange={e => handlePropertyChange({ bedrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badkamers
              </label>
              <input
                type="number"
                value={property.bathrooms}
                onChange={e => handlePropertyChange({ bathrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Woonoppervlak (m²)
              </label>
              <input
                type="number"
                value={property.size}
                onChange={e => handlePropertyChange({ size: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Extra's</h2>
          <FeatureSelector
            selectedFeatures={property.features}
            onFeatureAdd={(feature) => 
              handlePropertyChange({ features: [...property.features, feature] })
            }
            onFeatureRemove={(feature) =>
              handlePropertyChange({ features: property.features.filter(f => f !== feature) })
            }
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Afbeeldingen</h2>
          <ImageUploader
            images={property.images}
            onImagesChange={(images) => handlePropertyChange({ images })}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Beschrijving</h2>
          <textarea
            value={property.description}
            onChange={e => handlePropertyChange({ description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            rows={6}
            required
          />
        </div>
      </form>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
