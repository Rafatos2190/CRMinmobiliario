
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Link, useParams } from 'react-router-dom';
import { Client, InteractionLog } from '../../types';
import { getClients, addClient, updateClient, deleteClient, getClientById, addInteractionLog, getInteractionLogsForClient } from '../../services/dataService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Modal } from '../common/Modal';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Select } from '../common/Select';
import { PlusIcon, EditIcon, TrashIcon, WhatsAppIcon, SparklesIcon, EyeIcon, UsersIcon, MessengerIcon } from '../../constants';
import { suggestWhatsAppMessage, suggestMessengerMessage, isGeminiAvailable } from '../../services/geminiService';

const ClientForm: React.FC<{ client?: Client; onSave: (client: Client) => void; onCancel: () => void }> = ({ client, onSave, onCancel }) => {
  const [name, setName] = useState(client?.name || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [email, setEmail] = useState(client?.email || '');
  const [notes, setNotes] = useState(client?.notes || '');
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'El email no es válido.';
    if (!phone.trim()) newErrors.phone = 'El teléfono es obligatorio.';
    else if (!/^[0-9+\-\s()]*$/.test(phone)) newErrors.phone = 'El formato del teléfono no es válido.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const clientData = { name, phone, email, notes };
    if (client && client.id) {
      const updatedClient = updateClient(client.id, clientData);
      if (updatedClient) onSave(updatedClient);
    } else {
      const newClient = addClient(clientData);
      onSave(newClient);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <Input label="Nombre Completo" id="client-name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
      <Input label="Teléfono" id="client-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} required />
      <Input label="Email" id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <TextArea label="Notas Adicionales" id="client-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary">{client ? 'Guardar Cambios' : 'Crear Cliente'}</Button>
      </div>
    </form>
  );
};

const ClientCardDisplay: React.FC<{ client: Client; onEdit: (client: Client) => void; onDelete: (client: Client) => void; onViewDetails: (client: Client) => void; }> = ({ client, onEdit, onDelete, onViewDetails }) => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState(`Hola ${client.name}, te contacto referente a...`);
  const [loadingWhatsAppSuggestion, setLoadingWhatsAppSuggestion] = useState(false);
  
  const [showMessengerModal, setShowMessengerModal] = useState(false);
  const [messengerMessage, setMessengerMessage] = useState(`Hola ${client.name}, te contacto por Messenger sobre...`);
  const [loadingMessengerSuggestion, setLoadingMessengerSuggestion] = useState(false);

  const geminiReady = isGeminiAvailable();

  const handleOpenWhatsApp = () => {
    const encodedMessage = encodeURIComponent(whatsAppMessage);
    const cleanPhone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
    addInteractionLog({ clientId: client.id, type: 'WhatsApp', notes: `Mensaje de WhatsApp (intento): ${whatsAppMessage}` });
    setShowWhatsAppModal(false);
  };
  
  const handleSuggestWhatsAppMessage = async () => {
    if (!geminiReady) return;
    setLoadingWhatsAppSuggestion(true);
    const suggestion = await suggestWhatsAppMessage(client.name, "un seguimiento general");
    setWhatsAppMessage(suggestion);
    setLoadingWhatsAppSuggestion(false);
  };

  const handleOpenMessenger = () => {
    // We don't have the client's Facebook ID, so we open a generic m.me link
    // The user will need to search for the client.
    window.open(`https://m.me/`, '_blank');
    addInteractionLog({ clientId: client.id, type: 'Messenger', notes: `Intento de contacto por Messenger: ${messengerMessage}` });
    setShowMessengerModal(false);
  };

  const handleSuggestMessengerMessage = async () => {
    if (!geminiReady) return;
    setLoadingMessengerSuggestion(true);
    const suggestion = await suggestMessengerMessage(client.name, "un contacto general");
    setMessengerMessage(suggestion);
    setLoadingMessengerSuggestion(false);
  };


  return (
    <>
      <Card className="hover:shadow-xl transition-shadow duration-200" titleClassName="text-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
                <h3 className="text-xl font-semibold text-primary-700">{client.name}</h3>
                <p className="text-sm text-secondary-600">{client.email || 'Sin email'}</p>
                <p className="text-sm text-secondary-600">{client.phone}</p>
            </div>
            <div className="flex space-x-1 sm:space-x-2 mt-3 sm:mt-0">
                <Button size="sm" variant="ghost" onClick={() => setShowWhatsAppModal(true)} title="Enviar WhatsApp" className="text-green-500 hover:text-green-700 p-2">
                    <WhatsAppIcon className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowMessengerModal(true)} title="Enviar Messenger" className="text-blue-600 hover:text-blue-800 p-2">
                    <MessengerIcon className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onViewDetails(client)} title="Ver Detalles" className="text-blue-500 hover:text-blue-700 p-2">
                    <EyeIcon className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onEdit(client)} title="Editar" className="text-yellow-500 hover:text-yellow-700 p-2">
                    <EditIcon className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(client)} title="Eliminar" className="text-red-500 hover:text-red-700 p-2">
                    <TrashIcon className="h-5 w-5" />
                </Button>
            </div>
        </div>
        {client.notes && <p className="mt-3 text-sm text-secondary-500 italic bg-secondary-50 p-2 rounded">Notas: {client.notes.substring(0,100)}{client.notes.length > 100 && '...'}</p>}
      </Card>

      {/* WhatsApp Modal */}
      <Modal isOpen={showWhatsAppModal} onClose={() => setShowWhatsAppModal(false)} title={`Enviar WhatsApp a ${client.name}`}>
        <TextArea
          label="Mensaje de WhatsApp"
          value={whatsAppMessage}
          onChange={(e) => setWhatsAppMessage(e.target.value)}
          rows={5}
          containerClassName="mb-2"
        />
        {geminiReady && (
          <Button
            variant="ghost"
            onClick={handleSuggestWhatsAppMessage}
            isLoading={loadingWhatsAppSuggestion}
            leftIcon={<SparklesIcon className="h-4 w-4" />}
            className="text-sm mt-1"
          >
            Sugerir con IA
          </Button>
        )}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={() => setShowWhatsAppModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleOpenWhatsApp} leftIcon={<WhatsAppIcon className="h-5 w-5" />}>Abrir WhatsApp</Button>
        </div>
      </Modal>

      {/* Messenger Modal */}
      <Modal isOpen={showMessengerModal} onClose={() => setShowMessengerModal(false)} title={`Enviar Messenger a ${client.name}`}>
        <TextArea
          label="Mensaje de Messenger"
          value={messengerMessage}
          onChange={(e) => setMessengerMessage(e.target.value)}
          rows={5}
          containerClassName="mb-2"
        />
         {geminiReady && (
          <Button
            variant="ghost"
            onClick={handleSuggestMessengerMessage}
            isLoading={loadingMessengerSuggestion}
            leftIcon={<SparklesIcon className="h-4 w-4" />}
            className="text-sm mt-1"
          >
            Sugerir con IA
          </Button>
        )}
        <p className="text-xs text-secondary-500 mt-3">
            Nota: Se abrirá Messenger en una nueva pestaña. Deberás buscar al cliente manualmente ya que no almacenamos IDs de Facebook.
        </p>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={() => setShowMessengerModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleOpenMessenger} leftIcon={<MessengerIcon className="h-5 w-5" />}>Abrir Messenger</Button>
        </div>
      </Modal>
    </>
  );
};

const ClientDetailView: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [interactions, setInteractions] = useState<InteractionLog[]>([]);
    const [newInteractionNote, setNewInteractionNote] = useState('');
    const [newInteractionType, setNewInteractionType] = useState<InteractionLog['type']>('Nota');


    useEffect(() => {
        if (clientId) {
            const fetchedClient = getClientById(clientId);
            if (fetchedClient) {
                setClient(fetchedClient);
                setInteractions(getInteractionLogsForClient(clientId));
            } else {
                navigate('/clients'); // Client not found
            }
        }
    }, [clientId, navigate]);

    const handleAddInteraction = () => {
        if (!client || !newInteractionNote.trim()) return;
        addInteractionLog({
            clientId: client.id,
            type: newInteractionType,
            notes: newInteractionNote
        });
        setInteractions(getInteractionLogsForClient(client.id)); // Refresh interactions
        setNewInteractionNote('');
        setNewInteractionType('Nota'); // Reset type
    };

    if (!client) return <LoadingSpinner fullPage text="Cargando cliente..." />;

    const interactionTypeOptions: { value: InteractionLog['type']; label: string }[] = [
        {value: 'Nota', label: 'Nota'},
        {value: 'Llamada', label: 'Llamada'},
        {value: 'Email', label: 'Email'},
        {value: 'WhatsApp', label: 'WhatsApp'},
        {value: 'Messenger', label: 'Messenger'},
        {value: 'Reunión', label: 'Reunión'},
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-semibold text-secondary-800">{client.name}</h2>
                <Button onClick={() => navigate('/clients')} variant="secondary">Volver a Clientes</Button>
            </div>

            <Card title="Información del Cliente">
                <p><strong>Email:</strong> {client.email || 'N/A'}</p>
                <p><strong>Teléfono:</strong> {client.phone}</p>
                {client.notes && <p className="mt-2"><strong>Notas:</strong> <span className="italic">{client.notes}</span></p>}
                <p className="text-xs text-secondary-400 mt-2">Registrado: {new Date(client.createdAt).toLocaleDateString()}</p>
            </Card>

            <Card title="Historial de Interacciones">
                <div className="space-y-3 mb-4 p-1">
                    <Select 
                        label="Tipo de Interacción"
                        value={newInteractionType}
                        onChange={(e) => setNewInteractionType(e.target.value as InteractionLog['type'])}
                        options={interactionTypeOptions}
                    />
                    <TextArea 
                        label="Nueva Nota de Interacción" 
                        value={newInteractionNote} 
                        onChange={e => setNewInteractionNote(e.target.value)} 
                        placeholder="Detalles de la interacción..."
                        rows={3}
                    />
                    <Button onClick={handleAddInteraction} variant="primary" size="sm">Añadir Interacción</Button>
                </div>
                {interactions.length === 0 ? (
                    <p className="text-secondary-500">No hay interacciones registradas.</p>
                ) : (
                    <ul className="space-y-3">
                        {interactions.map(log => (
                            <li key={log.id} className="p-3 bg-secondary-50 rounded-md shadow-sm">
                                <p className="font-semibold text-sm text-primary-700">{log.type} - <span className="font-normal text-xs text-secondary-500">{new Date(log.timestamp).toLocaleString()}</span></p>
                                <p className="text-sm text-secondary-600 whitespace-pre-wrap">{log.notes}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
};


const ClientListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [clientToDelete, setClientToDelete] = useState<Client | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadClients = useCallback(() => {
    setClients(getClients());
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleSaveClient = (client: Client) => {
    loadClients(); 
    setShowModal(false);
    setEditingClient(undefined);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      loadClients();
      setClientToDelete(undefined);
    }
  };
  
  const handleViewDetails = (client: Client) => {
    navigate(`/clients/view/${client.id}`);
  };


  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-semibold text-secondary-800">Gestión de Clientes</h2>
        <Button onClick={() => { setEditingClient(undefined); setShowModal(true); }} variant="primary" leftIcon={<PlusIcon className="h-5 w-5" />}>
          Añadir Cliente
        </Button>
      </div>
      
      <Input 
        placeholder="Buscar clientes (nombre, email, teléfono)..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="max-w-md"
        containerClassName="mb-0"
      />

      {filteredClients.length === 0 && !searchTerm && clients.length > 0 && (
         <div className="text-center py-10">
            <p className="text-secondary-600 text-lg">No se encontraron clientes para "{searchTerm}". Intenta con otra búsqueda.</p>
         </div>
      )}
      {clients.length === 0 && !searchTerm && (
         <div className="text-center py-10">
            <UsersIcon className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600 text-lg">No hay clientes registrados.</p>
            <p className="text-secondary-500">Empieza añadiendo tu primer cliente.</p>
         </div>
      )}
      {filteredClients.length === 0 && searchTerm && (
         <div className="text-center py-10">
            <p className="text-secondary-600 text-lg">No se encontraron clientes para "{searchTerm}".</p>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <ClientCardDisplay
            key={client.id}
            client={client}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingClient(undefined); }} title={editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}>
        <ClientForm
          client={editingClient}
          onSave={handleSaveClient}
          onCancel={() => { setShowModal(false); setEditingClient(undefined); }}
        />
      </Modal>

      <Modal isOpen={!!clientToDelete} onClose={() => setClientToDelete(undefined)} title="Confirmar Eliminación">
        <p>¿Estás seguro de que quieres eliminar a <strong>{clientToDelete?.name}</strong>? Esta acción no se puede deshacer.</p>
        <p className="text-sm text-red-600 mt-2">También se eliminarán las propiedades e interacciones asociadas a este cliente.</p>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setClientToDelete(undefined)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
};


export const ClientsPage: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<ClientListPage />} />
            <Route path="/view/:clientId" element={<ClientDetailView />} />
        </Routes>
    );
};