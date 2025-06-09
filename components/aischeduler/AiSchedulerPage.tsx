
import React, { useState, useEffect, useRef } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal'; // Import Modal
import { isGeminiAvailable, createChatSession } from '../../services/geminiService';
import { getScheduledAppointments, addScheduledAppointment, deleteScheduledAppointment } from '../../services/dataService';
import { ScheduledAppointment } from '../../types';
import { CalendarSparkleIcon, SparklesIcon, SendIcon, TrashIcon } from '../../constants';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AI_SCHEDULER_SYSTEM_PROMPT = `Eres un asistente virtual especializado en agendar citas para una inmobiliaria. Tu objetivo es ayudar a los usuarios a encontrar un horario disponible para visitar propiedades o hablar con un agente. 
Pregunta por la propiedad de interés (si la hay), día y hora preferida. Sé amable y eficiente. 
Si el usuario te pide agendar una cita, asegúrate de obtener: 
1. El nombre de la propiedad o tipo de propiedad que le interesa (o el motivo de la cita).
2. El día preferido para la cita (intenta obtenerlo en formato YYYY-MM-DD).
3. La hora preferida (intenta obtenerla en formato HH:MM AM/PM).
Una vez tengas esta información, confirma la cita. Cuando confirmes una cita, DEBES usar el siguiente formato exacto en tu respuesta:
'¡Perfecto! He agendado tu cita para [Descripción de la Cita/Propiedad] el [YYYY-MM-DD] a las [HH:MM AM/PM]. ¿Hay algo más en lo que pueda ayudarte?'
Reemplaza los corchetes [] con la información real. Por ejemplo: '¡Perfecto! He agendado tu cita para Visita a Casa Moderna en Santa Tecla el 2024-08-15 a las 10:00 AM. ¿Hay algo más en lo que pueda ayudarte?'
Si el usuario solo saluda o no especifica, preséntate y ofrece tu ayuda para agendar.`;

export const AiSchedulerPage: React.FC = () => {
  const [geminiReady, setGeminiReady] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const chatMessagesEndRef = useRef<null | HTMLDivElement>(null);

  const [scheduledAppointments, setScheduledAppointments] = useState<ScheduledAppointment[]>([]);
  const [appointmentToDelete, setAppointmentToDelete] = useState<ScheduledAppointment | null>(null);


  const loadAppointments = () => {
    setScheduledAppointments(getScheduledAppointments());
  };

  useEffect(() => {
    setGeminiReady(isGeminiAvailable());
    loadAppointments();
  }, []);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const initializeChat = () => {
    if (!geminiReady) {
      alert("El servicio de IA no está disponible. Verifica la configuración de la API Key de Gemini.");
      return null;
    }
    const newChat = createChatSession(AI_SCHEDULER_SYSTEM_PROMPT);
    setChatSession(newChat);
    setChatMessages([]); 
    if (newChat) {
        setChatMessages([{
            id: crypto.randomUUID(),
            text: "¡Hola! Soy tu asistente virtual para agendar citas. ¿Cómo puedo ayudarte hoy a programar una visita o consulta?",
            sender: 'ai',
            timestamp: new Date()
        }]);
    } else {
        alert("No se pudo iniciar la sesión de chat con IA. Revisa la consola para más detalles.");
    }
    return newChat;
  };

  const parseAndSaveAppointment = (aiResponseText: string) => {
    // Regex to capture: Descripción de la Cita/Propiedad, YYYY-MM-DD, HH:MM AM/PM
    const appointmentRegex = /¡Perfecto! He agendado tu cita para (.*?) el (\d{4}-\d{2}-\d{2}) a las (\d{1,2}:\d{2}\s*(?:AM|PM))\.(.*)/i;
    const match = aiResponseText.match(appointmentRegex);

    if (match) {
      const [, title, date, time, rest] = match; // rest captures anything after the appointment confirmation.
      
      // Basic validation
      if (title.trim() && date && time) {
        const newAppointment: Omit<ScheduledAppointment, 'id' | 'createdAt'> = {
          title: title.trim(),
          date,
          time,
          fullDetails: aiResponseText,
        };
        addScheduledAppointment(newAppointment);
        loadAppointments(); // Refresh the list
        console.log("Appointment saved:", newAppointment);
        return true;
      }
    }
    return false;
  };

  const handleSendMessage = async () => {
    if (!currentUserMessage.trim() || isAiResponding) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      text: currentUserMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setCurrentUserMessage('');
    setIsAiResponding(true);

    let currentChat = chatSession;
    if (!currentChat) {
      currentChat = initializeChat();
      if (!currentChat) {
        setIsAiResponding(false);
        setChatMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            text: "Error: No se pudo iniciar la sesión de chat con IA.",
            sender: 'ai',
            timestamp: new Date()
        }]);
        return;
      }
    }
    
    try {
      const response: GenerateContentResponse = await currentChat.sendMessage({ message: userMsg.text });
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: response.text,
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);

      parseAndSaveAppointment(response.text);

    } catch (error) {
      console.error("Error sending message to AI scheduler chat:", error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: "Hubo un error al obtener la respuesta de la IA. Inténtalo de nuevo.",
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleDeleteAppointment = (appointment: ScheduledAppointment) => {
    setAppointmentToDelete(appointment);
  };

  const confirmDeleteAppointment = () => {
    if (appointmentToDelete) {
      deleteScheduledAppointment(appointmentToDelete.id);
      loadAppointments();
      setAppointmentToDelete(null);
    }
  };
  
  const formatDate = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString}T${timeString.replace(/(AM|PM)/i, '').trim()}:00`);
     if (timeString.toLowerCase().includes('pm') && date.getHours() < 12) {
        date.setHours(date.getHours() + 12);
    } else if (timeString.toLowerCase().includes('am') && date.getHours() === 12) { // Midnight case 12 AM
        date.setHours(0);
    }
    return date.toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <CalendarSparkleIcon className="h-8 w-8 text-primary-600" />
        <h2 className="text-3xl font-semibold text-secondary-800">Agente IA para Agendar Citas</h2>
      </div>

      {!geminiReady && (
        <Card>
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-bold">Servicio de IA no disponible</p>
            <p>Las funciones de Agente IA para Citas requieren una API Key de Gemini válida y configurada.</p>
          </div>
        </Card>
      )}
      
      <p className="text-sm text-secondary-600">
        Utiliza este chat para interactuar con un asistente de IA diseñado para ayudarte a programar citas. Las citas confirmadas aparecerán en la sección "Próximas Citas Agendadas".
      </p>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="Chat de Agendamiento">
        <div className="border border-secondary-300 rounded-lg h-[60vh] max-h-[700px] flex flex-col">
          <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-secondary-50">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${msg.sender === 'user' ? 'bg-primary-500 text-white' : 'bg-white text-secondary-800 border border-secondary-200'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-200' : 'text-secondary-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isAiResponding && (
                <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-white text-secondary-800 border border-secondary-200 shadow-sm">
                        <LoadingSpinner size="sm" color="text-primary-600" className="inline-block" />
                        <span className="ml-2 text-sm italic">IA está escribiendo...</span>
                    </div>
                </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>
          <div className="p-3 border-t border-secondary-300 bg-white">
            <div className="flex items-center space-x-2">
              <Input
                id="user-scheduler-input"
                placeholder={geminiReady ? "Escribe tu solicitud de cita..." : "Servicio de IA no disponible"}
                value={currentUserMessage}
                onChange={(e) => setCurrentUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isAiResponding && handleSendMessage()}
                className="flex-grow"
                containerClassName="mb-0 flex-grow"
                disabled={!geminiReady || isAiResponding || !chatSession}
                aria-label="Mensaje para el agente IA de citas"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!geminiReady || isAiResponding || !currentUserMessage.trim() || !chatSession}
                leftIcon={<SendIcon className="h-5 w-5"/>}
                aria-label="Enviar mensaje para agendar cita"
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>
        {!chatSession && geminiReady && (
            <div className="mt-4 text-center">
                <Button onClick={initializeChat} leftIcon={<SparklesIcon className="h-5 w-5"/>} variant="primary">
                    Iniciar Chat con Agente IA de Citas
                </Button>
            </div>
        )}
         {!geminiReady && (
            <div className="mt-4 text-center">
                <p className="text-secondary-500">El chat con IA no está disponible. Verifica la configuración.</p>
            </div>
        )}
      </Card>

      <Card title="Próximas Citas Agendadas">
        <div className="h-[calc(60vh+80px)] max-h-[780px] overflow-y-auto space-y-3 pr-2"> {/* Adjusted height to roughly match chat */}
            {scheduledAppointments.length === 0 && (
                <p className="text-secondary-500 text-center py-4">No hay citas agendadas todavía.</p>
            )}
            {scheduledAppointments.map(app => (
                <div key={app.id} className="p-4 border border-secondary-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-primary-700">{app.title}</h4>
                            <p className="text-sm text-secondary-600">{formatDate(app.date, app.time)}</p>
                            <p className="text-xs text-secondary-400 mt-1">Agendada: {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteAppointment(app)} 
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Eliminar cita para ${app.title}`}
                        >
                            <TrashIcon className="h-5 w-5"/>
                        </Button>
                    </div>
                    <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-secondary-500 hover:text-secondary-700">Detalles de confirmación IA</summary>
                        <p className="mt-1 text-secondary-500 bg-secondary-50 p-2 rounded whitespace-pre-wrap">{app.fullDetails}</p>
                    </details>
                </div>
            ))}
        </div>
      </Card>
    </div>

     <Modal isOpen={!!appointmentToDelete} onClose={() => setAppointmentToDelete(null)} title="Confirmar Eliminación de Cita">
        {appointmentToDelete && (
            <p>¿Estás seguro de que quieres eliminar la cita para <strong>{appointmentToDelete.title}</strong> el {formatDate(appointmentToDelete.date, appointmentToDelete.time)}?</p>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setAppointmentToDelete(null)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDeleteAppointment}>Eliminar Cita</Button>
        </div>
      </Modal>

    </div>
  );
};
