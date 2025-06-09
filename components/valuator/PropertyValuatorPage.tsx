
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { TextArea } from '../common/TextArea';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { isGeminiAvailable, estimatePropertyValue } from '../../services/geminiService';
import { CalculatorIcon, SparklesIcon, DownloadIcon } from '../../constants';
import { PropertyType, PropertyValuationResult, GroundingChunk } from '../../types';

export const PropertyValuatorPage: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.CASA);
  const [areaSqMeters, setAreaSqMeters] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [bathrooms, setBathrooms] = useState<string>('');
  const [features, setFeatures] = useState<string>('');
  const [marketPricePerSqM, setMarketPricePerSqM] = useState<string>('');
  const [marketNotes, setMarketNotes] = useState<string>('');

  const [valuationResult, setValuationResult] = useState<PropertyValuationResult | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [geminiReady, setGeminiReady] = useState<boolean>(false);

  useEffect(() => {
    setGeminiReady(isGeminiAvailable());
  }, []);

  const propertyTypeOptions = Object.values(PropertyType).map(pt => ({ value: pt, label: pt }));

  const validateInputs = (): boolean => {
    if (!address.trim()) {
      setError('La dirección de la propiedad es obligatoria.');
      return false;
    }
    if (areaSqMeters && (isNaN(parseFloat(areaSqMeters)) || parseFloat(areaSqMeters) <= 0)) {
        setError('El área en m² debe ser un número positivo.');
        return false;
    }
    if (bedrooms && (isNaN(parseInt(bedrooms)) || parseInt(bedrooms) < 0)) {
        setError('El número de habitaciones debe ser un número válido.');
        return false;
    }
     if (bathrooms && (isNaN(parseInt(bathrooms)) || parseInt(bathrooms) < 0)) {
        setError('El número de baños debe ser un número válido.');
        return false;
    }
    if (marketPricePerSqM && (isNaN(parseFloat(marketPricePerSqM)) || parseFloat(marketPricePerSqM) <= 0)) {
        setError('El precio promedio por m² (referencia) debe ser un número positivo.');
        return false;
    }
    setError('');
    return true;
  };

  const handleEstimateValue = async () => {
    if (!validateInputs()) return;
    if (!geminiReady) {
      setError("El servicio de IA no está disponible. Verifique la configuración de la API Key de Gemini.");
      return;
    }

    setIsLoading(true);
    setValuationResult(null);
    setQrCodeDataUrl(null); // Reset QR code
    setError('');

    try {
      const result = await estimatePropertyValue({
        address,
        type: propertyType,
        areaSqMeters: areaSqMeters ? parseFloat(areaSqMeters) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        features,
        marketPricePerSqM: marketPricePerSqM ? parseFloat(marketPricePerSqM) : undefined,
        marketNotes,
      });
      setValuationResult(result);
       if (result.valueRange === "Error de IA" || result.valueRange === "Error en formato IA") {
         setError(result.justification || "Hubo un error al procesar la respuesta de la IA.");
      } else if (address) {
        // Generate QR Code if successful and address exists
        const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
        QRCode.toDataURL(mapsUrl, { errorCorrectionLevel: 'M', width: 200 }) // width for better quality QR for PDF
            .then(url => {
                setQrCodeDataUrl(url);
            })
            .catch(err => {
                console.error("Error generando código QR:", err);
                setQrCodeDataUrl(null);
            });
      }

    } catch (e) {
      console.error("Error estimating property value:", e);
      setError(e instanceof Error ? e.message : "Ocurrió un error al estimar el valor de la propiedad.");
      setValuationResult(null);
      setQrCodeDataUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!valuationResult) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let currentY = margin;
    const lineHeight = 7; 
    const smallLineHeight = 5;

    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, options?: any) => {
      const lines = doc.splitTextToSize(text || "N/A", maxWidth);
      doc.text(lines, x, y, options);
      return y + lines.length * (options?.fontSize && options.fontSize < 10 ? smallLineHeight : lineHeight);
    };
    
    const addSubtitle = (text: string, yPos: number, size = 12, weight = 'bold') => {
        doc.setFontSize(size);
        doc.setFont('helvetica', weight);
        doc.text(text, margin, yPos);
        return yPos + lineHeight;
    };

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Valuación Estimada de Propiedad IA", pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight * 1.5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de Valuación: ${new Date().toLocaleDateString('es-SV')}`, pageWidth - margin, currentY, { align: 'right' });
    currentY += lineHeight * 1.5;

    currentY = addSubtitle(`Propiedad: ${address}`, currentY);
    currentY += lineHeight * 0.5;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let detailsY = currentY;
    doc.text(`Tipo: ${propertyType}`, margin, detailsY);
    if (areaSqMeters) doc.text(`Área: ${areaSqMeters} m²`, margin + 60, detailsY);
    detailsY += lineHeight;
    if (bedrooms) doc.text(`Habitaciones: ${bedrooms}`, margin, detailsY);
    if (bathrooms) doc.text(`Baños: ${bathrooms}`, margin + 60, detailsY);
    detailsY += lineHeight;
    currentY = detailsY;

    if (features) {
      doc.setFont("helvetica", "bold");
      doc.text("Características Adicionales:", margin, currentY);
      currentY += lineHeight * 0.8;
      doc.setFont("helvetica", "normal");
      currentY = addWrappedText(features, margin, currentY, contentWidth);
      currentY += lineHeight * 0.5;
    }
    
    if (marketPricePerSqM || marketNotes) {
      currentY = addSubtitle("Datos de Mercado Proporcionados por Usuario:", currentY);
      if (marketPricePerSqM) {
        doc.text(`Precio Promedio por m² (USD): $${marketPricePerSqM}`, margin, currentY);
        currentY += lineHeight;
      }
      if (marketNotes) {
        doc.setFont("helvetica", "bold");
        doc.text("Notas del Mercado Local:", margin, currentY);
        currentY += lineHeight * 0.8;
        doc.setFont("helvetica", "normal");
        currentY = addWrappedText(marketNotes, margin, currentY, contentWidth);
      }
      currentY += lineHeight * 0.5;
    }

    currentY = addSubtitle("Estimación de Valor IA:", currentY);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Rango de Valor (USD): ${valuationResult.valueRange}`, margin, currentY);
    currentY += lineHeight;

    currentY = addSubtitle("Justificación de la IA:", currentY, 10, 'bold');
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    currentY = addWrappedText(valuationResult.justification, margin, currentY, contentWidth);
    currentY += lineHeight * 0.5;

    if (qrCodeDataUrl) {
        if (currentY + 35 > doc.internal.pageSize.getHeight() - margin) { // Check for page break (35 for QR + title)
            doc.addPage();
            currentY = margin;
        }
        currentY = addSubtitle("Ubicación en Mapa (Código QR):", currentY, 10, 'bold');
        const qrSize = 30; // 30mm
        doc.addImage(qrCodeDataUrl, 'PNG', margin, currentY, qrSize, qrSize);
        currentY += qrSize + lineHeight * 0.5; 
    }

    if (valuationResult.sources && valuationResult.sources.length > 0) {
      currentY = addSubtitle("Fuentes Consultadas por IA (Google Search):", currentY, 10, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 255); 
      valuationResult.sources.forEach(source => {
        if (currentY > doc.internal.pageSize.getHeight() - margin * 2) { 
            doc.addPage();
            currentY = margin;
        }
        const sourceText = source.web?.title || source.web?.uri || source.retrievedContext?.title || source.retrievedContext?.uri || "Fuente no especificada";
        const sourceUri = source.web?.uri || source.retrievedContext?.uri;
        doc.text("• ", margin, currentY);
        if (sourceUri) {
            doc.textWithLink(sourceText.substring(0,80) + (sourceText.length > 80 ? "..." : ""), margin + 3, currentY, { url: sourceUri });
        } else {
            doc.text(sourceText.substring(0,85) + (sourceText.length > 85 ? "..." : ""), margin + 3, currentY);
        }
        currentY += smallLineHeight * 1.5;
      });
      doc.setTextColor(0, 0, 0); 
      currentY += lineHeight * 0.5;
    }

    currentY = addSubtitle("Descargo de Responsabilidad:", currentY, 9, 'bold');
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const disclaimerText = "Esta es una estimación generada por Inteligencia Artificial con fines informativos y referenciales para el mercado de El Salvador. No constituye una tasación formal ni oficial del CNR, CASALCO, ni de ninguna otra entidad profesional. Se recomienda siempre consultar con un tasador profesional certificado para una valuación oficial.";
    currentY = addWrappedText(disclaimerText, margin, currentY, contentWidth, {fontSize: 8});
    currentY += lineHeight;

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Generado por CRM Inmobiliario AI - ${new Date().toLocaleDateString('es-SV')}`,
            pageWidth / 2, doc.internal.pageSize.getHeight() - (margin / 2), { align: 'center' }
        );
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - (margin/2), {align: 'right'});
    }
    
    const filenameSafeAddress = address.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    doc.save(`Valuacion_Propiedad_${filenameSafeAddress || 'Generica'}.pdf`);
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <CalculatorIcon className="h-8 w-8 text-primary-600" />
        <h2 className="text-3xl font-semibold text-secondary-800">Valuador de Inmuebles IA (El Salvador)</h2>
      </div>

      {!geminiReady && (
        <Card>
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-bold">Servicio de IA no disponible</p>
            <p>Esta función requiere una API Key de Gemini válida y configurada.</p>
          </div>
        </Card>
      )}
      
      <p className="text-sm text-secondary-600">
        Ingrese los detalles de la propiedad para obtener una estimación de valor basada en IA.
        La IA considerará los datos de mercado que proporcione como referencias importantes (similando información del CNR/CASALCO)
        o buscará tendencias generales del mercado salvadoreño.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Detalles de la Propiedad">
          <div className="space-y-4">
            <Input
              label="Dirección Completa"
              id="prop-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Calle La Mascota, #123, Colonia Escalón, San Salvador"
              disabled={!geminiReady || isLoading}
            />
            <Select
              label="Tipo de Propiedad"
              id="prop-type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              options={propertyTypeOptions}
              disabled={!geminiReady || isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                label="Área (m²)"
                id="prop-area"
                type="number"
                value={areaSqMeters}
                onChange={(e) => setAreaSqMeters(e.target.value)}
                placeholder="Ej: 150"
                disabled={!geminiReady || isLoading}
                />
                <Input
                label="Habitaciones (Opcional)"
                id="prop-bedrooms"
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="Ej: 3"
                disabled={!geminiReady || isLoading}
                />
                <Input
                label="Baños (Opcional)"
                id="prop-bathrooms"
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="Ej: 2"
                disabled={!geminiReady || isLoading}
                />
            </div>
            <TextArea
              label="Características Adicionales / Estado de Conservación (Opcional)"
              id="prop-features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Ej: Remodelada recientemente, con jardín, cochera para 2 vehículos, cocina con top de granito, etc."
              rows={3}
              disabled={!geminiReady || isLoading}
            />
            <h4 className="text-md font-semibold text-secondary-700 pt-2 border-t mt-4">Datos de Mercado (Opcional - Referencia Usuario)</h4>
             <Input
              label="Precio Promedio por m² en la Zona (USD) (Referencia Usuario)"
              id="prop-market-price"
              type="number"
              value={marketPricePerSqM}
              onChange={(e) => setMarketPricePerSqM(e.target.value)}
              placeholder="Ej: 800"
              disabled={!geminiReady || isLoading}
            />
            <TextArea
              label="Notas del Mercado Local / Comparables (Referencia Usuario)"
              id="prop-market-notes"
              value={marketNotes}
              onChange={(e) => setMarketNotes(e.target.value)}
              placeholder="Ej: Propiedades similares en la misma cuadra se vendieron recientemente entre $X y $Y. Alta demanda en la zona."
              rows={3}
              disabled={!geminiReady || isLoading}
            />
            
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              onClick={handleEstimateValue}
              isLoading={isLoading}
              disabled={!geminiReady || isLoading}
              leftIcon={<SparklesIcon className="h-5 w-5" />}
              className="w-full"
            >
              {isLoading ? 'Estimando Valor...' : 'Estimar Valor con IA'}
            </Button>
          </div>
        </Card>

        <Card title="Resultado de la Valuación IA">
          {isLoading && <LoadingSpinner text="La IA está calculando la estimación..." />}
          
          {!isLoading && !valuationResult && (
            <div className="text-center py-10">
              <p className="text-secondary-500">La estimación del valor aparecerá aquí.</p>
            </div>
          )}

          {!isLoading && valuationResult && (
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-primary-700">Rango de Valor Estimado (USD):</h4>
                        <p className="text-2xl font-bold text-primary-600">{valuationResult.valueRange}</p>
                    </div>
                    {qrCodeDataUrl && (
                    <div className="ml-4 text-center flex-shrink-0">
                        <img src={qrCodeDataUrl} alt="Código QR para Google Maps" className="w-24 h-24 border border-secondary-300 rounded" />
                        <p className="text-xs text-secondary-500 mt-1">Ubicación (QR)</p>
                    </div>
                    )}
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-secondary-700">Justificación de la IA:</h4>
                <p className="text-sm text-secondary-600 whitespace-pre-wrap bg-secondary-50 p-3 rounded-md">{valuationResult.justification}</p>
              </div>

              {valuationResult.sources && valuationResult.sources.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-secondary-600 mb-1">Fuentes Consultadas por IA (Google Search):</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {valuationResult.sources.map((source, index) => (
                      <li key={index}>
                        {source.web && source.web.uri && (
                          <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {source.web.title || source.web.uri}
                          </a>
                        )}
                         {source.retrievedContext && !source.web && ( 
                            <span>{source.retrievedContext.title || source.retrievedContext.uri || "Contexto recuperado"}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-700 text-xs">
                <p className="font-semibold">Descargo de Responsabilidad:</p>
                <p>Esta es una estimación generada por Inteligencia Artificial con fines informativos y referenciales para el mercado de El Salvador. No constituye una tasación formal ni oficial del CNR, CASALCO, ni de ninguna otra entidad profesional. Se recomienda siempre consultar con un tasador profesional certificado para una valuación oficial.</p>
              </div>
              <Button
                onClick={handleDownloadPDF}
                disabled={!valuationResult}
                leftIcon={<DownloadIcon className="h-5 w-5" />}
                variant="secondary"
                className="w-full mt-4"
              >
                Descargar Valuación en PDF
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};