import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Youtube, 
  Code2, 
  Layers, 
  Image as ImageIcon, 
  Sparkles,
  Loader2,
  Video,
  Download,
  Music,
  AlertCircle,
  Key,
  MonitorPlay,
  RefreshCcw,
  ExternalLink,
  CheckCircle2,
  Lock,
  Settings,
  Terminal,
  Play,
  Copy,
  Cpu
} from 'lucide-react';

// --- Global Type Augmentation ---
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

// --- SDK Configuration & Error Helpers ---
const isAuthOrQuotaError = (error: any) => {
  const errStr = JSON.stringify(error).toLowerCase();
  const msg = error?.message?.toLowerCase() || "";
  return errStr.includes("resource_exhausted") || 
         errStr.includes("429") || 
         errStr.includes("permission_denied") || 
         errStr.includes("403") ||
         errStr.includes("requested entity was not found") ||
         msg.includes("quota") ||
         msg.includes("limit");
};

// --- Components ---

const ApiKeyGuard = ({ onProceed }: { onProceed: () => void }) => {
  const [checking, setChecking] = useState(true);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
      setChecking(false);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      onProceed();
    }
  };

  if (checking) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
    </div>
  );

  if (hasKey) {
    onProceed();
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-md w-full glass-panel rounded-[2.5rem] p-10 shadow-2xl text-center relative z-10">
        <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-orange-500/20">
          <Key className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter italic uppercase">Studio Access</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          To generate Java programming videos, you must connect a paid API key from a Google Cloud Project with billing enabled.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={handleSelectKey}
            className="w-full bg-white text-slate-950 hover:bg-orange-500 hover:text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg uppercase tracking-widest text-xs"
          >
            <Settings className="w-5 h-5" />
            Connect Studio Key
          </button>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-orange-400 transition-colors uppercase tracking-[0.2em]"
          >
            Billing Info <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

const Header = ({ onSwitchKey }: { onSwitchKey: () => void }) => (
  <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-orange-600 p-2 rounded-xl">
          <Youtube className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter text-white italic leading-none uppercase">Java<span className="text-orange-600">Studio</span></span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Production Suite</span>
        </div>
      </div>
      <button 
        onClick={onSwitchKey}
        className="flex items-center gap-2 px-5 py-2 rounded-full glass-panel hover:bg-orange-600 hover:text-white text-[10px] font-black text-slate-400 transition-all uppercase tracking-widest"
      >
        <Key className="w-3.5 h-3.5" />
        Switch Key
      </button>
    </div>
  </header>
);

const CodeBlock = ({ code }: { code: string }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="relative group rounded-3xl overflow-hidden bg-slate-950 border border-white/10 my-6 shadow-2xl">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/50 border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
        </div>
        <button onClick={copyToClipboard} className="text-slate-500 hover:text-white transition-colors">
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-8 overflow-x-auto bg-[#0d1117]">
        <pre className="font-mono text-sm leading-relaxed text-slate-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

function AppContent() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string>('');

  const generateBlueprint = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setVideoUrl(null);
    setThumbnail(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Switched to gemini-3-flash-preview to avoid 429 quota issues common with Pro models
      const prompt = `Act as an elite Java programming YouTuber. Create a high-production video blueprint.
      Input: "${input}"
      Focus on technical depth and visual clarity.
      Return JSON: {
        title: string,
        hook: string,
        narrative: string,
        script: [{ timestamp: string, talk: string, visual: string }],
        codeSnippet: string,
        seo: { tags: string[], description: string },
        atmosphere: { music: string, vfx: string }
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              hook: { type: Type.STRING },
              narrative: { type: Type.STRING },
              script: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timestamp: { type: Type.STRING },
                    talk: { type: Type.STRING },
                    visual: { type: Type.STRING }
                  },
                  required: ["timestamp", "talk", "visual"]
                }
              },
              codeSnippet: { type: Type.STRING },
              seo: {
                type: Type.OBJECT,
                properties: {
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING }
                }
              },
              atmosphere: {
                type: Type.OBJECT,
                properties: {
                  music: { type: Type.STRING },
                  vfx: { type: Type.STRING }
                }
              }
            },
            required: ["title", "hook", "narrative", "script", "codeSnippet", "seo", "atmosphere"]
          }
        }
      });

      setBlueprint(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error("Production Error:", error);
      if (isAuthOrQuotaError(error)) {
        setErrorMsg("Quota Exceeded (429). Please wait a minute or connect a paid billing account key via the header button.");
        if (JSON.stringify(error).includes("requested entity was not found")) {
            window.aistudio?.openSelectKey();
        }
      } else {
        setErrorMsg("Production engine failed. Please try a different Java topic.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnail = async () => {
    if (!blueprint?.title) return;
    setThumbnailLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using gemini-2.5-flash-image for reliable thumbnail generation
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `A high-quality YouTube thumbnail for a Java tutorial titled: "${blueprint.title}". Visuals: Glowing code, digital architecture, modern tech vibe, 16:9.` }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) setThumbnail(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    } catch (error: any) {
      console.error("Thumbnail error:", error);
      if (isAuthOrQuotaError(error)) window.aistudio?.openSelectKey();
    } finally {
      setThumbnailLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!blueprint?.hook) return;
    setVideoLoading(true);
    setVideoStatus('Initializing Veo Engine...');
    setVideoUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const videoPrompt = `Cinematic intro for Java video "${blueprint.title}". Visuals: Glowing circuits, streaming code, professional 3D tech atmosphere. Action: ${blueprint.hook}`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      setVideoStatus('Processing frames (1-3 mins)...');
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        setVideoStatus('Rendering cinematic assets...');
        const pollAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        operation = await pollAi.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) setVideoUrl(`${downloadLink}&key=${process.env.API_KEY}`);
    } catch (error: any) {
      console.error("Video Error:", error);
      if (isAuthOrQuotaError(error)) {
        setVideoStatus("Auth Error. Paid API Key Required.");
        window.aistudio?.openSelectKey();
      } else {
        setVideoStatus("Generation failed.");
      }
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <Header onSwitchKey={() => window.aistudio?.openSelectKey().then(() => window.location.reload())} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="text-center mb-16">
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">
            Java <span className="text-orange-600">Production</span> Hub
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Design, script, and generate cinematic Java content with AI-assisted production tools.
          </p>
        </section>

        <div className="glass-panel rounded-[3rem] p-8 shadow-2xl mb-12">
          <textarea
            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-6 text-slate-200 focus:ring-2 focus:ring-orange-600 focus:outline-none min-h-[140px] mb-6 transition-all placeholder:text-slate-700 font-mono text-sm"
            placeholder="What Java topic are we covering today? (e.g., Spring Boot 3, JVM internals, Streams API...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="flex-1">{errorMsg}</p>
              <button onClick={generateBlueprint} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors">
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-800 rounded-full border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Cpu className="w-3 h-3" /> J21 Verified
              </span>
              <span className="px-3 py-1 bg-slate-800 rounded-full border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-500" /> Flash v3
              </span>
            </div>
            <button
              onClick={generateBlueprint}
              disabled={loading || !input.trim()}
              className="w-full sm:w-auto bg-white text-slate-950 hover:bg-orange-500 hover:text-white disabled:bg-slate-800 font-black py-4 px-12 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Production Blueprint
            </button>
          </div>
        </div>

        {blueprint && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-panel rounded-[3.5rem] overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-white/5 bg-slate-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-orange-600/10 rounded-2xl">
                      <MonitorPlay className="text-orange-600 w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white leading-tight uppercase italic">{blueprint.title}</h2>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Script & Content Ready</p>
                    </div>
                  </div>
                  <button
                    onClick={generateVideo}
                    disabled={videoLoading}
                    className="flex items-center gap-3 px-8 py-3 bg-slate-800 hover:bg-orange-600 border border-white/10 rounded-2xl text-[10px] font-black text-white transition-all uppercase tracking-widest"
                  >
                    {videoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                    {videoUrl ? 'Regenerate Intro' : 'Generate Cinematic Intro'}
                  </button>
                </div>
                
                <div className="p-10 space-y-12">
                  {(videoLoading || videoUrl) && (
                    <div className="bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-inner">
                      {videoLoading ? (
                        <div className="aspect-video flex flex-col items-center justify-center p-12 text-center space-y-6">
                          <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
                          <div className="space-y-2">
                            <p className="font-black text-2xl text-white uppercase italic tracking-tighter">Production in Progress</p>
                            <p className="text-xs text-slate-500 font-mono tracking-widest animate-pulse uppercase">{videoStatus}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <video src={videoUrl!} controls autoPlay muted className="w-full aspect-video rounded-lg shadow-2xl" />
                          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={videoUrl!} download={`${blueprint.title}.mp4`} className="flex items-center gap-2 px-6 py-3 bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl text-[10px] font-black text-white hover:bg-orange-600 transition-all uppercase tracking-widest shadow-2xl">
                              <Download className="w-4 h-4" /> Download MP4
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-8">
                    <div className="p-8 bg-slate-900/20 rounded-3xl border border-white/5">
                      <h3 className="text-xs font-black text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                        <Layers className="w-4 h-4 text-orange-500" /> Narrative Deep Dive
                      </h3>
                      <p className="text-slate-300 leading-relaxed text-sm font-medium italic mb-6">"{blueprint.narrative}"</p>
                      <CodeBlock code={blueprint.codeSnippet} />
                    </div>

                    <div>
                      <h3 className="text-xs font-black text-slate-500 mb-8 flex items-center gap-2 uppercase tracking-widest">
                        <Terminal className="w-4 h-4 text-orange-500" /> Full Video Script
                      </h3>
                      <div className="space-y-6">
                        {blueprint.script.map((seg: any, i: number) => (
                          <div key={i} className="flex gap-6 p-6 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all group">
                            <div className="text-orange-500 font-mono text-[10px] font-bold pt-1 bg-orange-500/10 px-3 py-1 rounded-full h-fit border border-orange-500/20">{seg.timestamp}</div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-100 mb-4 leading-relaxed">"{seg.talk}"</p>
                              <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <ImageIcon className="w-4 h-4 text-slate-600" />
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{seg.visual}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-panel rounded-[3.5rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-slate-800/20 flex items-center justify-between">
                  <h2 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-widest">
                    <ImageIcon className="w-5 h-5 text-orange-500" /> Thumbnail Art
                  </h2>
                  <button onClick={generateThumbnail} disabled={thumbnailLoading} className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400">
                    {thumbnailLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                  </button>
                </div>
                <div className="p-6">
                  {thumbnail ? (
                    <img src={thumbnail} className="w-full rounded-2xl border border-white/10 aspect-video object-cover shadow-2xl" alt="Thumbnail" />
                  ) : (
                    <div className="aspect-video bg-slate-950 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-800">
                      <ImageIcon className="w-12 h-12 opacity-10 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Generation</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-panel rounded-[3.5rem] overflow-hidden shadow-2xl p-8">
                <h2 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                  <Music className="text-orange-500 w-5 h-5" /> Audio Layout
                </h2>
                <div className="space-y-6">
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <span className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-2 block">Background</span>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{blueprint.atmosphere.music}</p>
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <span className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-2 block">VFX Layering</span>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{blueprint.atmosphere.vfx}</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-[3.5rem] overflow-hidden shadow-2xl p-8">
                <h2 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                  <Youtube className="text-orange-500 w-5 h-5" /> SEO Engine
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {blueprint.seo.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5">#{tag}</span>
                    ))}
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <span className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-2 block">Description</span>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{blueprint.seo.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!blueprint && !loading && (
          <div className="mt-20 flex flex-col items-center justify-center opacity-10 grayscale py-20 select-none">
            <Code2 className="w-32 h-32 mb-8 text-orange-500" />
            <p className="text-4xl font-black uppercase italic tracking-tighter text-slate-400">Production Standby</p>
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-white/5 text-center bg-slate-950">
        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Java Studio v3 Production Hub</p>
      </footer>
    </div>
  );
}

function App() {
  const [showApp, setShowApp] = useState(false);
  if (!showApp) return <ApiKeyGuard onProceed={() => setShowApp(true)} />;
  return <AppContent />;
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}