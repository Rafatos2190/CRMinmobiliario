
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Link, useParams } from 'react-router-dom';
import { Property, PropertyType, Client } from '../../types';
import { getProperties, addProperty, updateProperty, deleteProperty, getPropertyById, getClients, getClientById } from '../../services/dataService'; // Added getClientById
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Select } from '../common/Select';
import { Modal } from '../common/Modal';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PlusIcon, EditIcon, TrashIcon, SparklesIcon, EyeIcon, OfficeBuildingIcon } from '../../constants'; // Added OfficeBuildingIcon
import { generatePropertyDescription, isGeminiAvailable } from '../../services/geminiService';


const PropertyForm: React.FC<{ property?: Property; onSave: (property: Property) => void; onCancel: () => void }> = ({ property, onSave, onCancel }) => {
  const [address, setAddress] = useState(property?.address || '');
  const [type, setType] = useState<PropertyType>(property?.type || PropertyType.APARTAMENTO);
  const [price, setPrice] = useState<string>(property?.price?.toString() || '');
  const [bedrooms, setBedrooms] = useState<string>(property?.bedrooms?.toString() || '');
  const [bathrooms, setBathrooms] = useState<string>(property?.bathrooms?.toString() || '');
  const [areaSqMeters, setAreaSqMeters] = useState<string>(property?.areaSqMeters?.toString() || '');
  const [description, setDescription] = useState(property?.description || '');
  const [clientId, setClientId] = useState(property?.clientId || '');
  
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const geminiReady = isGeminiAvailable();

  useEffect(() => {
    setAllClients(getClients());
  }, []);

  const validate = () => {
    const newErrors: any = {};
    if (!address.trim()) newErrors.address = 'La dirección es obligatoria.';
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) newErrors.price = 'El precio debe ser un número positivo.';
    if (bedrooms && (isNaN(parseInt(bedrooms)) || parseInt(bedrooms) < 0)) newErrors.bedrooms = 'Número de habitaciones inválido.';
    if (bathrooms && (isNaN(parseInt(bathrooms)) || parseInt(bathrooms) < 0)) newErrors.bathrooms = 'Número de baños inválido.';
    if (areaSqMeters && (isNaN(parseFloat(areaSqMeters)) || parseFloat(areaSqMeters) <= 0)) newErrors.areaSqMeters = 'El área debe ser un número positivo.';
    if (!description.trim()) newErrors.description = 'La descripción es obligatoria.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const propertyData = {
      address,
      type,
      price: parseFloat(price),
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      areaSqMeters: areaSqMeters ? parseFloat(areaSqMeters) : undefined,
      description,
      clientId: clientId || undefined, // Ensure empty string becomes undefined
      photos: property?.photos || [], // Preserve existing photos or init empty
    };

    if (property && property.id) {
      const updatedProperty = updateProperty(property.id, propertyData);
      if (updatedProperty) onSave(updatedProperty);
    } else {
      const newProperty = addProperty(propertyData);
      onSave(newProperty);
    }
  };

  const handleGenerateDescription = async () => {
    if (!geminiReady) return;
    setLoadingDescription(true);
    const generatedDesc = await generatePropertyDescription(
      type,
      `Ubicada en ${address}. ${bedrooms ? bedrooms + ' habitaciones.' : ''} ${bathrooms ? bathrooms + ' baños.' : ''} ${areaSqMeters ? areaSqMeters + ' m².' : ''}`,
      address, // Simplified location from address
      bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms ? parseInt(bathrooms) : undefined,
      areaSqMeters ? parseFloat(areaSqMeters) : undefined
    );
    setDescription(generatedDesc);
    setLoadingDescription(false);
  };

  const propertyTypeOptions = Object.values(PropertyType).map(pt => ({ value: pt, label: pt }));
  const clientOptions = [{ value: '', label: 'Ninguno / Propiedad de la agencia' }, ...allClients.map(c => ({ value: c.id, label: c.name }))];


  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <Input label="Dirección" id="prop-address" value={address} onChange={(e) => setAddress(e.target.value)} error={errors.address} required />
      <Select label="Tipo de Propiedad" id="prop-type" value={type} onChange={(e) => setType(e.target.value as PropertyType)} options={propertyTypeOptions} required />
      <Input label="Precio (€)" id="prop-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} error={errors.price} required />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Habitaciones" id="prop-bedrooms" type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} error={errors.bedrooms} />
        <Input label="Baños" id="prop-bathrooms" type="number" min="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} error={errors.bathrooms} />
        <Input label="Área (m²)" id="prop-area" type="number" min="0" step="0.01" value={areaSqMeters} onChange={(e) => setAreaSqMeters(e.target.value)} error={errors.areaSqMeters} />
      </div>
      <TextArea label="Descripción" id="prop-description" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} required />
      {geminiReady && (
        <Button
          type="button"
          variant="ghost"
          onClick={handleGenerateDescription}
          isLoading={loadingDescription}
          leftIcon={<SparklesIcon className="h-4 w-4" />}
          className="text-sm -mt-2"
        >
          {loadingDescription ? 'Generando...' : 'Generar Descripción con IA'}
        </Button>
      )}
      <Select label="Cliente Propietario (Opcional)" id="prop-client" value={clientId} onChange={(e) => setClientId(e.target.value)} options={clientOptions} />
      {/* Placeholder for photo uploads */}
      <div className="text-sm text-secondary-500">Gestión de fotos próximamente. Se añadirá una foto de placeholder.</div>


      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary">{property ? 'Guardar Cambios' : 'Crear Propiedad'}</Button>
      </div>
    </form>
  );
};


const PropertyCardDisplay: React.FC<{ property: Property; onEdit: (property: Property) => void; onDelete: (property: Property) => void; onViewDetails: (property: Property) => void; clientName?: string; }> = ({ property, onEdit, onDelete, onViewDetails, clientName }) => {
  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-shadow duration-200">
        <img src={(property.photos && property.photos[0]) || `https://picsum.photos/seed/${property.id}/400/200`} alt={property.address} className="w-full h-48 object-cover"/>
        <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-semibold text-primary-700 mb-1">{property.address}</h3>
            <p className="text-sm text-secondary-600 mb-1">{property.type} - {property.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
            <p className="text-xs text-secondary-500 mb-2">
                {property.bedrooms && `${property.bedrooms} hab.`} {property.bathrooms && `· ${property.bathrooms} baños`} {property.areaSqMeters && `· ${property.areaSqMeters} m²`}
            </p>
            <p className="text-sm text-secondary-600 mb-3 flex-grow">{property.description.substring(0, 100)}{property.description.length > 100 ? '...' : ''}</p>
            {clientName && <p className="text-xs text-secondary-500 mb-3">Propietario: {clientName}</p>}

            <div className="mt-auto flex justify-end space-x-2 pt-2 border-t border-secondary-100">
                <Button size="sm" variant="ghost" onClick={() => onViewDetails(property)} title="Ver Detalles" className="text-blue-500 hover:text-blue-700">
                    <EyeIcon className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onEdit(property)} title="Editar" className="text-yellow-500 hover:text-yellow-700">
                    <EditIcon className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(property)} title="Eliminar" className="text-red-500 hover:text-red-700">
                    <TrashIcon className="h-5 w-5" />
                </Button>
            </div>
        </div>
    </Card>
  );
};

const PropertyDetailView: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [owner, setOwner] = useState<Client | null>(null);

    useEffect(() => {
        if (propertyId) {
            const fetchedProperty = getPropertyById(propertyId);
            if (fetchedProperty) {
                setProperty(fetchedProperty);
                if (fetchedProperty.clientId) {
                    setOwner(getClientById(fetchedProperty.clientId) || null);
                }
            } else {
                navigate('/properties'); // Property not found
            }
        }
    }, [propertyId, navigate]);

    if (!property) return <LoadingSpinner fullPage text="Cargando propiedad..." />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl sm:text-3xl font-semibold text-secondary-800 break-all">{property.address}</h2>
                <Button onClick={() => navigate('/properties')} variant="secondary">Volver a Propiedades</Button>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <img 
                            src={(property.photos && property.photos[0]) || `https://picsum.photos/seed/${property.id}/600/400`} 
                            alt={property.address} 
                            className="w-full h-auto max-h-96 object-cover rounded-lg shadow-md"
                        />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-primary-700">{property.type}</h3>
                        <p className="text-2xl font-bold text-green-600">{property.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                        <div className="text-sm text-secondary-600 space-y-1">
                            {property.bedrooms && <p><strong>Habitaciones:</strong> {property.bedrooms}</p>}
                            {property.bathrooms && <p><strong>Baños:</strong> {property.bathrooms}</p>}
                            {property.areaSqMeters && <p><strong>Área:</strong> {property.areaSqMeters} m²</p>}
                        </div>
                        {owner && (
                            <p className="text-sm text-secondary-700">
                                <strong>Propietario:</strong> <Link to={`/clients/view/${owner.id}`} className="text-blue-600 hover:underline">{owner.name}</Link>
                            </p>
                        )}
                        {!owner && property.clientId && <p className="text-sm text-secondary-500">Propietario no encontrado (ID: {property.clientId})</p>}
                        {!property.clientId && <p className="text-sm text-secondary-500">Propiedad de la agencia / Sin propietario asignado.</p>}
                        <p className="text-xs text-secondary-400 mt-2">Registrada: {new Date(property.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                 <div className="mt-6 pt-4 border-t border-secondary-200">
                    <h4 className="text-md font-semibold text-secondary-700 mb-2">Descripción Detallada:</h4>
                    <p className="text-sm text-secondary-600 whitespace-pre-wrap">{property.description}</p>
                </div>
            </Card>
        </div>
    );
};


const PropertyListPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const navigate = useNavigate();

  const loadPropertiesAndClients = useCallback(() => {
    setProperties(getProperties());
    setClients(getClients());
  }, []);

  useEffect(() => {
    loadPropertiesAndClients();
  }, [loadPropertiesAndClients]);

  const handleSaveProperty = (property: Property) => {
    loadPropertiesAndClients();
    setShowModal(false);
    setEditingProperty(undefined);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowModal(true);
  };

  const handleDeleteProperty = (property: Property) => {
    setPropertyToDelete(property);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      deleteProperty(propertyToDelete.id);
      loadPropertiesAndClients();
      setPropertyToDelete(undefined);
    }
  };

  const handleViewDetails = (property: Property) => {
    navigate(`/properties/view/${property.id}`);
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return undefined;
    return clients.find(c => c.id === clientId)?.name;
  };

  const filteredProperties = properties.filter(prop => {
    const typeMatch = filterType ? prop.type === filterType : true;
    const searchMatch = searchTerm ? (
        prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(prop.clientId)?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;
    return typeMatch && searchMatch;
  }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const propertyTypeOptions = [{value: '', label: 'Todos los Tipos'}, ...Object.values(PropertyType).map(pt => ({ value: pt, label: pt }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-semibold text-secondary-800">Gestión de Propiedades</h2>
        <Button onClick={() => { setEditingProperty(undefined); setShowModal(true); }} variant="primary" leftIcon={<PlusIcon className="h-5 w-5" />}>
          Añadir Propiedad
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
            placeholder="Buscar (dirección, descripción, propietario)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
        <Select
            options={propertyTypeOptions}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            placeholder="Filtrar por tipo"
        />
      </div>


      {filteredProperties.length === 0 && !searchTerm && !filterType && (
         <div className="text-center py-10">
            <OfficeBuildingIcon className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600 text-lg">No hay propiedades registradas.</p>
            <p className="text-secondary-500">Empieza añadiendo tu primera propiedad.</p>
         </div>
      )}
       {filteredProperties.length === 0 && (searchTerm || filterType) && (
         <div className="text-center py-10">
            <p className="text-secondary-600 text-lg">No se encontraron propiedades con los filtros actuales.</p>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map(prop => (
          <PropertyCardDisplay
            key={prop.id}
            property={prop}
            onEdit={handleEditProperty}
            onDelete={handleDeleteProperty}
            onViewDetails={handleViewDetails}
            clientName={getClientName(prop.clientId)}
          />
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingProperty(undefined); }} title={editingProperty ? 'Editar Propiedad' : 'Añadir Nueva Propiedad'} size="lg">
        <PropertyForm
          property={editingProperty}
          onSave={handleSaveProperty}
          onCancel={() => { setShowModal(false); setEditingProperty(undefined); }}
        />
      </Modal>

      <Modal isOpen={!!propertyToDelete} onClose={() => setPropertyToDelete(undefined)} title="Confirmar Eliminación">
        <p>¿Estás seguro de que quieres eliminar la propiedad en <strong>{propertyToDelete?.address}</strong>? Esta acción no se puede deshacer.</p>
         <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setPropertyToDelete(undefined)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
};


export const PropertiesPage: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<PropertyListPage />} />
            <Route path="/view/:propertyId" element={<PropertyDetailView />} />
        </Routes>
    );
};
