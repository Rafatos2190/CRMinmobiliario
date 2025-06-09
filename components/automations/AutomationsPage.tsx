
import React, { useState, useEffect, useRef } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { TextArea } from '../common/TextArea';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { isGeminiAvailable, createChatSession, suggestManualReply } from '../../services/geminiService';
import { CogIcon, SparklesIcon, SendIcon, ClipboardIcon } from '../../constants';

const AUTOMATION_CONFIG_KEY = 'crm_automation_config_v1';

interface AutomationConfig {
  customerServiceSystemPrompt: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const AutomationsPage: React.FC = () => {
  const [config, setConfig] = useState<AutomationConfig>({
    customerServiceSystemPrompt: "Eres un asistente virtual amigable y eficiente para nuestra inmobiliaria. Tu objetivo principal es ayudar a los usuarios con preguntas frecuentes sobre propiedades, agendar visitas y capturar información de contacto si es necesario. Responde de manera concisa y profesional."
  });
  const [tempPrompt, setTempPrompt] = useState(config.customerServiceSystemPrompt);
  const [isSaving, setIsSaving] = useState(false);
  const [geminiReady, setGeminiReady] = useState(false);

  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const chatMessagesEndRef = useRef<null | HTMLDivElement>(null);

  // State for Manual Reply Assistant
  const [receivedMessage, setReceivedMessage] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [suggestedReply, setSuggestedReply] = useState('');
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replyCopied, setReplyCopied] = useState(false);


  useEffect(() => {
    setGeminiReady(isGeminiAvailable());
    const savedConfig = localStorage.getItem(AUTOMATION_CONFIG_KEY);
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig) as AutomationConfig;
      setConfig(parsedConfig);
      setTempPrompt(parsedConfig.customerServiceSystemPrompt);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat messages
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSaveConfig = () => {
    setIsSaving(true);
    setConfig(prev => ({ ...prev, customerServiceSystemPrompt: tempPrompt }));
    localStorage.setItem(AUTOMATION_CONFIG_KEY, JSON.stringify({ customerServiceSystemPrompt: tempPrompt }));
    // If a chat session exists, we might want to restart it with the new prompt
    if (chatSession) {
        const newSession = createChatSession(tempPrompt);
        setChatSession(newSession);
        setChatMessages([]); // Clear previous messages as context has changed
        if(newSession) {
             console.log("Chat session restarted with new prompt.");
        } else if (geminiReady) {
            console.error("Failed to restart chat session with new prompt.");
        }
    }
    setTimeout(() => setIsSaving(false), 1000); // Simulate save
  };

  const initializeChat = () => {
    if (!geminiReady) {
      alert("El servicio de IA no está disponible. Verifica la configuración de la API Key de Gemini.");
      return null;
    }
    const newChat = createChatSession(config.customerServiceSystemPrompt);
    setChatSession(newChat);
    if (!newChat) {
        alert("No se pudo iniciar la sesión de chat con IA. Revisa la consola para más detalles.");
    }
    return newChat;
  };

  const handleSendMessageToChatbot = async () => {
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
        // Add error message to chat
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
    } catch (error) {
      console.error("Error sending message to AI chat:", error);
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

  const handleGenerateManualReply = async () => {
    if (!receivedMessage.trim()) {
        setReplyError("Por favor, ingresa el mensaje recibido del cliente.");
        return;
    }
    if (!geminiReady) {
        setReplyError("Servicio de IA no disponible. Verifica la configuración de la API Key.");
        return;
    }
    setIsLoadingReply(true);
    setSuggestedReply('');
    setReplyError('');
    try {
        const reply = await suggestManualReply(receivedMessage, additionalContext);
        setSuggestedReply(reply);
    } catch (e) {
        console.error("Error generating manual reply:", e);
        setReplyError(e instanceof Error ? e.message : "Ocurrió un error al generar la sugerencia.");
    } finally {
        setIsLoadingReply(false);
    }
  };

  const handleCopyReply = () => {
    if (!suggestedReply) return;
    navigator.clipboard.writeText(suggestedReply)
      .then(() => {
        setReplyCopied(true);
        setTimeout(() => setReplyCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy reply: ', err);
        setReplyError('No se pudo copiar la sugerencia.');
      });
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <CogIcon className="h-8 w-8 text-primary-600" />
        <h2 className="text-3xl font-semibold text-secondary-800">Automatizaciones y Asistente IA</h2>
      </div>

      {!geminiReady && (
        <Card>
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-bold">Servicio de IA no disponible</p>
            <p>Las funciones de automatización y asistente IA requieren una API Key de Gemini válida y configurada. Por favor, asegúrate de que esté correctamente establecida.</p>
          </div>
        </Card>
      )}

      <Card title="Asistente de Respuestas Manual">
        <p className="text-sm text-secondary-600 mb-4">
          Pega un mensaje recibido de un cliente y la IA te sugerirá una respuesta. Puedes añadir contexto para mejorar la sugerencia.
        </p>
        <div className="space-y-4">
            <TextArea
                label="Mensaje Recibido del Cliente"
                id="received-message"
                value={receivedMessage}
                onChange={(e) => setReceivedMessage(e.target.value)}
                rows={4}
                placeholder="Pega aquí el mensaje del cliente..."
                disabled={!geminiReady || isLoadingReply}
            />
            <Input
                label="Contexto Adicional (Opcional)"
                id="additional-context"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Ej: Cliente interesado en propiedad X, preguntó por financiamiento..."
                disabled={!geminiReady || isLoadingReply}
            />
            {replyError && <p className="text-sm text-red-600">{replyError}</p>}
            <Button
                onClick={handleGenerateManualReply}
                isLoading={isLoadingReply}
                disabled={!geminiReady || isLoadingReply || !receivedMessage.trim()}
                leftIcon={<SparklesIcon className="h-5 w-5" />}
            >
                {isLoadingReply ? 'Generando Sugerencia...' : 'Generar Sugerencia de Respuesta'}
            </Button>

            {suggestedReply && (
                <div className="mt-4 space-y-2">
                    <TextArea
                        label="Respuesta Sugerida por IA"
                        id="suggested-reply"
                        value={suggestedReply}
                        readOnly
                        rows={5}
                        className="bg-white text-secondary-800 read-only:bg-secondary-100"
                    />
                    <Button
                        onClick={handleCopyReply}
                        leftIcon={<ClipboardIcon className="h-5 w-5" />}
                        variant="secondary"
                    >
                        {replyCopied ? '¡Copiado!' : 'Copiar Sugerencia'}
                    </Button>
                </div>
            )}
             {isLoadingReply && <LoadingSpinner text="IA pensando en una respuesta..." className="mt-3"/>}
        </div>
      </Card>


      <Card title="Configuración del Asistente de Chat IA para Clientes (Prueba)">
        <p className="text-sm text-secondary-600 mb-4">
          Define la personalidad y las instrucciones base para tu asistente de chat IA. Este texto guiará cómo el asistente interactúa con los usuarios en el chat de prueba a continuación.
        </p>
        <TextArea
          label="Instrucción de Sistema / Personalidad del Asistente IA (para chat de prueba)"
          id="system-prompt"
          value={tempPrompt}
          onChange={(e) => setTempPrompt(e.target.value)}
          rows={6}
          placeholder="Ej: Eres un asistente amigable y profesional..."
          disabled={!geminiReady || isSaving}
        />
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleSaveConfig} 
            isLoading={isSaving} 
            disabled={!geminiReady || isSaving || tempPrompt === config.customerServiceSystemPrompt}
          >
            {isSaving ? 'Guardando...' : 'Guardar Configuración y Reiniciar Chat de Prueba'}
          </Button>
        </div>
      </Card>

      <Card title="Probar Asistente de Chat IA (Simulación Cliente)">
        <p className="text-sm text-secondary-600 mb-4">
          Interactúa con el asistente IA configurado arriba. Los mensajes aquí simulan una conversación con un cliente.
        </p>
        <div className="border border-secondary-300 rounded-lg h-96 flex flex-col">
          <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-secondary-50">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-primary-500 text-white' : 'bg-secondary-200 text-secondary-800'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-200' : 'text-secondary-400'}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isAiResponding && (
                <div className="flex justify-start">
                    <div className="max-w-[70%] p-3 rounded-lg bg-secondary-200 text-secondary-800">
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
                id="user-chat-input"
                placeholder={geminiReady && chatSession ? "Escribe tu mensaje..." : (geminiReady ? "Inicia el chat para escribir" : "Servicio de IA no disponible")}
                value={currentUserMessage}
                onChange={(e) => setCurrentUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isAiResponding && handleSendMessageToChatbot()}
                className="flex-grow"
                containerClassName="mb-0 flex-grow"
                disabled={!geminiReady || isAiResponding || !chatSession}
              />
              <Button 
                onClick={handleSendMessageToChatbot} 
                disabled={!geminiReady || isAiResponding || !currentUserMessage.trim() || !chatSession}
                leftIcon={<SendIcon className="h-5 w-5"/>}
                aria-label="Enviar mensaje"
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>
        {!chatSession && geminiReady && (
            <div className="mt-4 text-center">
                <Button onClick={initializeChat} leftIcon={<SparklesIcon className="h-5 w-5"/>}>
                    Iniciar Chat de Prueba con IA
                </Button>
            </div>
        )}
      </Card>
    </div>
  );
};
