
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Link, useParams } from 'react-router-dom';
import { EmailCampaign, Client, Property, PropertyType } from '../../types';
import { getEmailCampaigns, addEmailCampaign, updateEmailCampaign, deleteEmailCampaign, getEmailCampaignById, getClients, getProperties, getPropertyById, addInteractionLog } from '../../services/dataService';
import { generateEmailCampaignContent, isGeminiAvailable } from '../../services/geminiService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Select } from '../common/Select';
import { Modal } from '../common/Modal';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PlusIcon, EditIcon, TrashIcon, SparklesIcon, EyeIcon, MailIcon, SendIcon } from '../../constants';

const CampaignForm: React.FC<{ campaign?: EmailCampaign; onSave: (campaign: EmailCampaign) => void; onCancel: () => void; allClients: Client[]; allProperties: Property[] }> = 
    ({ campaign, onSave, onCancel, allClients, allProperties }) => {
  
  const [name, setName] = useState(campaign?.name || '');
  const [targetClientIds, setTargetClientIds] = useState<string[]>(campaign?.targetClientIds || []);
  const [emailSubject, setEmailSubject] = useState(campaign?.emailSubject || '');
  const [emailBody, setEmailBody] = useState(campaign?.emailBody || '');
  const [goal, setGoal] = useState(campaign?.goal || '');
  const [keyPoints, setKeyPoints] = useState(campaign?.keyPoints || '');
  const [propertyId, setPropertyId] = useState(campaign?.propertyId || '');

  const [loadingAiContent, setLoadingAiContent] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const geminiReady = isGeminiAvailable();

  const validate = () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = 'El nombre de la campaña es obligatorio.';
    if (targetClientIds.length === 0) newErrors.targetClientIds = 'Debe seleccionar al menos un cliente.';
    if (!emailSubject.trim()) newErrors.emailSubject = 'El asunto del email es obligatorio.';
    if (!emailBody.trim()) newErrors.emailBody = 'El cuerpo del email es obligatorio.';
    if (!goal.trim() && !campaign?.id) newErrors.goal = 'El objetivo de la campaña es útil para la IA.'; // Required for new campaigns for AI
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateContent = async () => {
    if (!geminiReady || !goal.trim()) {
      alert("Por favor, ingrese el objetivo de la campaña para que la IA pueda generar el contenido.");
      return;
    }
    setLoadingAiContent(true);
    setErrors({});
    const selectedProperty = propertyId ? getPropertyById(propertyId) : undefined;
    try {
      const content = await generateEmailCampaignContent(goal, keyPoints, selectedProperty);
      setEmailSubject(content.subject);
      setEmailBody(content.body);
      if (content.subject === "Error de IA" || content.subject === "Error en formato IA") {
        setErrors({ ...errors, aiError: content.body });
      }
    } catch (e) {
      console.error(e);
      setErrors({ ...errors, aiError: "Fallo al generar contenido con IA."});
    } finally {
      setLoadingAiContent(false);
    }
  };

  const handleSubmit = (isDraft: boolean) => (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDraft && !validate()) return;
    if (isDraft && !name.trim()) {
      setErrors({name: "El nombre de la campaña es obligatorio para guardar como borrador."});
      return;
    }

    const campaignData: Omit<EmailCampaign, 'id' | 'createdAt' | 'status' | 'sentAt'> = {
      name,
      targetClientIds,
      emailSubject,
      emailBody,
      goal,
      keyPoints,
      propertyId: propertyId || undefined,
    };

    if (campaign && campaign.id) {
      const updatedCampaign = updateEmailCampaign(campaign.id, { ...campaignData, status: isDraft ? 'draft' : campaign.status });
      if (updatedCampaign) onSave(updatedCampaign);
    } else {
      const newCampaign = addEmailCampaign(campaignData);
      onSave(newCampaign);
    }
  };
  
  const clientOptions = allClients.map(c => ({ value: c.id, label: `${c.name} (${c.email})`}));
  const propertyOptions = [{value: '', label: 'Ninguna propiedad específica'}, ...allProperties.map(p => ({ value: p.id, label: `${p.address} (${p.type})`}))];

  return (
    <form className="space-y-6 p-1">
      <Input label="Nombre de la Campaña" id="campaign-name" value={name} onChange={e => setName(e.target.value)} error={errors.name} required />
      
      <div>
        <label htmlFor="target-clients" className="block text-sm font-medium text-secondary-700 mb-1">Clientes Destino</label>
        <select 
          multiple 
          id="target-clients"
          value={targetClientIds}
          onChange={e => setTargetClientIds(Array.from(e.target.selectedOptions, option => option.value))}
          className="block w-full h-32 px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          required
        >
          {clientOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {errors.targetClientIds && <p className="mt-1 text-xs text-red-600">{errors.targetClientIds}</p>}
      </div>

      <Card title="Generación de Contenido con IA" titleClassName="text-base">
        <TextArea label="Objetivo de la Campaña (para IA)" id="campaign-goal" value={goal} onChange={e => setGoal(e.target.value)} error={errors.goal} rows={2} placeholder="Ej: Promocionar apartamentos nuevos con vista al mar." />
        <TextArea label="Puntos Clave / Mensaje Adicional (Opcional para IA)" id="campaign-keypoints" value={keyPoints} onChange={e => setKeyPoints(e.target.value)} rows={2} placeholder="Ej: Descuento por tiempo limitado, características únicas..." />
        <Select label="Propiedad Asociada (Opcional para IA)" id="campaign-property" value={propertyId} onChange={e => setPropertyId(e.target.value)} options={propertyOptions} />
        {geminiReady ? (
          <Button type="button" onClick={handleGenerateContent} isLoading={loadingAiContent} leftIcon={<SparklesIcon className="h-5 w-5" />} className="mt-2">
            {loadingAiContent ? 'Generando Contenido...' : 'Generar Asunto y Cuerpo con IA'}
          </Button>
        ) : <p className="text-sm text-yellow-600">Servicio de IA no disponible para generación de contenido.</p>}
        {errors.aiError && <p className="mt-1 text-xs text-red-600">{errors.aiError}</p>}
      </Card>
      
      <Input label="Asunto del Email" id="campaign-subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} error={errors.emailSubject} required />
      <TextArea label="Cuerpo del Email (usa [Nombre del Cliente] para personalizar)" id="campaign-body" value={emailBody} onChange={e => setEmailBody(e.target.value)} error={errors.emailBody} rows={10} required />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="button" variant="secondary" onClick={handleSubmit(true)}>{campaign?.id ? 'Guardar Cambios (Borrador)' : 'Guardar Borrador'}</Button>
        <Button type="button" variant="primary" onClick={handleSubmit(false)} disabled={loadingAiContent}>{campaign?.status === 'sent' ? 'Volver a Guardar' : (campaign?.id ? 'Actualizar y Marcar como Listo para Envío' : 'Guardar y Marcar como Listo para Envío')}</Button>
      </div>
    </form>
  );
};

const CampaignListPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | undefined>(undefined);
  const [campaignToDelete, setCampaignToDelete] = useState<EmailCampaign | undefined>(undefined);
  const [campaignToSend, setCampaignToSend] = useState<EmailCampaign | undefined>(undefined);
  const navigate = useNavigate();

  const loadData = useCallback(() => {
    setCampaigns(getEmailCampaigns().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setClients(getClients());
    setProperties(getProperties());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveCampaign = (campaign: EmailCampaign) => {
    loadData();
    setShowFormModal(false);
    setEditingCampaign(undefined);
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setShowFormModal(true);
  };

  const handleDeleteCampaign = (campaign: EmailCampaign) => {
    setCampaignToDelete(campaign);
  };

  const confirmDelete = () => {
    if (campaignToDelete) {
      deleteEmailCampaign(campaignToDelete.id);
      loadData();
      setCampaignToDelete(undefined);
    }
  };

  const handleSimulateSend = (campaign: EmailCampaign) => {
     if (campaign.status === 'sent') {
        alert("Esta campaña ya ha sido enviada.");
        return;
    }
    setCampaignToSend(campaign);
  };

  const confirmSimulateSend = () => {
    if (campaignToSend) {
      const updatedCampaign = updateEmailCampaign(campaignToSend.id, { status: 'sent', sentAt: new Date().toISOString() });
      if (updatedCampaign) {
        // Log interaction for each client
        updatedCampaign.targetClientIds.forEach(clientId => {
          const client = getClients().find(c => c.id === clientId);
          addInteractionLog({
            clientId: clientId,
            type: 'Email Campaign',
            notes: `Email enviado (simulado) - Campaña: "${updatedCampaign.name}"\nAsunto: ${updatedCampaign.emailSubject}\n\nCuerpo:\n${updatedCampaign.emailBody.replace(/\[Nombre del Cliente\]/g, client?.name || 'Cliente')}`
          });
        });
        loadData();
        alert(`Campaña "${updatedCampaign.name}" marcada como enviada y registrada en interacciones.`);
      }
      setCampaignToSend(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-semibold text-secondary-800">Campañas de Email Marketing</h2>
        <Button onClick={() => { setEditingCampaign(undefined); setShowFormModal(true); }} variant="primary" leftIcon={<PlusIcon className="h-5 w-5" />}>
          Nueva Campaña
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <MailIcon className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600 text-lg">No hay campañas de email creadas.</p>
            <p className="text-secondary-500">Empieza creando tu primera campaña de email marketing.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map(campaign => (
            <Card key={campaign.id} title={campaign.name} actions={
              <div className="flex space-x-2 items-center">
                 <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${campaign.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {campaign.status === 'sent' ? `Enviada ${campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : ''}` : 'Borrador'}
                </span>
                {campaign.status === 'draft' && (
                     <Button size="sm" variant="success" onClick={() => handleSimulateSend(campaign)} leftIcon={<SendIcon className="h-4 w-4"/>} title="Simular Envío">
                        Enviar
                    </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => handleEditCampaign(campaign)} title="Editar"><EditIcon className="h-5 w-5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteCampaign(campaign)} title="Eliminar" className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5" /></Button>
              </div>
            }>
              <p className="text-sm text-secondary-600"><strong>Asunto:</strong> {campaign.emailSubject}</p>
              <p className="text-sm text-secondary-500 mt-1"><strong>Clientes:</strong> {campaign.targetClientIds.length}</p>
              <p className="text-xs text-secondary-400 mt-2">Creada: {new Date(campaign.createdAt).toLocaleString()}</p>
              {campaign.propertyId && <p className="text-xs text-secondary-400">Propiedad: {properties.find(p=>p.id === campaign.propertyId)?.address || 'N/A'}</p>}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showFormModal} onClose={() => { setShowFormModal(false); setEditingCampaign(undefined);}} title={editingCampaign ? 'Editar Campaña' : 'Crear Nueva Campaña'} size="xl">
        <CampaignForm 
            campaign={editingCampaign} 
            onSave={handleSaveCampaign} 
            onCancel={() => { setShowFormModal(false); setEditingCampaign(undefined); }}
            allClients={clients}
            allProperties={properties}
        />
      </Modal>

      <Modal isOpen={!!campaignToDelete} onClose={() => setCampaignToDelete(undefined)} title="Confirmar Eliminación">
        <p>¿Estás seguro de que quieres eliminar la campaña <strong>{campaignToDelete?.name}</strong>? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setCampaignToDelete(undefined)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
        </div>
      </Modal>
      
      <Modal isOpen={!!campaignToSend} onClose={() => setCampaignToSend(undefined)} title="Confirmar Envío Simulado">
        <p>Estás a punto de "enviar" la campaña <strong>{campaignToSend?.name}</strong> a {campaignToSend?.targetClientIds.length} cliente(s).</p>
        <p className="text-sm text-secondary-600 mt-2">Esto marcará la campaña como enviada y registrará una interacción para cada cliente. <strong>No se enviarán emails reales.</strong></p>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setCampaignToSend(undefined)}>Cancelar</Button>
          <Button variant="success" onClick={confirmSimulateSend} leftIcon={<SendIcon className="h-4 w-4"/>}>Confirmar y Enviar</Button>
        </div>
      </Modal>

    </div>
  );
};

export const EmailMarketingPage: React.FC = () => {
    // Could have routes here for /new, /view/:id if needed for more complex UX
    // For now, keeping it simple with modals on the list page.
    return (
        <Routes>
            <Route path="/" element={<CampaignListPage />} />
            {/* Future: <Route path="/view/:campaignId" element={<CampaignDetailView />} /> */}
        </Routes>
    );
};
