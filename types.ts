
export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  createdAt: string;
}

export enum PropertyType {
  CASA = "Casa",
  APARTAMENTO = "Apartamento",
  TERRENO = "Terreno",
  LOCAL = "Local Comercial",
  OFICINA = "Oficina",
}

export interface Property {
  id: string;
  address: string;
  type: PropertyType;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqMeters?: number;
  description: string;
  photos?: string[]; // Array of image URLs
  clientId?: string; // Owner client ID
  createdAt: string;
}

export interface InteractionLog {
  id:string;
  clientId: string;
  propertyId?: string;
  type: 'Llamada' | 'Email' | 'WhatsApp' | 'Reunión' | 'Nota' | 'Messenger' | 'Email Campaign';
  notes: string;
  timestamp: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}

export interface EmailCampaign {
  id: string;
  name: string;
  targetClientIds: string[];
  emailSubject: string;
  emailBody: string;
  status: 'draft' | 'sent';
  createdAt: string;
  sentAt?: string;
  goal?: string; // User's goal for the campaign
  keyPoints?: string; // User's key points
  propertyId?: string; // Associated property
}

export interface PropertyValuationResult {
  valueRange: string; // e.g., "$100,000 - $120,000 USD"
  justification: string;
  sources: GroundingChunk[];
  rawResponse?: string; // For debugging or if parsing fails
}

export interface ScheduledAppointment {
  id: string;
  title: string; // e.g., "Visita a Casa Moderna"
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  fullDetails: string; // Full confirmation message from AI
  createdAt: string;
}

export interface LandingPageParams {
  objective: string;
  targetAudience: string;
  usp: string; // Unique Selling Proposition
  keyPoints: string[]; // Bullet points or key features
  agencyName: string;
  contactPhone?: string;
  contactEmail?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  ctaButtonTextOffer?: string; // e.g., "Ver Propiedades", "Agendar Cita"
  accentColor?: string; // Hex color
  language?: string; // e.g., "es-SV" (Spanish - El Salvador)
}

export interface LandingPageFeature {
  icon?: string; // Icon name (e.g., 'check', 'star', 'home')
  title: string;
  description: string;
}

export interface LandingPageProcessStep {
  icon?: string; // Icon name
  title: string;
  description: string;
}

export interface LandingPageContent {
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroCTALink?: string; // e.g., #contact
  offerTitle: string;
  offerBody: string;
  featuresTitle: string;
  features: LandingPageFeature[];
  processSectionTitle?: string;
  processSteps?: LandingPageProcessStep[];
  gallerySectionTitle?: string;
  // Gallery images will be placeholders in HTML, so no specific content needed from AI here yet
  testimonialSectionTitle: string; // Testimonials will be placeholders in HTML
  finalCtaHeadline: string;
  finalCtaSubheadline?: string;
  finalCtaButtonText: string;
  finalCTALink?: string; // e.g., #contact-form or external link
  formContactTitle?: string;
  footerText: string;
}