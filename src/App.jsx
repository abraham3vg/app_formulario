import React, { useState, useEffect } from 'react';
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
  FileText,
  History,
  Home,
  ChevronRight,
  Calendar,
  Trash2
} from 'lucide-react';
import './App.css';

export default function App() {
  // --- STATE MANAGEMENT ---
  // Persistent Session State (Lazy Initialization)
  const [view, setView] = useState(() => localStorage.getItem('app_view') || 'home');
  const [step, setStep] = useState(() => parseInt(localStorage.getItem('app_step')) || 1);

  // Persistent Form Data
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('app_form_data');
    return saved ? JSON.parse(saved) : {
      clientName: '', businessType: '', role: '', topTimeWaster: '',
      repetitiveTask: '', errorProneTask: '', softwareStack: '',
      volumeOfData: '', teamSize: '', dreamAutomation: ''
    };
  });

  const [audits, setAudits] = useState(() => {
    const saved = localStorage.getItem('audits');
    return saved ? JSON.parse(saved) : [];
  });

  // Transient State
  const [currentAuditId, setCurrentAuditId] = useState(() => {
    const saved = localStorage.getItem('app_current_audit_id');
    return saved ? parseInt(saved) : null;
  });
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // AI State
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // --- EFFECTS FOR PERSISTENCE ---
  useEffect(() => { localStorage.setItem('app_view', view); }, [view]);
  useEffect(() => { localStorage.setItem('app_step', step); }, [step]);
  useEffect(() => { localStorage.setItem('app_form_data', JSON.stringify(formData)); }, [formData]);
  useEffect(() => { localStorage.setItem('audits', JSON.stringify(audits)); }, [audits]);
  useEffect(() => {
    if (currentAuditId) localStorage.setItem('app_current_audit_id', currentAuditId);
    else localStorage.removeItem('app_current_audit_id');
  }, [currentAuditId]);

  // --- INTEGRACIÓN GEMINI API ---
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  const callGemini = async (prompt) => {
    if (!apiKey) {
      console.error("Falta la API Key de Gemini");
      return "Error: No se ha configurado la API Key. Por favor configura VITE_GEMINI_API_KEY en el archivo .env.local";
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (!response.ok) throw new Error(`Error API: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar respuesta.";
    } catch (error) {
      console.error("Error al llamar a Gemini:", error);
      return "Hubo un error al conectar con la IA. Por favor intenta de nuevo.";
    }
  };

  // --- HANDLERS ---
  const handleRefineDream = async () => {
    if (!formData.dreamAutomation) return;
    setIsRefining(true);
    const prompt = `Actúa como un Ingeniero de Soluciones de IA experto. Reescribe la siguiente solicitud informal de un cliente en una especificación técnica profesional y concisa para una propuesta comercial (máximo 2 oraciones). Usa terminología de industria (ej. API, ETL, Webhook, NLP) donde aplique. Solicitud del cliente: "${formData.dreamAutomation}"`;
    const refinedText = await callGemini(prompt);
    setFormData(prev => ({ ...prev, dreamAutomation: refinedText.trim() }));
    setIsRefining(false);
  };

  const handleGenerateStrategy = async (auditToUpdate = null) => {
    setIsGeneratingReport(true);
    const dataForPrompt = auditToUpdate ? auditToUpdate.formData : formData;

    const prompt = `Actúa como un Consultor Senior de Automatización e Inteligencia Artificial. Analiza los siguientes datos recolectados en una entrevista de descubrimiento con un cliente potencial: ${JSON.stringify(dataForPrompt, null, 2)}
        Basado en esto, genera un "Plan de Acción Preliminar" breve pero impactante.
        El formato debe ser texto plano (no markdown complejo) pero estructurado, incluyendo:
        1. 🎯 Diagnóstico Principal (1 frase sobre su mayor cuello de botella).
        2. 💡 3 Soluciones Recomendadas (Prioriza fuertemente **n8n** como la herramienta principal de orquestación. Menciona también Make, Zapier o APIs de IA como OpenAI/Anthropic. **IMPORTANTE: NO sugieras desarrollo de código personalizado en Python**, enfócate exclusivamente en soluciones No-Code/Low-Code ágiles).
        3. 🚀 Estimación de Impacto (ej. "Ahorro potencial de 15 horas/semana").
        Mantén un tono profesional, persuasivo y tecnológico. Usa algunos emojis para resaltar puntos clave.`;

    const report = await callGemini(prompt);

    if (auditToUpdate) {
      const updatedAudits = audits.map(a =>
        a.id === auditToUpdate.id ? { ...a, aiReport: report } : a
      );
      setAudits(updatedAudits);
      setSelectedAudit({ ...auditToUpdate, aiReport: report });
    } else {
      setAiReport(report);
      if (currentAuditId) {
        const updatedAudits = audits.map(a =>
          a.id === currentAuditId ? { ...a, aiReport: report } : a
        );
        setAudits(updatedAudits);
      }
    }
    setIsGeneratingReport(false);
  };

  const updateFormData = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const newAudit = {
      id: Date.now(),
      date: new Date().toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      clientName: formData.clientName || 'Cliente Sin Nombre',
      businessType: formData.businessType || 'General',
      formData: { ...formData },
      aiReport: null
    };
    setAudits([newAudit, ...audits]);
    setCurrentAuditId(newAudit.id);
  };

  const handleDeleteAudit = (e, auditId) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que deseas eliminar esta auditoría?")) {
      setAudits(audits.filter(a => a.id !== auditId));
    }
  };

  const goHome = () => { setView('home'); resetForm(); };
  const startNewAudit = () => { resetForm(); setView('form'); };
  const resetForm = () => {
    setStep(1); setSubmitted(false);
    setFormData({
      clientName: '', businessType: '', role: '', topTimeWaster: '',
      repetitiveTask: '', errorProneTask: '', softwareStack: '',
      volumeOfData: '', teamSize: '', dreamAutomation: ''
    });
    setAiReport(null); setCurrentAuditId(null);
  };
  const goToAudits = () => setView('audits');
  const openAuditDetail = (audit) => { setSelectedAudit(audit); setView('audit-detail'); };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => alert("Copiado al portapapeles"));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white pb-20">
      <header className="bg-slate-950 border-b border-slate-800 p-4 sm:p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div onClick={goHome} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left cursor-pointer group">
            <div className="flex items-center">
              <div style={{ maskImage: 'url("/aione-logo.png")', WebkitMaskImage: 'url("/aione-logo.png")', maskRepeat: 'no-repeat', maskSize: '130%', maskPosition: 'center', backgroundColor: 'white', width: '285px', height: '68px' }} className="opacity-95 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col gap-1">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white inline-block">Aione Agency Form</h1>
                <div className="mt-1"><span className="text-blue-400 text-[10px] sm:text-xs border border-blue-500/30 rounded px-2 py-0.5 bg-blue-500/5">Gemini Powered</span></div>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-widest uppercase">Auditoría de Eficiencia Operativa</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={goToAudits} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'audits' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <History size={16} /> Auditorías ({audits.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-4 sm:px-6">
        {view === 'home' && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
            <div className="bg-blue-500/10 p-6 rounded-full mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <Brain size={64} className="text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6 tracking-tight">Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Aione Agency</span></h1>
            <p className="text-slate-400 text-lg md:text-xl text-center max-w-2xl mb-12">Plataforma de Auditoría y Diagnóstico de Eficiencia Operativa impulsada por IA.</p>
            <button onClick={startNewAudit} className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-xl transform hover:scale-[1.02]">INICIAR AUDITORÍA <ArrowRight className="group-hover:translate-x-1" /></button>
          </div>
        )}

        {view === 'audits' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2"><History className="text-blue-400" /> Historial</h2>
              <button onClick={goHome} className="text-slate-400 hover:text-white text-sm">Volver</button>
            </div>
            {audits.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800"><ClipboardList size={48} className="mx-auto mb-4 opacity-50" /><p>No hay auditorías aún.</p></div>
            ) : (
              <div className="grid gap-4">
                {audits.map((audit) => (
                  <div key={audit.id} onClick={() => openAuditDetail(audit)} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-5 rounded-xl transition-all cursor-pointer group flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400">{audit.clientName}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400"><span>{audit.businessType}</span><span>{audit.date}</span></div>
                      <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] border ${audit.aiReport ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {audit.aiReport ? <CheckCircle2 size={10} /> : <Clock size={10} />} {audit.aiReport ? 'Generada' : 'Pendiente'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => handleDeleteAudit(e, audit.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={18} /></button>
                      <div className="bg-slate-900 p-2 rounded-full text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-all"><ChevronRight size={18} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'audit-detail' && selectedAudit && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={goToAudits} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"><ArrowRight className="rotate-180" size={16} /> Volver</button>
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8">
              <div className="bg-slate-900/50 p-6 border-b border-slate-700">
                <h1 className="text-3xl font-bold text-white mb-2">{selectedAudit.clientName}</h1>
                <div className="text-sm text-slate-400">{selectedAudit.businessType} | {selectedAudit.date}</div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-blue-400 uppercase">Contexto</h3>
                  <div className="text-slate-300 text-sm space-y-4">
                    <div><span className="block text-slate-500 text-xs">Pérdida de Tiempo</span>{selectedAudit.formData.topTimeWaster}</div>
                    <div><span className="block text-slate-500 text-xs">Sueño</span>{selectedAudit.formData.dreamAutomation}</div>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/50">
                  <h3 className="text-sm font-bold text-purple-400 uppercase mb-4 flex items-center gap-2"><Sparkles size={16} /> Estrategia IA</h3>
                  {selectedAudit.aiReport ? (
                    <div className="text-slate-300 text-sm whitespace-pre-line">{selectedAudit.aiReport}<button onClick={() => copyToClipboard(selectedAudit.aiReport)} className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs border border-slate-700"><FileText size={14} /> Copiar</button></div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-500 text-sm mb-4 italic">No generada</p>
                      <button onClick={() => handleGenerateStrategy(selectedAudit)} disabled={isGeneratingReport} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold text-xs disabled:opacity-50 mx-auto">
                        {isGeneratingReport ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />} Generar Ahora
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'form' && (
          <>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden"><div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div></div>
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="text-blue-400" /> Contexto</h2>
                    <div className="grid gap-6">
                      {[['clientName', 'Cliente'], ['businessType', 'Sector']].map(([f, l]) => (
                        <div key={f} className="space-y-2"><label className="text-sm text-slate-300">{l}</label><input type="text" name={f} value={formData[f]} onChange={updateFormData} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white outline-none focus:ring-1 focus:ring-blue-500" /></div>
                      ))}
                    </div>
                    <div className="pt-6 flex justify-end"><button type="button" onClick={handleNext} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2">Siguiente <ArrowRight size={18} /></button></div>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><AlertCircle className="text-orange-400" /> Dolores</h2>
                    <div className="space-y-6">
                      {[['topTimeWaster', 'Tarea que consume tiempo'], ['repetitiveTask', 'Tarea repetitiva']].map(([f, l]) => (
                        <div key={f} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700"><label className="block text-sm font-semibold mb-2">{l}</label><textarea name={f} value={formData[f]} onChange={updateFormData} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none" /></div>
                      ))}
                    </div>
                    <div className="pt-6 flex justify-between"><button type="button" onClick={handleBack} className="text-slate-400 hover:text-white">Atrás</button><button type="button" onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Siguiente</button></div>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white"><Zap className="text-yellow-400" /> Oportunidad</h2>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold">Sueño de Automatización</label>
                        {formData.dreamAutomation && <button type="button" onClick={handleRefineDream} disabled={isRefining} className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1">{isRefining ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Formalizar</button>}
                      </div>
                      <textarea name="dreamAutomation" value={formData.dreamAutomation} onChange={updateFormData} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none" />
                    </div>
                    <div className="pt-6 flex justify-between items-center"><button type="button" onClick={handleBack} className="text-slate-400">Atrás</button><button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-bold">Finalizar</button></div>
                  </div>
                )}
              </form>
            ) : (
              <div className="text-center py-12 animate-in zoom-in">
                <CheckCircle2 size={60} className="text-green-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">¡Guardado!</h2>
                {!aiReport ? (
                  <button onClick={() => handleGenerateStrategy()} disabled={isGeneratingReport} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold mb-8">{isGeneratingReport ? <Loader2 className="animate-spin" /> : <Sparkles />} Generar Estrategia</button>
                ) : (
                  <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-6 mb-8 text-left whitespace-pre-line text-sm text-slate-300">{aiReport}</div>
                )}
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <button onClick={startNewAudit} className="bg-blue-600 text-white py-3 rounded-lg font-bold">Nueva Auditoría</button>
                  <button onClick={goHome} className="bg-slate-800 text-slate-300 py-3 rounded-lg flex items-center justify-center gap-2"><Home size={18} /> Inicio</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
