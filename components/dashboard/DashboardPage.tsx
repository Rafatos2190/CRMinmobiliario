
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { UsersIcon, OfficeBuildingIcon, SparklesIcon, PlusIcon } from '../../constants';
import { getClients, getProperties } from '../../services/dataService';
import { getMarketAnalysis, isGeminiAvailable } from '../../services/geminiService';
import { Client, Property, PropertyType, GroundingChunk } from '../../types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string; // Tailwind bg color class e.g. bg-blue-500
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} text-white mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-secondary-600 font-medium">{title}</p>
        <p className="text-2xl font-semibold text-secondary-800">{value}</p>
      </div>
    </div>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<string>('');
  const [marketAnalysisSources, setMarketAnalysisSources] = useState<GroundingChunk[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const geminiReady = isGeminiAvailable();

  useEffect(() => {
    setClients(getClients());
    setProperties(getProperties());
  }, []);

  const fetchMarketAnalysis = async () => {
    if (!geminiReady) {
        setMarketAnalysis("El servicio de IA no está disponible. Verifique la configuración de la API Key de Gemini.");
        return;
    }
    setLoadingAnalysis(true);
    setMarketAnalysis('');
    setMarketAnalysisSources([]);
    try {
      // Example: Analyze market for 'Apartamento' in 'Ciudad Principal'
      const result = await getMarketAnalysis('Madrid', PropertyType.APARTAMENTO);
      setMarketAnalysis(result.analysis);
      setMarketAnalysisSources(result.sources);
    } catch (error) {
      console.error("Failed to fetch market analysis:", error);
      setMarketAnalysis("No se pudo obtener el análisis de mercado en este momento.");
    } finally {
      setLoadingAnalysis(false);
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-secondary-800">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Clientes" value={clients.length} icon={<UsersIcon className="h-6 w-6" />} color="bg-sky-500" />
        <StatCard title="Total Propiedades" value={properties.length} icon={<OfficeBuildingIcon className="h-6 w-6" />} color="bg-lime-500" />
        <StatCard title="Análisis IA" value={geminiReady ? "Activo" : "Inactivo"} icon={<SparklesIcon className="h-6 w-6" />} color={geminiReady ? "bg-violet-500" : "bg-slate-400"} />
      </div>

      {/* Quick Actions */}
      <Card title="Acciones Rápidas">
        <div className="flex flex-wrap gap-4">
          <Link to="/clients/new">
            <Button variant="primary" leftIcon={<PlusIcon className="h-5 w-5" />}>Nuevo Cliente</Button>
          </Link>
          <Link to="/properties/new">
            <Button variant="primary" leftIcon={<PlusIcon className="h-5 w-5" />}>Nueva Propiedad</Button>
          </Link>
        </div>
      </Card>
      
      {/* AI Market Analysis Section */}
      {geminiReady && (
        <Card title="Análisis de Mercado con IA (Ejemplo)">
            <div className="space-y-4">
            <p className="text-sm text-secondary-600">
                Obtenga un análisis de mercado para apartamentos en Madrid (esto es un ejemplo, podría ser configurable).
            </p>
            <Button onClick={fetchMarketAnalysis} isLoading={loadingAnalysis} disabled={!geminiReady || loadingAnalysis}>
                {loadingAnalysis ? "Generando Análisis..." : "Obtener Análisis de Mercado"}
            </Button>
            {loadingAnalysis && <LoadingSpinner text="Consultando a Gemini..." />}
            {marketAnalysis && (
                <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <h4 className="font-semibold text-secondary-700 mb-2">Resultado del Análisis:</h4>
                <p className="text-sm text-secondary-600 whitespace-pre-wrap">{marketAnalysis}</p>
                {marketAnalysisSources.length > 0 && (
                    <div className="mt-3">
                    <h5 className="text-xs font-semibold text-secondary-500 mb-1">Fuentes (Google Search):</h5>
                    <ul className="list-disc list-inside space-y-1">
                        {marketAnalysisSources.map((source, index) => (
                        <li key={index} className="text-xs">
                            {source.web && <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{source.web.title || source.web.uri}</a>}
                            {source.retrievedContext && <span className="text-secondary-500">Contexto recuperado: {source.retrievedContext.title || source.retrievedContext.uri}</span>}
                        </li>
                        ))}
                    </ul>
                    </div>
                )}
                </div>
            )}
            {!geminiReady && <p className="text-sm text-red-600 mt-2">Servicio de IA no disponible.</p>}
            </div>
        </Card>
      )}

      {/* Recent Activity (Placeholder) */}
      <Card title="Actividad Reciente">
        <p className="text-secondary-600">
          {clients.length > 0 ? `Último cliente añadido: ${clients[clients.length-1]?.name}` : "No hay clientes aún."}
        </p>
         <p className="text-secondary-600 mt-2">
          {properties.length > 0 ? `Última propiedad añadida: ${properties[properties.length-1]?.address}` : "No hay propiedades aún."}
        </p>
        <p className="text-secondary-500 italic mt-4">Próximamente: listado detallado de actividad.</p>
      </Card>
    </div>
  );
};
