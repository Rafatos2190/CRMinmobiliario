
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
// import { Select } from '../common/Select'; // Not used in this version
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PresentationChartLineIcon, SparklesIcon, ClipboardIcon } from '../../constants';
import { isGeminiAvailable, generateRealEstateLandingPageContent } from '../../services/geminiService';
import { LandingPageParams, LandingPageContent, LandingPageFeature, LandingPageProcessStep } from '../../types';

const defaultAccentColor = '#3b82f6'; // Tailwind's primary-500

const getTailwindConfigForPreview = () => {
  return `
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
            secondary: {"50":"#f8fafc","100":"#f1f5f9","200":"#e2e8f0","300":"#cbd5e1","400":"#94a3b8","500":"#64748b","600":"#475569","700":"#334155","800":"#1e293b","900":"#0f172a","950":"#020617"},
            accent: '{{accentColor}}',
          }
        }
      }
    }
  `;
};

// Helper to get simple SVG icons, expanded for more modern look
const getIconSVG = (iconName?: string, className: string = "w-10 h-10"): string => {
  if (!iconName) return '';
  const commonAttrs = `class="${className}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"`;
  
  switch (iconName.toLowerCase()) {
    case 'check': case 'check-circle':
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    case 'star':
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.725-2.885a.563.563 0 00-.652 0l-4.725 2.885a.562.562 0 01-.82-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>`;
    case 'home':
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M11.25 18V12.75a.75.75 0 01.75-.75h0a.75.75 0 01.75.75V18m-11.25 0h11.25m-11.25 0V9.75M12 9.75V3.75m0 6V9.75m6 9V9.75M12 9.75L18 3.75m-6 6L6 3.75" /></svg>`;
    case 'key':
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v-2.25L6.977 13.72a6.002 6.002 0 015.912-7.029c.097-.562-.026-1.159-.43-1.563L10.5 4.5h2.25L17.25 2.023a.75.75 0 01.91.688V5.25z" /></svg>`;
    case 'users': case 'group':
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.074M15 15.75a3 3 0 11-6 0 3 3 0 016 0zm6 3.75a3 3 0 11-6 0 3 3 0 016 0zM12 12.75a3 3 0 11-6 0 3 3 0 016 0zM15 6.75a3 3 0 11-6 0 3 3 0 016 0zm-3-3.75a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0112 3zm0 15a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM6 12a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75A.75.75 0 016 12zm0 0a.75.75 0 00-.75-.75H4.5a.75.75 0 000 1.5h.75A.75.75 0 006 12zm12 0a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zm0 0a.75.75 0 00-.75-.75h-.75a.75.75 0 000 1.5h.75a.75.75 0 00.75-.75z" /></svg>`;
    case 'map-pin':
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>`;
    case 'briefcase':
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.25V7.5c0-1.023-.827-1.851-1.851-1.851H5.601C4.577 5.65 3.75 6.477 3.75 7.5v6.75m16.5 0H3.75m16.5 0v3.75c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18v-3.75m16.5-1.5V12a1.125 1.125 0 00-1.125-1.125H4.875A1.125 1.125 0 003.75 12v.75" /></svg>`;
    case 'search': case 'magnifying-glass':
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>`;
    case 'handshake':
        return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M12.75 8.25l-2.518 2.518L6.75 7.5m10.5 5.25l-2.518-2.518L10.5 13.5M5.25 15.75l1.096 1.096A1.5 1.5 0 007.5 17.25h.063c.27 0 .53-.105.724-.296L12 13.5l3.61 3.61a1.5 1.5 0 002.122 0l1.096-1.096M15 11.25a3 3 0 11-6 0 3 3 0 016 0zM4.035 17.062A8.956 8.956 0 013 12.75c0-2.486.99-4.735 2.614-6.36M21.386 7.636A8.956 8.956 0 0012 3c-2.486 0-4.735.99-6.36 2.614m12.72 12.72A8.956 8.956 0 0112 21c-2.486 0-4.735-.99-6.36-2.614" /></svg>`;
    case 'building':
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6m-6 4.5h6M9 18.75h6" /></svg>`;
    case 'lightbulb':
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.375V16.5m0-12.75V3.75m0 12.75A5.625 5.625 0 0112 3.75a5.625 5.625 0 015.625 5.625c0 1.97-1.006 3.758-2.512 4.853A5.632 5.632 0 0012 18.375zm0-5.625a3 3 0 100-6 3 3 0 000 6z" /></svg>`;
    default:
      return `<svg ${commonAttrs}><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v17.792M6 6.375h12m-12 0a2.25 2.25 0 01-2.25-2.25V3.75c0-.98.795-1.758 1.77-1.831A6.002 6.002 0 0112 1.5c2.148 0 4.07.973 5.378 2.508a2.25 2.25 0 011.872 2.083v.375a2.25 2.25 0 01-2.25 2.25H6zm0 0v1.875m12-1.875v1.875m0 0H6.001M6.001 12h12m-8.25 4.125h4.5M6 20.25h12" /></svg>`; // Question mark block as default
  }
};


const generateLandingPageHTML = (content: LandingPageContent, params: LandingPageParams): string => {
  const accentColor = params.accentColor || defaultAccentColor;
  
  const renderItemCard = (item: LandingPageFeature | LandingPageProcessStep, index: number, section: 'features' | 'process') => `
    <div class="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div class="flex items-center mb-4">
        ${item.icon ? `<span class="text-accent mr-4">${getIconSVG(item.icon, 'w-8 h-8 md:w-10 md:h-10 text-accent')}</span>` : 
                      (section === 'process' ? `<span class="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-accent text-white rounded-full font-bold text-lg mr-4">${index + 1}</span>` : '')}
        <h3 class="text-xl md:text-2xl font-semibold text-secondary-800">${item.title}</h3>
      </div>
      <p class="text-secondary-600 text-sm md:text-base">${item.description}</p>
    </div>
  `;

  const featuresHTML = content.features?.map((feature, index) => renderItemCard(feature, index, 'features')).join('') || '<p class="text-secondary-500 col-span-full text-center">Beneficios y características se mostrarán aquí.</p>';
  
  const processStepsHTML = content.processSteps?.map((step, index) => renderItemCard(step, index, 'process')).join('') || '';

  const socialLinksHTML = params.socialLinks ? `
    <div class="flex justify-center space-x-6 mt-6">
      ${params.socialLinks.facebook ? `<a href="${params.socialLinks.facebook}" target="_blank" class="text-secondary-300 hover:text-accent transition-colors" aria-label="Facebook">${getIconSVG('facebook', 'w-6 h-6')}</a>` : ''}
      ${params.socialLinks.instagram ? `<a href="${params.socialLinks.instagram}" target="_blank" class="text-secondary-300 hover:text-accent transition-colors" aria-label="Instagram">${getIconSVG('instagram', 'w-6 h-6')}</a>` : ''}
      ${params.socialLinks.tiktok ? `<a href="${params.socialLinks.tiktok}" target="_blank" class="text-secondary-300 hover:text-accent transition-colors" aria-label="TikTok">${getIconSVG('tiktok', 'w-6 h-6')}</a>` : ''}
      ${params.socialLinks.whatsapp ? `<a href="https://wa.me/${params.socialLinks.whatsapp.replace(/\D/g, '')}" target="_blank" class="text-secondary-300 hover:text-accent transition-colors" aria-label="WhatsApp">${getIconSVG('whatsapp', 'w-6 h-6')}</a>` : ''}
    </div>
  ` : '';
  
  const contactFormHTML = `
    <form id="contact-form" class="space-y-6 mt-8">
      <div>
        <label for="lp-name" class="block text-sm font-medium text-secondary-700 mb-1">Nombre Completo</label>
        <input type="text" name="lp-name" id="lp-name" class="mt-1 block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-colors" placeholder="Tu Nombre y Apellido">
      </div>
      <div>
        <label for="lp-email" class="block text-sm font-medium text-secondary-700 mb-1">Correo Electrónico</label>
        <input type="email" name="lp-email" id="lp-email" class="mt-1 block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-colors" placeholder="tu.correo@ejemplo.com">
      </div>
      <div>
        <label for="lp-phone" class="block text-sm font-medium text-secondary-700 mb-1">Teléfono (Opcional)</label>
        <input type="tel" name="lp-phone" id="lp-phone" class="mt-1 block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-colors" placeholder="+503 7XXX XXXX">
      </div>
      <div>
        <label for="lp-message" class="block text-sm font-medium text-secondary-700 mb-1">Mensaje (Opcional)</label>
        <textarea id="lp-message" name="lp-message" rows="4" class="mt-1 block w-full px-4 py-3 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-colors" placeholder="Estoy interesado en conocer más sobre sus servicios..."></textarea>
      </div>
    </form>
  `;

  const galleryHTML = content.gallerySectionTitle ? `
    <section id="gallery" class="py-16 md:py-20 bg-white">
      <div class="container mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-secondary-800 text-center mb-12">${content.gallerySectionTitle}</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          ${[1, 2, 3, 4, 5, 6].map(i => `
            <div class="aspect-square bg-secondary-200 rounded-lg shadow-md overflow-hidden">
              <img src="https://picsum.photos/seed/prop${i}/600/600" alt="Propiedad destacada ${i}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';
  
  const processHTML = content.processSectionTitle && content.processSteps && content.processSteps.length > 0 ? `
    <section id="process" class="py-16 md:py-20 bg-secondary-100">
      <div class="container mx-auto px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-secondary-800 text-center mb-12">${content.processSectionTitle}</h2>
        <div class="grid md:grid-cols-${Math.min(content.processSteps.length, 3)} gap-8">
          ${processStepsHTML}
        </div>
      </div>
    </section>
  ` : '';


  return `
    <!DOCTYPE html>
    <html lang="${params.language || 'es'}" class="scroll-smooth">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${params.agencyName} - ${content.heroHeadline}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        ${getTailwindConfigForPreview().replace('{{accentColor}}', accentColor)}
      </script>
      <style>
        body { font-family: 'Inter', sans-serif; /* A more modern sans-serif font */ }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .hero-bg { background-image: url('https://picsum.photos/seed/modernhome/1920/1080'); background-size: cover; background-position: center; }
        .btn-accent { background-color: ${accentColor}; color: white; }
        .btn-accent:hover { filter: brightness(110%); }
        .text-accent { color: ${accentColor}; }
        .section-title { font-weight: 700; /* bolder */ }
        .section-subtitle { color: #4A5568; /* gray-700 */ }
        html { scroll-behavior: smooth; }
      </style>
    </head>
    <body class="bg-secondary-50 text-secondary-800 antialiased">

      <!-- Header -->
      <header class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <a href="#" class="text-2xl md:text-3xl font-extrabold text-accent">${params.agencyName}</a>
          <nav class="hidden md:flex space-x-6">
            <a href="#offer" class="text-secondary-600 hover:text-accent font-medium transition-colors">Nuestra Oferta</a>
            <a href="#features" class="text-secondary-600 hover:text-accent font-medium transition-colors">Beneficios</a>
            ${content.processSectionTitle ? `<a href="#process" class="text-secondary-600 hover:text-accent font-medium transition-colors">Proceso</a>` : ''}
            ${content.gallerySectionTitle ? `<a href="#gallery" class="text-secondary-600 hover:text-accent font-medium transition-colors">Galería</a>` : ''}
            <a href="#testimonials" class="text-secondary-600 hover:text-accent font-medium transition-colors">Testimonios</a>
            <a href="#contact" class="btn-accent px-5 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all">Contacto</a>
          </nav>
          <button id="mobile-menu-button" class="md:hidden text-secondary-600 hover:text-accent">
            ${getIconSVG('menu', 'w-7 h-7')}
          </button>
        </div>
        <!-- Mobile Menu (hidden by default) -->
        <div id="mobile-menu" class="hidden md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-2">
            <a href="#offer" class="block px-6 py-2 text-secondary-600 hover:bg-secondary-100 hover:text-accent">Nuestra Oferta</a>
            <a href="#features" class="block px-6 py-2 text-secondary-600 hover:bg-secondary-100 hover:text-accent">Beneficios</a>
            ${content.processSectionTitle ? `<a href="#process" class="block px-6 py-2 text-secondary-600 hover:bg-secondary-100 hover:text-accent">Proceso</a>` : ''}
            ${content.gallerySectionTitle ? `<a href="#gallery" class="block px-6 py-2 text-secondary-600 hover:bg-secondary-100 hover:text-accent">Galería</a>` : ''}
            <a href="#testimonials" class="block px-6 py-2 text-secondary-600 hover:bg-secondary-100 hover:text-accent">Testimonios</a>
            <a href="#contact" class="block px-6 py-2 text-secondary-600 hover:bg-secondary-100 hover:text-accent">Contacto</a>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-bg text-white relative min-h-[75vh] md:min-h-screen flex items-center justify-center">
        <div class="absolute inset-0 bg-secondary-900 opacity-60"></div>
        <div class="container mx-auto px-6 text-center relative z-10 py-20">
          <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">${content.heroHeadline}</h1>
          <p class="text-lg sm:text-xl md:text-2xl text-secondary-200 mb-10 max-w-3xl mx-auto">${content.heroSubheadline}</p>
          <a href="${content.heroCTALink || '#contact'}" class="btn-accent px-8 py-4 md:px-10 md:py-4 rounded-lg text-lg md:text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-block">${content.heroCtaText}</a>
        </div>
      </section>

      <!-- Offer/USP Section -->
      <section id="offer" class="py-16 md:py-24 bg-white">
        <div class="container mx-auto px-6">
          <div class="text-center mb-12 md:mb-16">
            <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-800 section-title mb-4">${content.offerTitle}</h2>
            <p class="text-secondary-600 md:text-lg max-w-3xl mx-auto section-subtitle">${params.usp}</p>
          </div>
          <div class="text-secondary-700 md:text-lg max-w-4xl mx-auto space-y-6 whitespace-pre-line text-justify md:text-left leading-relaxed">${content.offerBody}</div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-16 md:py-24 bg-secondary-100">
        <div class="container mx-auto px-6">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-800 text-center section-title mb-16">${content.featuresTitle}</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            ${featuresHTML}
          </div>
        </div>
      </section>
      
      ${processHTML}
      ${galleryHTML}

      <!-- Testimonials Section -->
      <section id="testimonials" class="py-16 md:py-24 ${processHTML || galleryHTML ? 'bg-white' : 'bg-secondary-100'}">
        <div class="container mx-auto px-6">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-800 text-center section-title mb-16">${content.testimonialSectionTitle}</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${[1,2,3].map(i => `
            <div class="bg-white p-8 rounded-xl shadow-lg border border-secondary-200">
              <div class="text-accent text-4xl mb-4">“</div>
              <p class="text-secondary-600 italic text-base md:text-lg mb-6">"Este es un testimonio de ejemplo. La IA generará uno más adecuado. Muy contentos con el servicio de ${params.agencyName}."</p>
              <p class="text-secondary-800 font-bold text-right">- Cliente Ejemplo ${i}</p>
              <p class="text-secondary-500 text-sm text-right">${params.language === 'es-SV' ? 'San Salvador' : 'Ciudad Ejemplo'}</p>
            </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Final CTA & Contact Form Section -->
      <section id="contact" class="py-16 md:py-24 bg-accent text-white">
        <div class="container mx-auto px-6 text-center">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 section-title">${content.finalCtaHeadline}</h2>
          ${content.finalCtaSubheadline ? `<p class="text-secondary-200 md:text-xl mb-10 max-w-2xl mx-auto section-subtitle">${content.finalCtaSubheadline}</p>`: ''}
          <div class="max-w-xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-2xl text-left">
             ${content.formContactTitle ? `<h3 class="text-2xl md:text-3xl font-semibold text-secondary-800 mb-8 text-center">${content.formContactTitle}</h3>` : ''}
            ${contactFormHTML}
            <button type="submit" form="contact-form" class="btn-accent w-full mt-10 px-6 py-4 rounded-lg text-lg font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">${content.finalCtaButtonText}</button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-secondary-900 text-secondary-300 py-16 md:py-20">
        <div class="container mx-auto px-6 text-center">
          <a href="#" class="text-3xl font-extrabold text-white mb-6 inline-block">${params.agencyName}</a>
          <p class="mb-4 max-w-2xl mx-auto text-secondary-400">${content.footerText.replace('{{agencyName}}', params.agencyName).replace('{{currentYear}}', new Date().getFullYear().toString())}</p>
          ${params.contactPhone ? `<p class="mb-2">Teléfono: <a href="tel:${params.contactPhone}" class="hover:text-accent transition-colors">${params.contactPhone}</a></p>` : ''}
          ${params.contactEmail ? `<p class="mb-6">Email: <a href="mailto:${params.contactEmail}" class="hover:text-accent transition-colors">${params.contactEmail}</a></p>` : ''}
          ${socialLinksHTML}
          <p class="mt-10 text-xs text-secondary-500">&copy; ${new Date().getFullYear()} ${params.agencyName}. Todos los derechos reservados. Diseñado con IA.</p>
        </div>
      </footer>
      
      <script>
        // Mobile menu toggle
        const menuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
            // Close menu when a link is clicked
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                });
            });
        }
        // Basic form submission prevention for demo
        const contactForm = document.getElementById('contact-form');
        if(contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Formulario enviado (simulación). ¡Gracias!');
                contactForm.reset();
            });
        }
      </script>

    </body>
    </html>
  `;
};


export const AiFunnelBuilderPage: React.FC = () => {
  const [geminiReady, setGeminiReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  const [params, setParams] = useState<LandingPageParams>({
    objective: 'Captar leads de compradores interesados en apartamentos nuevos en San Salvador.',
    targetAudience: 'Jóvenes profesionales y parejas buscando su primer hogar moderno y céntrico.',
    usp: 'Ofrecemos los apartamentos más innovadores con financiamiento accesible y asesoría personalizada en el corazón de San Salvador.',
    keyPoints: ['Diseño moderno y eficiente', 'Ubicación estratégica cerca de centros de trabajo y entretenimiento', 'Amenidades exclusivas (gimnasio, rooftop, co-working)', 'Planes de financiamiento flexibles'],
    agencyName: 'Inmobiliaria Futuro SV',
    contactPhone: '+503 2255 0000',
    contactEmail: 'ventas@futurosv.com',
    accentColor: defaultAccentColor,
    language: 'es-SV',
    socialLinks: { facebook: "https://facebook.com/example", instagram: "https://instagram.com/example", whatsapp: "50377778888", tiktok: "https://tiktok.com/@example" },
  });

  const [generatedHtml, setGeneratedHtml] = useState('');
  const [generatedCssNotes, setGeneratedCssNotes] = useState(
    `/* 
El HTML generado utiliza clases de Tailwind CSS para el estilizado.
Asegúrate de tener Tailwind CSS configurado en tu proyecto donde vayas a usar este código.
Puedes usar el CDN de Tailwind para pruebas rápidas: <script src="https://cdn.tailwindcss.com"></script>
El tag <style> en el HTML generado incluye:
  - @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  - body { font-family: 'Inter', sans-serif; }
  - html { scroll-behavior: smooth; }
  - Clases personalizadas .btn-accent, .text-accent, .section-title, .section-subtitle
  - Una imagen de fondo para el Héroe desde picsum.photos.
Configuración de Tailwind usada para la vista previa (incluyendo color de acento dinámico):
<script>
  ${getTailwindConfigForPreview().replace('{{accentColor}}', params.accentColor || defaultAccentColor)}
</script>
*/`
  );
  const [iframeSrcDoc, setIframeSrcDoc] = useState('');
  

  useEffect(() => {
    setGeminiReady(isGeminiAvailable());
  }, []);

  useEffect(() => {
    // Update iframe content when HTML changes
     if (generatedHtml) {
        setIframeSrcDoc(generatedHtml);
     }
  }, [generatedHtml]);

   useEffect(() => {
    // Update CSS notes when accent color changes
    setGeneratedCssNotes(
      `/* 
El HTML generado utiliza clases de Tailwind CSS para el estilizado.
Asegúrate de tener Tailwind CSS configurado en tu proyecto donde vayas a usar este código.
Puedes usar el CDN de Tailwind para pruebas rápidas: <script src="https://cdn.tailwindcss.com"></script>
El tag <style> en el HTML generado incluye:
  - @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  - body { font-family: 'Inter', sans-serif; }
  - html { scroll-behavior: smooth; }
  - Clases personalizadas .btn-accent, .text-accent, .section-title, .section-subtitle
  - Una imagen de fondo para el Héroe desde picsum.photos.
Configuración de Tailwind usada para la vista previa (incluyendo color de acento dinámico):
<script>
  ${getTailwindConfigForPreview().replace('{{accentColor}}', params.accentColor || defaultAccentColor)}
</script>
*/`
    );
  }, [params.accentColor]);


  const handleInputChange = (field: keyof LandingPageParams, value: any) => {
    if (field === 'keyPoints') {
      setParams(prev => ({ ...prev, [field]: value.split('\n').map((s:string) => s.trim()).filter((s:string) => s) }));
    } else if (field === 'socialLinks') {
      // Assuming value is an object like { facebook: "url", ... }
      setParams(prev => ({ ...prev, socialLinks: {...(prev.socialLinks || {}), ...value} }));
    } 
    else {
      setParams(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleSocialLinkChange = (platform: 'facebook' | 'instagram' | 'tiktok' | 'whatsapp', value: string) => {
    setParams(prev => ({
        ...prev,
        socialLinks: {
            ...(prev.socialLinks || {}),
            [platform]: value
        }
    }));
  };


  const handleGenerateLandingPage = async () => {
    if (!geminiReady) {
      setError("Servicio de IA no disponible.");
      return;
    }
    setError('');
    setIsLoading(true);
    setGeneratedHtml('');

    try {
      const landingPageContent = await generateRealEstateLandingPageContent(params);
      const html = generateLandingPageHTML(landingPageContent, params);
      setGeneratedHtml(html);
    } catch (e: any) {
      setError(e.message || "Error generando la landing page.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'html' | 'css') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'html') setCopiedHtml(true);
      if (type === 'css') setCopiedCss(true);
      setTimeout(() => {
        if (type === 'html') setCopiedHtml(false);
        if (type === 'css') setCopiedCss(false);
      }, 2000);
    }).catch(err => console.error('Error al copiar:', err));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <PresentationChartLineIcon className="h-8 w-8 text-primary-600" />
        <h2 className="text-3xl font-semibold text-secondary-800">Constructor de Landing Pages IA (El Salvador)</h2>
      </div>
      <p className="text-sm text-secondary-600">
        Define los parámetros de tu embudo, y la IA generará el contenido textual para una landing page. 
        Luego, previsualiza y obtén el código HTML (con Tailwind CSS) listo para usar.
      </p>

      {!geminiReady && (
        <Card>
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-bold">Servicio de IA no disponible.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna de Inputs */}
        <div className="lg:col-span-1 space-y-4">
          <Card title="1. Define tu Landing Page">
            <Input label="Objetivo del Embudo" id="lp-objective" value={params.objective} onChange={e => handleInputChange('objective', e.target.value)} disabled={isLoading} />
            <Input label="Público Objetivo" id="lp-targetAudience" value={params.targetAudience} onChange={e => handleInputChange('targetAudience', e.target.value)} disabled={isLoading} />
            <TextArea label="Propuesta Única de Valor (USP)" id="lp-usp" value={params.usp} onChange={e => handleInputChange('usp', e.target.value)} rows={3} disabled={isLoading} />
            <TextArea label="Puntos Clave (uno por línea)" id="lp-keyPoints" value={params.keyPoints.join('\n')} onChange={e => handleInputChange('keyPoints', e.target.value)} rows={4} disabled={isLoading} />
            <Input label="Nombre de la Agencia" id="lp-agencyName" value={params.agencyName} onChange={e => handleInputChange('agencyName', e.target.value)} disabled={isLoading} />
            <Input label="Teléfono de Contacto (Opcional)" id="lp-contactPhone" type="tel" value={params.contactPhone} onChange={e => handleInputChange('contactPhone', e.target.value)} disabled={isLoading} />
            <Input label="Email de Contacto (Opcional)" id="lp-contactEmail" type="email" value={params.contactEmail} onChange={e => handleInputChange('contactEmail', e.target.value)} disabled={isLoading} />
            <Input label="Color de Acento (Hex, ej: #3B82F6)" id="lp-accentColor" type="color" value={params.accentColor || defaultAccentColor} onChange={e => handleInputChange('accentColor', e.target.value)} disabled={isLoading} className="p-1 h-10 w-full"/>
            
            <details className="text-sm pt-2">
                <summary className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium py-1">Enlaces a Redes Sociales (Opcional)</summary>
                <div className="mt-2 space-y-2 pl-2 border-l-2 border-primary-200">
                    <Input label="Facebook URL" id="lp-social-fb" value={params.socialLinks?.facebook || ''} onChange={e => handleSocialLinkChange('facebook', e.target.value)} disabled={isLoading} containerClassName="mb-1"/>
                    <Input label="Instagram URL" id="lp-social-ig" value={params.socialLinks?.instagram || ''} onChange={e => handleSocialLinkChange('instagram', e.target.value)} disabled={isLoading} containerClassName="mb-1"/>
                    <Input label="TikTok URL" id="lp-social-tk" value={params.socialLinks?.tiktok || ''} onChange={e => handleSocialLinkChange('tiktok', e.target.value)} disabled={isLoading} containerClassName="mb-1"/>
                    <Input label="WhatsApp Número (solo números con código país)" id="lp-social-wa" value={params.socialLinks?.whatsapp || ''} onChange={e => handleSocialLinkChange('whatsapp', e.target.value)} disabled={isLoading} containerClassName="mb-1" placeholder="Ej: 50377778888"/>
                </div>
            </details>

            <Button onClick={handleGenerateLandingPage} isLoading={isLoading} disabled={!geminiReady || isLoading} leftIcon={<SparklesIcon className="h-5 w-5" />} className="w-full mt-6">
              {isLoading ? 'Generando Contenido y Página...' : 'Generar Landing Page con IA'}
            </Button>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </Card>
        </div>

        {/* Columna de Resultados y Vista Previa */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="2. Código Generado y Vista Previa">
            {isLoading && <LoadingSpinner text="Generando landing page..." />}
            {!isLoading && !generatedHtml && <p className="text-secondary-500">La vista previa y el código aparecerán aquí después de generar la página.</p>}
            
            {generatedHtml && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-secondary-700 mb-2">Vista Previa de la Landing Page</h4>
                  <div className="border border-secondary-300 rounded-lg shadow-inner aspect-[9/16] md:aspect-video overflow-hidden bg-white">
                    <iframe
                      srcDoc={iframeSrcDoc}
                      title="Vista Previa Landing Page"
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin" // Allow scripts for Tailwind JIT, same-origin for potential relative paths if any (none here)
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-secondary-700">HTML Generado</h4>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedHtml, 'html')} leftIcon={<ClipboardIcon className="h-4 w-4"/>}>
                      {copiedHtml ? '¡Copiado!' : 'Copiar HTML'}
                    </Button>
                  </div>
                  <TextArea value={generatedHtml} readOnly rows={10} className="text-xs bg-secondary-800 text-secondary-100 font-mono focus:ring-accent focus:border-accent" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-secondary-700">Notas CSS (Tailwind)</h4>
                     <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedCssNotes, 'css')} leftIcon={<ClipboardIcon className="h-4 w-4"/>}>
                        {copiedCss ? '¡Copiado!' : 'Copiar Notas'}
                    </Button>
                  </div>
                  <TextArea value={generatedCssNotes} readOnly rows={5} className="text-xs bg-secondary-800 text-secondary-100 font-mono focus:ring-accent focus:border-accent" />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};