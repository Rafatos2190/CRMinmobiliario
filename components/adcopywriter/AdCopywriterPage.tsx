
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { TextArea } from '../common/TextArea';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { isGeminiAvailable, generateAdCopy } from '../../services/geminiService';
import { MegaphoneIcon, SparklesIcon, ClipboardIcon } from '../../constants';

const socialMediaPlatformOptions = [
  { value: 'General', label: 'General / Multiplataforma' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram (Post/Reel)' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'X / Twitter', label: 'X / Twitter' },
  { value: 'LinkedIn', label: 'LinkedIn' },
];

const adToneOptions = [
  { value: 'General', label: 'General / Neutro' },
  { value: 'Profesional', label: 'Profesional' },
  { value: 'Amigable', label: 'Amigable / Cercano' },
  { value: 'Urgente', label: 'Urgente / Persuasivo' },
  { value: 'Divertido', label: 'Divertido / Creativo' },
  { value: 'Informativo', label: 'Informativo / Educativo' },
];

export const AdCopywriterPage: React.FC = () => {
  const [platform, setPlatform] = useState<string>('General');
  const [productDescription, setProductDescription] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [keyMessage, setKeyMessage] = useState<string>('');
  const [callToAction, setCallToAction] = useState<string>('');
  const [tone, setTone] = useState<string>('General');
  
  const [generatedAd, setGeneratedAd] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [geminiReady, setGeminiReady] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setGeminiReady(isGeminiAvailable());
  }, []);

  const validateInputs = (): boolean => {
    if (!productDescription.trim()) {
      setError('La descripción del producto/servicio es obligatoria.');
      return false;
    }
    if (!targetAudience.trim()) {
      setError('El público objetivo es obligatorio.');
      return false;
    }
    if (!keyMessage.trim()) {
      setError('El mensaje clave es obligatorio.');
      return false;
    }
    if (!callToAction.trim()) {
      setError('La llamada a la acción es obligatoria.');
      return false;
    }
    setError('');
    return true;
  };

  const handleGenerateAd = async () => {
    if (!validateInputs()) return;
    if (!geminiReady) {
      setError("El servicio de IA no está disponible. Verifique la configuración de la API Key de Gemini.");
      return;
    }

    setIsLoading(true);
    setGeneratedAd('');
    try {
      const adText = await generateAdCopy(
        platform,
        productDescription,
        targetAudience,
        keyMessage,
        callToAction,
        tone
      );
      setGeneratedAd(adText);
    } catch (e) {
      console.error("Error generating ad copy:", e);
      setError(e instanceof Error ? e.message : "Ocurrió un error al generar el anuncio.");
      setGeneratedAd('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedAd) return;
    navigator.clipboard.writeText(generatedAd)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setError('No se pudo copiar el texto al portapapeles.');
      });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <MegaphoneIcon className="h-8 w-8 text-primary-600" />
        <h2 className="text-3xl font-semibold text-secondary-800">Redactor de Anuncios con IA</h2>
      </div>

      {!geminiReady && (
        <Card>
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-bold">Servicio de IA no disponible</p>
            <p>Esta función requiere una API Key de Gemini válida y configurada.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Parámetros del Anuncio">
          <div className="space-y-4">
            <Select
              label="Plataforma de Red Social"
              id="ad-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              options={socialMediaPlatformOptions}
              disabled={!geminiReady || isLoading}
            />
            <TextArea
              label="Producto/Servicio/Propiedad a Promocionar"
              id="ad-product"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Ej: Apartamento de 2 habitaciones en el centro con balcón"
              rows={3}
              disabled={!geminiReady || isLoading}
            />
            <Input
              label="Público Objetivo"
              id="ad-audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Ej: Jóvenes profesionales, familias con niños"
              disabled={!geminiReady || isLoading}
            />
            <TextArea
              label="Mensaje Clave / Beneficio Principal"
              id="ad-keymessage"
              value={keyMessage}
              onChange={(e) => setKeyMessage(e.target.value)}
              placeholder="Ej: Ubicación céntrica y tranquila, ideal para inversión"
              rows={2}
              disabled={!geminiReady || isLoading}
            />
            <Input
              label="Llamada a la Acción (CTA)"
              id="ad-cta"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              placeholder="Ej: Más información, Agenda una visita, Regístrate aquí"
              disabled={!geminiReady || isLoading}
            />
            <Select
              label="Tono del Anuncio (Opcional)"
              id="ad-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              options={adToneOptions}
              disabled={!geminiReady || isLoading}
            />
             {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              onClick={handleGenerateAd}
              isLoading={isLoading}
              disabled={!geminiReady || isLoading}
              leftIcon={<SparklesIcon className="h-5 w-5" />}
              className="w-full"
            >
              {isLoading ? 'Generando Anuncio...' : 'Generar Anuncio con IA'}
            </Button>
          </div>
        </Card>

        <Card title="Anuncio Generado">
          {isLoading && <LoadingSpinner text="La IA está redactando tu anuncio..." />}
          
          {!isLoading && !generatedAd && (
            <div className="text-center py-10">
              <p className="text-secondary-500">El anuncio generado por la IA aparecerá aquí.</p>
            </div>
          )}

          {!isLoading && generatedAd && (
            <div className="space-y-4">
              <TextArea
                id="generated-ad-output"
                value={generatedAd}
                readOnly
                rows={12}
                className="bg-secondary-800 text-secondary-50 border-secondary-600 focus:ring-primary-500 focus:border-primary-500"
                aria-label="Texto del anuncio generado"
              />
              <Button 
                onClick={handleCopyToClipboard}
                leftIcon={<ClipboardIcon className="h-5 w-5" />}
                variant="secondary"
                className="w-full"
              >
                {copied ? '¡Copiado!' : 'Copiar Texto del Anuncio'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
