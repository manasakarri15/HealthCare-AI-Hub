import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Globe,
  MapPin,
  Mic,
  MicOff,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  Info,
  Check,
  Stethoscope,
  Activity,
  Package,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
    maps?: { uri: string; title: string };
  }>;
  modelUsed?: string;
  toolType?: 'none' | 'googleSearch' | 'googleMaps';
}

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
}) => {
  // System Instruction Roles
  type RoleId = 'triage' | 'metabolic' | 'supplies';
  const [selectedRole, setSelectedRole] = useState<RoleId>('triage');

  const ROLE_CONFIGS: Record<
    RoleId,
    { title: string; subtitle: string; icon: any; instruction: string }
  > = {
    triage: {
      title: 'Clinical Triage & Health Guide',
      subtitle: 'Symptom evaluation, category routing & general health education',
      icon: Stethoscope,
      instruction:
        'You are the HealthCare AI Hub Senior Clinical Triage Nurse and Health Guide. Provide helpful, compassionate, and scientifically grounded healthcare explanations. Clearly structure your answers with bullet points and practical lifestyle insights. You must never provide a binding medical diagnosis or prescriptions. Always recommend consulting a licensed physician or specialist for definitive care, and advise contacting emergency services (911) for acute red flags.',
    },
    metabolic: {
      title: 'Diabetes & Metabolic Specialist',
      subtitle: 'Glycemic thresholds, insulin resistance, HbA1c & nutrition',
      icon: Activity,
      instruction:
        'You are the HealthCare AI Hub Metabolic & Diabetes Specialist Advisor. Explain fasting plasma glucose targets, pre-diabetes reversal, insulin resistance physiology, and lifestyle interventions (diet sequencing, resistance training). Reference clinical guidelines like the American Diabetes Association (ADA). Remind the user that AI assessments are educational risk estimations, not clinical diagnoses.',
    },
    supplies: {
      title: 'Medical Devices & Supplies Advisor',
      subtitle: 'Glucometers, blood pressure cuffs, lancets & therapeutic use',
      icon: Package,
      instruction:
        'You are the HealthCare AI Hub Pharmacy & Medical Equipment Advisor. Assist users with operating wireless glucometers, blood pressure monitors, test strip maintenance, pulse oximeters, and nutritional therapeutics. Offer practical usage instructions and storage precautions.',
    },
  };

  // Model Selection
  type ModelId = 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';
  const [selectedModel, setSelectedModel] = useState<ModelId>('gemini-3.5-flash');

  // Tool Type: 'none' | 'googleSearch' | 'googleMaps'
  const [activeTool, setActiveTool] = useState<'none' | 'googleSearch' | 'googleMaps'>('none');

  // Messages thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      text: "Hello! I am your **HealthCare AI Hub Clinical Companion** powered by Gemini. How can I assist with your health inquiries, metabolic indicators, symptoms, or medical supplies today?\n\n*Feel free to speak via the microphone, ask questions about diabetes or heart health, or search live medical research.*",
      timestamp: 'Just now',
      modelUsed: 'gemini-3.5-flash',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Audio Recording & Transcription
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Set initial topic if provided
  useEffect(() => {
    if (initialTopic && isOpen) {
      setInputPrompt(initialTopic);
    }
  }, [initialTopic, isOpen]);

  if (!isOpen) return null;

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string, toolOverride?: 'none' | 'googleSearch' | 'googleMaps') => {
    const query = (textToSend !== undefined ? textToSend : inputPrompt).trim();
    if (!query || isLoading) return;

    const currentTool = toolOverride || activeTool;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolType: currentTool,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Get location if maps tool is active
      let location: { latitude: number; longitude: number } | undefined = undefined;
      if (currentTool === 'googleMaps' && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          });
          location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        } catch (locErr) {
          // Default location if permission denied or timeout (e.g. San Francisco / NYC medical center coordinate)
          location = { latitude: 37.78193, longitude: -122.40476 };
        }
      }

      // Convert messages to server format
      const formattedForApi = newHistory
        .filter((m) => m.id !== 'welcome_1')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      // In case history only has the new message
      if (formattedForApi.length === 0) {
        formattedForApi.push({ role: 'user', text: query });
      }

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedForApi,
          systemInstruction: ROLE_CONFIGS[selectedRole].instruction,
          model: selectedModel,
          toolType: currentTool,
          location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        text: data.text || 'I have reviewed your query, but could not produce a text summary.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingChunks: data.groundingChunks || [],
        modelUsed: data.modelUsed || selectedModel,
        toolType: currentTool,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        text: `**Service Notice:** ${err.message || 'Unable to communicate with the Gemini API server. Please check your network and API key configuration in Settings > Secrets.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Microphone Audio Recording & gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          if (base64Data) {
            setIsTranscribing(true);
            try {
              const res = await fetch('/api/gemini/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioData: base64Data,
                  mimeType: 'audio/webm',
                  prompt: 'Transcribe this spoken medical or healthcare query clearly and accurately.',
                }),
              });

              if (res.ok) {
                const data = await res.json();
                if (data.transcript) {
                  setInputPrompt((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
                }
              }
            } catch (transcribeErr) {
              console.error('Transcription error:', transcribeErr);
            } finally {
              setIsTranscribing(false);
            }
          }
        };
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (micErr) {
      console.error('Microphone access denied:', micErr);
      alert('Microphone access is required for audio transcription. Please allow mic permissions in your browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Helper to render markdown-like bullet points and bolding
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Parse **bold** and *italic*
          const formatInline = (str: string) => {
            const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
            return parts.map((p, pIdx) => {
              if (p.startsWith('**') && p.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-slate-900">
                    {p.slice(2, -2)}
                  </strong>
                );
              }
              if (p.startsWith('*') && p.endsWith('*')) {
                return (
                  <em key={pIdx} className="italic text-slate-700">
                    {p.slice(1, -1)}
                  </em>
                );
              }
              return p;
            });
          };

          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-teal-600 font-bold shrink-0">•</span>
                <span>{formatInline(trimmed.substring(2))}</span>
              </div>
            );
          }

          if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ') || trimmed.startsWith('4. ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-teal-700 font-bold shrink-0">{trimmed.slice(0, 3)}</span>
                <span>{formatInline(trimmed.slice(3))}</span>
              </div>
            );
          }

          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 text-xs mt-2 pt-1 border-t border-slate-100">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }

          return <p key={idx}>{formatInline(line)}</p>;
        })}
      </div>
    );
  };

  const ActiveRoleIcon = ROLE_CONFIGS[selectedRole].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh] max-h-[820px] relative">
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 sm:py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <ActiveRoleIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{ROLE_CONFIGS[selectedRole].title}</h3>
                <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold font-mono">
                  {selectedModel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {ROLE_CONFIGS[selectedRole].subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'reset_1',
                    role: 'assistant',
                    text: 'Conversation history cleared. Ready for your next health question.',
                    timestamp: 'Just now',
                    modelUsed: selectedModel,
                  },
                ])
              }
              title="Clear Thread"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Control Bar: Role Selection, Model Selection, Grounding Tools */}
        <div className="px-4 sm:px-6 py-2 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Role selector dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleId)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-teal-600 text-[11px] cursor-pointer"
            >
              <option value="triage">Clinical Triage Nurse</option>
              <option value="metabolic">Diabetes & Metabolic Specialist</option>
              <option value="supplies">Medical Supplies Advisor</option>
            </select>
          </div>

          {/* Model selector dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ModelId)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-teal-600 text-[11px] cursor-pointer"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
            </select>
          </div>

          {/* Grounding toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTool(activeTool === 'googleSearch' ? 'none' : 'googleSearch')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                activeTool === 'googleSearch'
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Ground response with live Google Search data"
            >
              <Globe className="w-3 h-3 text-blue-600" />
              <span>Search Grounding</span>
            </button>

            <button
              onClick={() => setActiveTool(activeTool === 'googleMaps' ? 'none' : 'googleMaps')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                activeTool === 'googleMaps'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Ground response with Google Maps clinic & hospital data"
            >
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>Maps Grounding</span>
            </button>
          </div>
        </div>

        {/* Active Grounding Notice Banner if toggled */}
        {activeTool !== 'none' && (
          <div
            className={`px-6 py-1.5 text-[11px] font-medium flex items-center justify-between border-b ${
              activeTool === 'googleSearch'
                ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {activeTool === 'googleSearch' ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-700" />
                  <span>
                    <strong>Google Search Grounding Enabled:</strong> Model will verify medical facts and provide web sources.
                  </span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    <strong>Google Maps Grounding Enabled:</strong> Model will query local clinics, doctors, and hospitals.
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => setActiveTool('none')}
              className="text-xs hover:underline font-semibold"
            >
              Disable
            </button>
          </div>
        )}

        {/* Scrollable Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-2xs ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs space-y-2.5 shadow-2xs ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Content body */}
                  <div>
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}
                  </div>

                  {/* Grounding Citations / Links if present */}
                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1.5">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider block">
                        Verified Clinical & Map Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingChunks.map((chunk, cIdx) => {
                          const link = chunk.web || chunk.maps;
                          if (!link?.uri) return null;
                          return (
                            <a
                              key={cIdx}
                              href={link.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-teal-800 rounded-md border border-slate-200 transition-colors"
                            >
                              {chunk.maps ? (
                                <MapPin className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Globe className="w-3 h-3 text-blue-600" />
                              )}
                              <span className="max-w-[200px] truncate">{link.title || link.uri}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Meta strip */}
                  <div
                    className={`flex items-center justify-between text-[10px] ${
                      isUser ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.modelUsed && (
                      <span className="font-mono">{msg.modelUsed}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-2xs flex items-center gap-2 text-xs text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                <span>
                  {activeTool === 'googleSearch'
                    ? 'Retrieving live medical search grounding...'
                    : activeTool === 'googleMaps'
                    ? 'Locating clinical centers via Google Maps...'
                    : 'Generating clinically grounded response...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-4 sm:px-6 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-slate-400 shrink-0 font-medium">Suggestions:</span>
          {[
            'Explain fasting glucose normal vs pre-diabetic',
            'Find nearby urgent care or diabetes clinics',
            'What lifestyle changes reverse insulin resistance?',
            'How accurate are wireless blood glucose monitors?',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                if (prompt.includes('nearby')) {
                  setActiveTool('googleMaps');
                  handleSendMessage(prompt, 'googleMaps');
                } else if (prompt.includes('Explain') || prompt.includes('accurate')) {
                  setActiveTool('googleSearch');
                  handleSendMessage(prompt, 'googleSearch');
                } else {
                  handleSendMessage(prompt);
                }
              }}
              className="px-2.5 py-1 bg-slate-50 hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-900 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Bottom Input Form */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Audio Recording Button (`gemini-3.5-transcribe`) */}
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isTranscribing}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                  : isTranscribing
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={
                isRecording
                  ? 'Stop recording and transcribe audio'
                  : 'Record spoken symptoms with gemini-3.5-transcribe'
              }
            >
              {isTranscribing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Input field */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={
                  isRecording
                    ? 'Listening... Speak your symptom or medical question clearly'
                    : isTranscribing
                    ? 'Transcribing audio with gemini-3.5-transcribe...'
                    : 'Ask about diabetes risk, symptoms, specialist guidance, or medications...'
                }
                className="w-full pl-3 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none bg-slate-50/50"
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Educational Disclaimer */}
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-500" />
              <span>AI educational assistant. Not a substitute for licensed medical diagnosis or emergency care.</span>
            </span>
            <span className="font-mono">Google GenAI 2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
