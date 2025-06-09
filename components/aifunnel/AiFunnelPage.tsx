
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Select } from '../common/Select';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { FunnelIcon, SparklesIcon } from '../../constants';
import { PropertyType, Client } from '../../types';
import { isGeminiAvailable, generatePropertyListingOffer } from '../../services/geminiService';
import { addClient } from '../../services/dataService';

export const AiFunnelPage: React.FC = () => {
  const [geminiReady, setGeminiReady] = useState(false);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  
  const [agencyName, setAgencyName] = useState('Tu Inmobiliaria Ideal');
  const [serviceFocus, setServiceFocus] = useState('venta rápida y eficiente al mejor precio, utilizando marketing digital de vanguardia');
  const [generatedOffer, setGeneratedOffer] = useState('');
  const [offerError, setOfferError] = useState('');

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.CASA);
  const [ownerMessage, setOwnerMessage] = useState('');
  
  const [formErrors, setFormErrors] = useState<any>({});
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    setGeminiReady(isGeminiAvailable());
    if (isGeminiAvailable() && !generatedOffer) { // Auto-generate initial offer if none exists
        handleGenerateOffer();
    }
  }, []);

  const handleGenerateOffer = async () => {
    if (!geminiReady) {
      setOfferError("El servicio de IA no está disponible. Verifique la configuración de la API Key.");
      return;
    }
    if (!agencyName.trim() || !serviceFocus.trim()) {
      setOfferError("Por favor, ingrese el nombre de la agencia y su enfoque de servicio.");
      return;
    }
    setIsLoadingOffer(true);
    setOfferError('');
    try {
      const offer = await generatePropertyListingOffer(agencyName, serviceFocus);
      setGeneratedOffer(offer);
    } catch (e) {
      setOfferError(e instanceof Error ? e.message : "Error al generar la oferta.");
      setGeneratedOffer('');
    } finally {
      setIsLoadingOffer(false);
    }
  };

  const validateForm = () => {
    const errors: any = {};
    if (!ownerName.trim()) errors.ownerName = 'El nombre del propietario es obligatorio.';
    if (!ownerPhone.trim()) errors.ownerPhone = 'El teléfono de contacto es obligatorio.';
    else if (!/^[0-9+\-\s()]*$/.test(ownerPhone)) errors.ownerPhone = 'El formato del teléfono no es válido.';
    if (ownerEmail.trim() && !/\S+@\S+\.\S+/.test(ownerEmail)) errors.ownerEmail = 'El email no es válido.';
    if (!propertyAddress.trim()) errors.propertyAddress = 'La dirección de la propiedad es obligatoria.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoadingForm(true);
    setFormSuccess('');
    setFormErrors({});

    const clientNotes = `
Lead de Captación IA.
Propiedad Ofrecida:
- Dirección: ${propertyAddress}
- Tipo: ${propertyType}
Mensaje del Propietario: ${ownerMessage || 'Ninguno'}
Oferta IA Presentada (primeros 100 caracteres): ${generatedOffer.substring(0,100)}${generatedOffer.length > 100 ? '...' : ''}
    `.trim();

    try {
      addClient({
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail,
        notes: clientNotes,
      });
      setFormSuccess('¡Gracias! Hemos recibido tu información. Un asesor se pondrá en contacto contigo pronto.');
      // Reset form fields
      setOwnerName('');
      setOwnerPhone('');
      setOwnerEmail('');
      setPropertyAddress('');
      setPropertyType(PropertyType.CASA);
      setOwnerMessage('');
    } catch (error) {
      console.error("Error saving lead:", error);
      setFormErrors({ submit: 'No se pudo guardar la información. Inténtalo de nuevo más tarde.' });
    } finally {
      setIsLoadingForm(false);
    }
  };

  const propertyTypeOptions = Object.values(PropertyType).map(pt => ({ value: pt, label: pt }));

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <FunnelIcon className="h-8 w-8 text-primary-600" />
        <h2 className="text-3xl font-semibold text-secondary-800">Captación Inteligente de Propiedades</h2>
      </div>

      {!geminiReady && (
        <Card>
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-bold">Servicio de IA no disponible</p>
            <p>Las funciones de generación de oferta y captación inteligente requieren una API Key de Gemini válida.</p>
          </div>
        </Card>
      )}

      <Card title="Oferta de Servicios Potenciada por IA">
        <p className="text-sm text-secondary-600 mb-4">
          Personaliza y genera una oferta atractiva para convencer a los propietarios de listar sus inmuebles contigo.
        </p>
        <div className="space-y-4">
          <Input 
            label="Nombre de tu Agencia (para personalizar la oferta)" 
            id="agency-name"
            value={agencyName} 
            onChange={e => setAgencyName(e.target.value)}
            disabled={!geminiReady || isLoadingOffer}
          />
          <TextArea 
            label="Enfoque Principal de tus Servicios (para personalizar la oferta)" 
            id="service-focus"
            value={serviceFocus} 
            onChange={e => setServiceFocus(e.target.value)}
            rows={2}
            placeholder="Ej: venta rápida y eficiente, alquileres de lujo, administración de propiedades..."
            disabled={!geminiReady || isLoadingOffer}
          />
          {offerError && <p className="text-sm text-red-600">{offerError}</p>}
          <Button 
            onClick={handleGenerateOffer} 
            isLoading={isLoadingOffer} 
            disabled={!geminiReady || isLoadingOffer}
            leftIcon={<SparklesIcon className="h-5 w-5" />}
          >
            {isLoadingOffer ? 'Generando Oferta...' : 'Generar / Refinar Oferta con IA'}
          </Button>
          {generatedOffer && (
            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
              <h4 className="font-semibold text-primary-700 mb-2">Oferta Generada:</h4>
              <p className="text-secondary-700 whitespace-pre-wrap">{generatedOffer}</p>
            </div>
          )}
          {isLoadingOffer && <LoadingSpinner text="IA preparando la oferta..." className="mt-2" />}
        </div>
      </Card>

      <Card title="¿Eres Propietario? Contáctanos para Vender o Alquilar tu Inmueble">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input 
            label="Nombre Completo del Propietario" 
            id="owner-name"
            value={ownerName}
            onChange={e => setOwnerName(e.target.value)}
            error={formErrors.ownerName}
            required
            disabled={isLoadingForm}
          />
          <Input 
            label="Teléfono de Contacto" 
            id="owner-phone"
            type="tel"
            value={ownerPhone}
            onChange={e => setOwnerPhone(e.target.value)}
            error={formErrors.ownerPhone}
            required
            disabled={isLoadingForm}
          />
          <Input 
            label="Email (Opcional)" 
            id="owner-email"
            type="email"
            value={ownerEmail}
            onChange={e => setOwnerEmail(e.target.value)}
            error={formErrors.ownerEmail}
            disabled={isLoadingForm}
          />
          <Input 
            label="Dirección de la Propiedad" 
            id="property-address"
            value={propertyAddress}
            onChange={e => setPropertyAddress(e.target.value)}
            error={formErrors.propertyAddress}
            required
            disabled={isLoadingForm}
            placeholder="Ej: Calle Las Magnolias #123, Ciudad Merliot"
          />
          <Select 
            label="Tipo de Propiedad" 
            id="property-type"
            value={propertyType}
            onChange={e => setPropertyType(e.target.value as PropertyType)}
            options={propertyTypeOptions}
            required
            disabled={isLoadingForm}
          />
          <TextArea 
            label="Mensaje Adicional (Opcional)" 
            id="owner-message"
            value={ownerMessage}
            onChange={e => setOwnerMessage(e.target.value)}
            rows={3}
            placeholder="Ej: Mejor horario para contactar, detalles específicos de la propiedad..."
            disabled={isLoadingForm}
          />

          {formSuccess && <p className="text-sm text-green-600 p-3 bg-green-50 rounded-md">{formSuccess}</p>}
          {formErrors.submit && <p className="text-sm text-red-600">{formErrors.submit}</p>}
          
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoadingForm} 
            disabled={isLoadingForm}
            className="w-full"
          >
            {isLoadingForm ? 'Enviando Información...' : 'Enviar Información y Solicitar Contacto'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
