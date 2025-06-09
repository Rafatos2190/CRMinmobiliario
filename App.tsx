import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ClientsPage } from './components/clients/ClientsPage';
import { PropertiesPage } from './components/properties/PropertiesPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { AutomationsPage } from './components/automations/AutomationsPage';
import { EmailMarketingPage } from './components/emailmarketing/EmailMarketingPage';
import { AdCopywriterPage } from './components/adcopywriter/AdCopywriterPage';
import { PropertyValuatorPage } from './components/valuator/PropertyValuatorPage';
import { AiSchedulerPage } from './components/aischeduler/AiSchedulerPage';
import { AiFunnelPage } from './components/aifunnel/AiFunnelPage'; 
import { AiFunnelBuilderPage } from './components/aifunnelbuilder/AiFunnelBuilderPage';
import { PropertyFinderPage } from './components/propertyfinder/PropertyFinderPage'; // Nueva página Buscador de Inmuebles
import { MenuIcon, XIcon, HomeIcon, UsersIcon, OfficeBuildingIcon, LightBulbIcon, FacebookIcon, InstagramIcon, TikTokIcon, CogIcon, MailIcon, MegaphoneIcon, CalculatorIcon, CalendarSparkleIcon, FunnelIcon, PresentationChartLineIcon, MagnifyingGlassCircleIcon } from './constants'; // Añadido MagnifyingGlassCircleIcon

const NavLink: React.FC<{ to: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ to, children, icon }) => {
  const location = useLocation();
  // Simplified active check: true if the current path starts with the link's `to` prop.
  // For the dashboard ("/") specifically, it's only active if the path is exactly "/".
  const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out
                  ${isActive ? 'bg-primary-500 text-white' : 'text-secondary-700 hover:bg-primary-100 hover:text-primary-700'}`}
    >
      {icon && <span className="mr-3 h-5 w-5">{icon}</span>}
      {children}
    </Link>
  );
};

const ExternalNavLink: React.FC<{ href: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ href, children, icon }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out text-secondary-700 hover:bg-primary-100 hover:text-primary-700"
    >
      {icon && <span className="mr-3 h-5 w-5">{icon}</span>}
      {children}
    </a>
  );
};


const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKeyExists, setApiKeyExists] = useState(false);

  useEffect(() => {
    // This is a placeholder. In a real environment, process.env.API_KEY would be set.
    // For browser environment, this check is symbolic.
    // We'll assume for this demo that if it's not "undefined_API_KEY", it exists.
    if (process.env.API_KEY && process.env.API_KEY !== "undefined_API_KEY") {
      setApiKeyExists(true);
    } else {
       console.warn("API_KEY for Gemini might not be configured. AI features might be limited.");
       setApiKeyExists(true); // Optimistic for UI, geminiService will handle actual availability.
    }
  }, []);

  return (
    <HashRouter>
      <div className="flex h-screen bg-secondary-100 font-sans">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:block`}>
          <div className="flex items-center justify-between p-4 h-16 border-b">
            <div className="flex items-center">
              <LightBulbIcon className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-xl font-bold text-primary-700">CRM AI</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-secondary-600 hover:text-secondary-800">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <NavLink to="/" icon={<HomeIcon />}>Dashboard</NavLink>
            <NavLink to="/clients" icon={<UsersIcon />}>Clientes</NavLink>
            <NavLink to="/properties" icon={<OfficeBuildingIcon />}>Propiedades</NavLink>
            <NavLink to="/email-marketing" icon={<MailIcon />}>Email Marketing</NavLink>
            <NavLink to="/ad-copywriter" icon={<MegaphoneIcon />}>Anuncios IA</NavLink>
            <NavLink to="/property-valuator" icon={<CalculatorIcon />}>Valuador IA</NavLink>
            <NavLink to="/property-finder" icon={<MagnifyingGlassCircleIcon />}>Buscador Inmuebles</NavLink> {/* Nuevo Enlace Buscador */}
            <NavLink to="/ai-scheduler" icon={<CalendarSparkleIcon />}>Agente IA Citas</NavLink>
            <NavLink to="/ai-funnel" icon={<FunnelIcon />}>Captación IA</NavLink> 
            <NavLink to="/ai-funnel-builder" icon={<PresentationChartLineIcon />}>Constructor Embudos IA</NavLink>
            <NavLink to="/automations" icon={<CogIcon />}>Automatizaciones</NavLink> 
            
            <div className="pt-2 mt-2 border-t border-secondary-200"> {/* Separator */}
              <p className="px-4 py-2 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Redes Sociales</p>
              <ExternalNavLink href="https://facebook.com" icon={<FacebookIcon />}>Facebook</ExternalNavLink>
              <ExternalNavLink href="https://instagram.com" icon={<InstagramIcon />}>Instagram</ExternalNavLink>
              <ExternalNavLink href="https://tiktok.com" icon={<TikTokIcon />}>TikTok</ExternalNavLink>
            </div>
          </nav>
          {!apiKeyExists && (
             <div className="p-4 mt-auto">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded">
                    <p className="text-xs">Advertencia: API Key de Gemini no configurada. Funciones de IA pueden estar limitadas.</p>
                </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center justify-between h-16 px-6 bg-white border-b md:justify-end">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-secondary-600 hover:text-secondary-800">
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="text-secondary-700">Usuario Demo</div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-100 p-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clients/*" element={<ClientsPage />} />
              <Route path="/properties/*" element={<PropertiesPage />} />
              <Route path="/email-marketing/*" element={<EmailMarketingPage />} />
              <Route path="/ad-copywriter" element={<AdCopywriterPage />} />
              <Route path="/property-valuator" element={<PropertyValuatorPage />} />
              <Route path="/property-finder" element={<PropertyFinderPage />} /> {/* Nueva Ruta Buscador */}
              <Route path="/ai-scheduler" element={<AiSchedulerPage />} />
              <Route path="/ai-funnel" element={<AiFunnelPage />} />
              <Route path="/ai-funnel-builder" element={<AiFunnelBuilderPage />} />
              <Route path="/automations" element={<AutomationsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;