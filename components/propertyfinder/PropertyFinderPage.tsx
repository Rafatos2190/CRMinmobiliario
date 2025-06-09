import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { isGeminiAvailable, findOnlinePropertiesElSalvador } from '../../services/geminiService';
import { MagnifyingGlassCircleIcon, SparklesIcon } from '../../constants';
import { PropertyType, GroundingChunk } from '../../types';

interface SearchResult {
  title?: string;
  uri?: string;
  retrievedTitle?: string;
  retrievedUri?: string;
}

export const PropertyFinderPage: React.FC = () => {
  const [keywords, setKeywords] = useState<string>('');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
  const [location, setLocation] = useState<string>('');

  const [searchResults, setSearchResults] = useState<GroundingChunk[]>([]);
  const [searchSummary, setSearchSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [geminiReady, setGeminiReady] = useState<boolean>(false);

  useEffect(() => {
    setGeminiReady(isGeminiAvailable());
  }, []);

  const propertyTypeOptions = [
    { value: '', label: 'Cualquier Tipo' },
    ...Object.values(PropertyType).map(pt => ({ value: pt, label: pt }))
  ];

  const validateInputs = (): boolean => {
    if (!keywords.trim()) {
      setError('Por favor, ingresa palabras clave para tu búsqueda (ej: "casa con piscina", "apartamento céntrico").');
      return false;
    }
    setError('');
    return true;
  };

  const handleSearchProperties = async () => {
    if (!validateInputs()) return;
    if (!geminiReady) {
      setError("El servicio de IA no está disponible. Verifique la configuración de la API Key de Gemini.");
      return;
    }

    setIsLoading(true);
    setSearchResults([]);
    setSearchSummary('');
    setError('');

    try {
      const result = await findOnlinePropertiesElSalvador(
        keywords,
        propertyType || undefined,
        location
      );
      setSearchSummary(result.summary);
      setSearchResults(result.sources);
      if (result.sources.length === 0 && !result.summary.toLowerCase().includes("error")) {
        setSearchSummary("No se encontraron resultados directos para tu búsqueda. Intenta con criterios más amplios o diferentes palabras clave.");
      }
    } catch (e) {
      console.error("Error searching for online properties:", e);
      setError(e instanceof Error ? e.message : "Ocurrió un error al buscar propiedades.");
      setSearchSummary('');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <MagnifyingGlassCircleIcon className="h-8 w-8 text-primary-600" />
        <h2 className="text-3xl font-semibold text-secondary-800">Buscador de Inmuebles en Línea (El Salvador)</h2>
      </div>

      {!geminiReady && (
        <Card>
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-bold">Servicio de IA no disponible</p>
            <p>Esta función requiere una API Key de Gemini válida y configurada para realizar búsquedas en línea.</p>
          </div>
        </Card>
      )}
      
      <p className="text-sm text-secondary-600">
        Ingresa tus criterios de búsqueda y la IA buscará propiedades disponibles en portales y sitios web de El Salvador, 
        incluyendo intentos de búsqueda en Facebook Marketplace, Instagram y TikTok a través de Google.
        La IA intentará priorizar anuncios de los últimos tres meses, aunque esto no siempre es posible de determinar con exactitud.
      </p>

      <Card title="Criterios de Búsqueda">
        <div className="space-y-4">
          <Input
            label="Palabras Clave"
            id="finder-keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Ej: casa con jardín y piscina, apartamento moderno, terreno comercial"
            disabled={!geminiReady || isLoading}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Propiedad (Opcional)"
              id="finder-type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType | '')}
              options={propertyTypeOptions}
              disabled={!geminiReady || isLoading}
            />
            <Input
              label="Zona / Ubicación Específica (Opcional)"
              id="finder-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: San Benito, Santa Tecla, Antiguo Cuscatlán"
              disabled={!geminiReady || isLoading}
            />
          </div>
            
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            onClick={handleSearchProperties}
            isLoading={isLoading}
            disabled={!geminiReady || isLoading}
            leftIcon={<SparklesIcon className="h-5 w-5" />}
            className="w-full"
          >
            {isLoading ? 'Buscando Inmuebles...' : 'Buscar Inmuebles con IA'}
          </Button>
        </div>
      </Card>

      {(isLoading || searchResults.length > 0 || searchSummary) && (
        <Card title="Resultados de la Búsqueda IA">
          {isLoading && <LoadingSpinner text="IA buscando propiedades en línea..." />}
          
          {!isLoading && searchSummary && (
            <div className="mb-4 p-3 bg-primary-50 text-primary-700 rounded-md text-sm">
                <p className="font-semibold">Resumen de la IA:</p>
                <p className="whitespace-pre-wrap">{searchSummary}</p>
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <div className="space-y-4">
              {searchResults.map((source, index) => {
                const item: SearchResult = {};
                if (source.web) {
                    item.title = source.web.title;
                    item.uri = source.web.uri;
                } else if (source.retrievedContext) {
                    item.retrievedTitle = source.retrievedContext.title;
                    item.retrievedUri = source.retrievedContext.uri;
                }
                const displayTitle = item.title || item.retrievedTitle || "Fuente Desconocida";
                const displayUri = item.uri || item.retrievedUri;

                return (
                  <div key={index} className="p-4 border border-secondary-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-primary-700 break-words">{displayTitle}</h4>
                    {displayUri && (
                      <a 
                        href={displayUri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all block mt-1"
                      >
                        {displayUri}
                      </a>
                    )}
                    {!displayUri && <p className="text-sm text-secondary-500 mt-1">No hay URI disponible para esta fuente.</p>}
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-6 text-xs text-secondary-500 text-center">
            Descargo de Responsabilidad: Esta herramienta utiliza IA para buscar información pública en la web (incluyendo intentos de búsqueda en Facebook Marketplace, Instagram y TikTok). 
            Los resultados son enlaces a sitios externos y su contenido no es gestionado por este CRM. 
            La disponibilidad, detalle y acceso a la información de plataformas sociales pueden ser limitados y dependen de las fuentes externas.
            La priorización por fecha es un intento y no se garantiza que todos los resultados sean recientes debido a la variabilidad de la información en línea.
          </p>
        </Card>
      )}
    </div>
  );
};