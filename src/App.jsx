import React, { useState } from 'react';
import {
  Brain,
  Clock,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  Database,
  Users,
  Sparkles,
  Loader2,
  FileText
} from 'lucide-react';
import './App.css'

function App() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Estado para las funciones de IA
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  const [formData, setFormData] = useState({
    clientName: '',
    businessType: '',
    role: '',
    topTimeWaster: '',
    repetitiveTask: '',
    errorProneTask: '',
    softwareStack: '',
    volumeOfData: '',
    teamSize: '',
    dreamAutomation: ''
  });

  // --- INTEGRACIÓN GEMINI API ---
  const apiKey = ""; // La clave se inyecta en tiempo de ejecución

  const callGemini = async (prompt) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar respuesta.";
    } catch (error) {
      console.error("Error al llamar a Gemini:", error);
      return "Hubo un error al conectar con la IA. Por favor intenta de nuevo.";
    }
  };

  // Función 1: Refinar el requerimiento del cliente a lenguaje técnico
  const handleRefineDream = async () => {
    if (!formData.dreamAutomation) return;

    setIsRefining(true);
    const prompt = `Actúa como un Ingeniero de Soluciones de IA experto. Reescribe la siguiente solicitud informal de un cliente en una especificación técnica profesional y concisa para una propuesta comercial (máximo 2 oraciones). Usa terminología de industria (ej. API, ETL, Webhook, NLP) donde aplique.
    
    Solicitud del cliente: "${formData.dreamAutomation}"`;

    const refinedText = await callGemini(prompt);

    setFormData(prev => ({
      ...prev,
      dreamAutomation: refinedText.trim()
    }));
    setIsRefining(false);
  };

  // Función 2: Generar reporte de estrategia completo
  const handleGenerateStrategy = async () => {
    setIsGeneratingReport(true);

    const prompt = `Actúa como un Consultor Senior de Automatización e Inteligencia Artificial.
    Analiza los siguientes datos recolectados en una entrevista de descubrimiento con un cliente potencial:
    
    ${JSON.stringify(formData, null, 2)}
    
    Basado en esto, genera un "Plan de Acción Preliminar" breve pero impactante.
    El formato debe ser texto plano (no markdown complejo) pero estructurado, incluyendo:
    1. 🎯 Diagnóstico Principal (1 frase sobre su mayor cuello de botella).
    2. 💡 3 Soluciones Recomendadas (Prioriza fuertemente **n8n** como la herramienta principal de orquestación. Menciona también Make, Zapier o APIs de IA como OpenAI/Anthropic. **IMPORTANTE: NO sugieras desarrollo de código personalizado en Python**, enfócate exclusivamente en soluciones No-Code/Low-Code ágiles).
    3. 🚀 Estimación de Impacto (ej. "Ahorro potencial de 15 horas/semana").
    
    Mantén un tono profesional, persuasivo y tecnológico. Usa algunos emojis para resaltar puntos clave.`;

    const report = await callGemini(prompt);
    setAiReport(report);
    setIsGeneratingReport(false);
  };

  // --- FIN INTEGRACIÓN ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const copyToClipboard = () => {
    const textToCopy = aiReport
      ? `DATOS DEL CLIENTE:\n${JSON.stringify(formData, null, 2)}\n\nANÁLISIS IA:\n${aiReport}`
      : JSON.stringify(formData, null, 2);

    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert("Informe completo copiado al portapapeles.");
    } catch (err) {
      console.error('Error al copiar', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white pb-20">

      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 sm:p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="flex items-center group">
              <div
                style={{
                  maskImage: 'url("/aione-logo.png")',
                  WebkitMaskImage: 'url("/aione-logo.png")',
                  maskRepeat: 'no-repeat',
                  maskSize: 'contain',
                  maskPosition: 'center',
                  backgroundColor: 'white',
                  width: '320px',
                  height: '60px'
                }}
                className="opacity-95 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white inline-block">Aione Agency Form</h1>
                <div className="mt-1">
                  <span className="text-blue-400 text-[10px] sm:text-xs border border-blue-500/30 rounded px-2 py-0.5 bg-blue-500/5">Gemini Powered</span>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-widest uppercase">Auditoría de Eficiencia Operativa</p>
            </div>
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-500 border-l border-slate-800 pl-4 hidden md:block">
            Fase 1: Diagnóstico
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-12 px-4 sm:px-6">

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-8">
              <div
                className="bg-blue-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>

            {/* Step 1: Contexto */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Users className="text-blue-400" /> Contexto del Negocio
                  </h2>
                  <p className="text-slate-400">Antes de hablar de soluciones, entendamos la estructura actual.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Nombre del Cliente / Empresa</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="Ej. Inmobiliaria López"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Sector / Industria</label>
                    <input
                      type="text"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      placeholder="Ej. E-commerce, Legal, Salud..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Tamaño del Equipo</label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Selecciona...</option>
                      <option value="1 (Soloepreneur)">1 (Soloepreneur)</option>
                      <option value="2-10">2-10 empleados</option>
                      <option value="11-50">11-50 empleados</option>
                      <option value="50+">50+ empleados</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Stack Tecnológico Actual</label>
                    <input
                      type="text"
                      name="softwareStack"
                      value={formData.softwareStack}
                      onChange={handleChange}
                      placeholder="Ej. Excel, Gmail, Salesforce, Notion"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
                  >
                    Siguiente <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Los Dolores (Pain Points) */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="text-orange-400" /> Detección de Cuellos de Botella
                  </h2>
                  <p className="text-slate-400">Identifiquemos dónde se está perdiendo dinero y tiempo.</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <Clock className="text-blue-400 mt-1" size={20} />
                      <label className="text-base font-semibold text-slate-200">
                        ¿Qué tarea consume la mayor parte de tu semana pero aporta poco valor estratégico?
                      </label>
                    </div>
                    <textarea
                      name="topTimeWaster"
                      value={formData.topTimeWaster}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Ej. Responder los mismos emails de dudas frecuentes, agendar citas manualmente, copiar datos de PDF a Excel..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <ClipboardList className="text-purple-400 mt-1" size={20} />
                      <label className="text-base font-semibold text-slate-200">
                        ¿Qué proceso manual es el más repetitivo y tedioso ("copiar y pegar")?
                      </label>
                    </div>
                    <textarea
                      name="repetitiveTask"
                      value={formData.repetitiveTask}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Ej. Pasar leads de Facebook Ads a mi hoja de cálculo y luego mandarles un WhatsApp uno por uno."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-slate-400 hover:text-white font-medium px-4 py-3 transition-colors"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
                  >
                    Siguiente <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Visión y Datos */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Zap className="text-yellow-400" /> Oportunidad de Automatización
                  </h2>
                  <p className="text-slate-400">Vamos a cuantificar el impacto potencial.</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <Database className="text-green-400 mt-1" size={20} />
                      <label className="text-base font-semibold text-slate-200">
                        ¿Dónde ocurren más errores humanos actualmente?
                      </label>
                    </div>
                    <input
                      type="text"
                      name="errorProneTask"
                      value={formData.errorProneTask}
                      onChange={handleChange}
                      placeholder="Ej. Facturación, ingreso de datos de clientes..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors relative">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-pink-400" size={20} />
                        <label className="text-base font-semibold text-slate-200">
                          La Pregunta Mágica:
                        </label>
                      </div>

                      {/* Botón Mágico AI */}
                      {formData.dreamAutomation && (
                        <button
                          type="button"
                          onClick={handleRefineDream}
                          disabled={isRefining}
                          className="flex items-center gap-1.5 text-xs bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-3 py-1 rounded-full transition-all border border-indigo-500/30"
                        >
                          {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          {isRefining ? "Analizando..." : "Formalizar con IA"}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      Si tuvieras una varita mágica para eliminar una sola tarea de tu negocio para siempre, ¿cuál sería?
                    </p>
                    <textarea
                      name="dreamAutomation"
                      value={formData.dreamAutomation}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe la solución ideal..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-slate-400 hover:text-white font-medium px-4 py-3 transition-colors"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-blue-900/40 transform hover:scale-[1.02]"
                  >
                    Finalizar Diagnóstico
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : (
          <div className="text-center py-12 animate-in zoom-in duration-500">
            <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">¡Información Recopilada!</h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-8">
              Datos guardados con éxito. Ahora puedes generar una estrategia preliminar para impresionar al cliente inmediatamente.
            </p>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-left max-w-lg mx-auto mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Brain size={100} />
              </div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Resumen Rápido:</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li><strong className="text-white">Cliente:</strong> {formData.clientName}</li>
                <li><strong className="text-white">Mayor Dolor:</strong> {formData.topTimeWaster}</li>
                <li><strong className="text-white">Sueño:</strong> {formData.dreamAutomation}</li>
              </ul>
            </div>

            {/* SECCIÓN DE REPORTE IA */}
            {!aiReport ? (
              <div className="flex flex-col items-center gap-4 mb-8">
                <button
                  onClick={handleGenerateStrategy}
                  disabled={isGeneratingReport}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-900/40 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGeneratingReport ? (
                    <>
                      <Loader2 className="animate-spin" /> Analizando con Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="text-yellow-200" /> Generar Estrategia de IA
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-500">
                  *Esto generará una propuesta preliminar usando Gemini 2.5 Flash
                </p>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-6 max-w-2xl mx-auto mb-8 text-left animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 mb-4 border-b border-purple-500/20 pb-2">
                  <Sparkles className="text-purple-400" size={20} />
                  <h3 className="text-lg font-bold text-white">Estrategia Generada por IA</h3>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line">
                  {aiReport}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                <FileText size={18} /> Copiar Todo
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Nueva Entrevista
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App
