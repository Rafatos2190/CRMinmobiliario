
import { Client, Property, InteractionLog, EmailCampaign, ScheduledAppointment } from '../types';

const CLIENTS_KEY = 'crm_clients';
const PROPERTIES_KEY = 'crm_properties';
const INTERACTIONS_KEY = 'crm_interactions';
const EMAIL_CAMPAIGNS_KEY = 'crm_email_campaigns';
const SCHEDULED_APPOINTMENTS_KEY = 'crm_scheduled_appointments';

const getFromStorage = <T,>(key: string): T[] => {
  const itemsJSON = localStorage.getItem(key);
  return itemsJSON ? JSON.parse(itemsJSON) : [];
};

const saveToStorage = <T,>(key: string, items: T[]): void => {
  localStorage.setItem(key, JSON.stringify(items));
};

// Client Functions
export const getClients = (): Client[] => getFromStorage<Client>(CLIENTS_KEY);

export const getClientById = (id: string): Client | undefined => {
  return getClients().find(client => client.id === id);
};

export const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
  const clients = getClients();
  const newClient: Client = {
    ...clientData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  clients.push(newClient);
  saveToStorage(CLIENTS_KEY, clients);
  return newClient;
};

export const updateClient = (id: string, updates: Partial<Client>): Client | undefined => {
  const clients = getClients();
  const clientIndex = clients.findIndex(c => c.id === id);
  if (clientIndex === -1) return undefined;
  clients[clientIndex] = { ...clients[clientIndex], ...updates };
  saveToStorage(CLIENTS_KEY, clients);
  return clients[clientIndex];
};

export const deleteClient = (id: string): boolean => {
  let clients = getClients();
  const initialLength = clients.length;
  clients = clients.filter(c => c.id !== id);
  // Also delete associated properties and interactions
  let properties = getProperties().filter(p => p.clientId !== id);
  saveToStorage(PROPERTIES_KEY, properties);
  let interactions = getInteractionLogs().filter(i => i.clientId !== id);
  saveToStorage(INTERACTIONS_KEY, interactions);
  // Also remove client from email campaigns
  let campaigns = getEmailCampaigns();
  campaigns.forEach(campaign => {
    campaign.targetClientIds = campaign.targetClientIds.filter(clientId => clientId !== id);
  });
  saveToStorage(EMAIL_CAMPAIGNS_KEY, campaigns);


  if (clients.length < initialLength) {
    saveToStorage(CLIENTS_KEY, clients);
    return true;
  }
  return false;
};

// Property Functions
export const getProperties = (): Property[] => getFromStorage<Property>(PROPERTIES_KEY);

export const getPropertyById = (id: string): Property | undefined => {
  return getProperties().find(property => property.id === id);
};

export const addProperty = (propertyData: Omit<Property, 'id' | 'createdAt'>): Property => {
  const properties = getProperties();
  const newProperty: Property = {
    ...propertyData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    photos: propertyData.photos || [`https://picsum.photos/seed/${crypto.randomUUID()}/400/300`], // Default photo
  };
  properties.push(newProperty);
  saveToStorage(PROPERTIES_KEY, properties);
  return newProperty;
};

export const updateProperty = (id: string, updates: Partial<Property>): Property | undefined => {
  const properties = getProperties();
  const propertyIndex = properties.findIndex(p => p.id === id);
  if (propertyIndex === -1) return undefined;
  properties[propertyIndex] = { ...properties[propertyIndex], ...updates };
  saveToStorage(PROPERTIES_KEY, properties);
  return properties[propertyIndex];
};

export const deleteProperty = (id: string): boolean => {
  let properties = getProperties();
  const initialLength = properties.length;
  properties = properties.filter(p => p.id !== id);
  // Also delete associated interactions
  let interactions = getInteractionLogs().filter(i => i.propertyId === id);
  saveToStorage(INTERACTIONS_KEY, interactions);
   // Also remove property from email campaigns
  let campaigns = getEmailCampaigns();
  campaigns.forEach(campaign => {
    if (campaign.propertyId === id) {
        campaign.propertyId = undefined; // Or handle as needed
    }
  });
  saveToStorage(EMAIL_CAMPAIGNS_KEY, campaigns);


  if (properties.length < initialLength) {
    saveToStorage(PROPERTIES_KEY, properties);
    return true;
  }
  return false;
};

// Interaction Log Functions
export const getInteractionLogs = (): InteractionLog[] => getFromStorage<InteractionLog>(INTERACTIONS_KEY);

export const getInteractionLogsForClient = (clientId: string): InteractionLog[] => {
  return getInteractionLogs().filter(log => log.clientId === clientId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addInteractionLog = (logData: Omit<InteractionLog, 'id' | 'timestamp'>): InteractionLog => {
  const logs = getInteractionLogs();
  const newLog: InteractionLog = {
    ...logData,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  logs.push(newLog);
  saveToStorage(INTERACTIONS_KEY, logs);
  return newLog;
};

// Email Campaign Functions
export const getEmailCampaigns = (): EmailCampaign[] => getFromStorage<EmailCampaign>(EMAIL_CAMPAIGNS_KEY);

export const getEmailCampaignById = (id: string): EmailCampaign | undefined => {
  return getEmailCampaigns().find(campaign => campaign.id === id);
};

export const addEmailCampaign = (campaignData: Omit<EmailCampaign, 'id' | 'createdAt' | 'status'>): EmailCampaign => {
  const campaigns = getEmailCampaigns();
  const newCampaign: EmailCampaign = {
    ...campaignData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'draft',
  };
  campaigns.push(newCampaign);
  saveToStorage(EMAIL_CAMPAIGNS_KEY, campaigns);
  return newCampaign;
};

export const updateEmailCampaign = (id: string, updates: Partial<EmailCampaign>): EmailCampaign | undefined => {
  const campaigns = getEmailCampaigns();
  const campaignIndex = campaigns.findIndex(c => c.id === id);
  if (campaignIndex === -1) return undefined;
  
  const originalCampaign = campaigns[campaignIndex];
  campaigns[campaignIndex] = { ...originalCampaign, ...updates };
  
  // If status changes to 'sent' and sentAt is not already set
  if (updates.status === 'sent' && !originalCampaign.sentAt) {
    campaigns[campaignIndex].sentAt = new Date().toISOString();
  }

  saveToStorage(EMAIL_CAMPAIGNS_KEY, campaigns);
  return campaigns[campaignIndex];
};

export const deleteEmailCampaign = (id: string): boolean => {
  let campaigns = getEmailCampaigns();
  const initialLength = campaigns.length;
  campaigns = campaigns.filter(c => c.id !== id);
  if (campaigns.length < initialLength) {
    saveToStorage(EMAIL_CAMPAIGNS_KEY, campaigns);
    return true;
  }
  return false;
};

// Scheduled Appointment Functions
export const getScheduledAppointments = (): ScheduledAppointment[] => {
  const appointments = getFromStorage<ScheduledAppointment>(SCHEDULED_APPOINTMENTS_KEY);
  // Sort by date and time
  return appointments.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
};

export const addScheduledAppointment = (appointmentData: Omit<ScheduledAppointment, 'id' | 'createdAt'>): ScheduledAppointment => {
  const appointments = getScheduledAppointments();
  const newAppointment: ScheduledAppointment = {
    ...appointmentData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  appointments.push(newAppointment);
  saveToStorage(SCHEDULED_APPOINTMENTS_KEY, appointments);
  return newAppointment;
};

export const deleteScheduledAppointment = (id: string): boolean => {
  let appointments = getScheduledAppointments();
  const initialLength = appointments.length;
  appointments = appointments.filter(app => app.id !== id);
  if (appointments.length < initialLength) {
    saveToStorage(SCHEDULED_APPOINTMENTS_KEY, appointments);
    return true;
  }
  return false;
};
