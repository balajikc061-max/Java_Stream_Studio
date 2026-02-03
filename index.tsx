
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
  Terminal,
  Copy,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  Tv,
  Settings
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

// --- SDK Helpers ---
const isAuthOrQuotaError = (error: any) => {
  const errStr = JSON.stringify(error).toLowerCase();
  const msg = error?.message?.toLowerCase() || "";
  return errStr.includes("resource_exhausted") || 
         errStr.includes("429") || 
         errStr.includes("permission_denied") || 
         errStr.includes("403") ||
         msg.includes("quota") ||
         msg.includes("limit") ||
         msg.includes("requested entity was not found");
};

// --- UI Components ---

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

  // Use useEffect to handle state updates in the parent component
  useEffect(() => {
    if (hasKey) {
      onProceed();
    }
  }, [hasKey, onProceed]);

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

  if (hasKey) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-md w-full glass-panel rounded-[2.5rem] p-10 shadow-2xl text-center relative z-10 border border-white/10">
        <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-orange-500/20">
          <ShieldCheck className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter italic uppercase italic leading-none">Studio Setup</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Your <strong>Pro API Key</strong> is required to generate cinematic Java videos and high-quality thumbnails.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={handleSelectKey}
            className="w-full bg-orange-600 text-white hover:bg-orange-500 font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg uppercase tracking-widest text-xs"
          >
            <Key className="w-5 h-5" />
            Connect My Pro Key
          </button>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-orange-400 transition-colors uppercase tracking-[0.2em]"
          >
            Manage Pro Project <ExternalLink className="w-3 h-3" />
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
        <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-600/20">
          <Youtube className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter text-white italic leading-none uppercase">Java<span className="text-orange-600">Studio</span></span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Production Hub</span>
        </div>
      </div>
      <button 
        onClick={onSwitchKey}
        className="flex items-center gap-2 px-5 py-2 rounded-full glass-panel hover:bg-orange-600 hover:text-white text-[10px] font-black text-slate-400 transition-all uppercase tracking-widest border border-white/10"
      >
        <Settings className="w-3.5 h-3.5" />
        Studio Config
      </button>
    </div>
  </header>
);

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-3xl overflow-hidden bg-slate-950 border border-white/10 my-6 shadow-2xl">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/50 border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
        </div>
        <button onClick={copyToClipboard} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          {copied ? 'Copied!' : 'Copy Code'}
          <Copy className="w-3 h-3" />
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
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as an expert Java YouTuber like 'Amigoscode' or 'Java Brains'. Create a comprehensive high-production video blueprint.
      Topic: "${input}"
      Focus: Professional Java engineering, modern idioms (Java 21+), and high-retention script writing.
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
      console.error("Blueprint Error:", error);
      if (isAuthOrQuotaError(error)) {
        setErrorMsg("Quota Error (429) or Access Denied. Ensure your Vercel API_KEY is correct or re-link via Studio Config.");
        if (JSON.stringify(error).includes("requested entity was not found")) {
            window.aistudio?.openSelectKey();
        }
      } else {
        setErrorMsg("The production engine encountered an error. Please try a different Java topic.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnail = async () => {
    if (!blueprint?.title) return;
    setThumbnailLoading(true);
    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: `A viral high-energy YouTube thumbnail for a Java video: "${blueprint.title}". Visuals: Glowing Java logo, floating syntax, developer hands at a high-end keyboard, 3D neon gradients, professional depth of field, 4K.` }] },
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
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
    setVideoStatus('Initializing Cinematic Engine...');
    setVideoUrl(null);
    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const videoPrompt = `Cinematic 4K intro for a Java tutorial. Title: "${blueprint.title}". High-end tech vibe, camera pans over clean Java code on a vertical monitor in a futuristic studio. Action: ${blueprint.hook}`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        setVideoStatus('Synthesizing frames...');
        // Create a new GoogleGenAI instance for polling to ensure fresh API key context
        const pollAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        operation = await pollAi.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) setVideoUrl(`${downloadLink}&key=${process.env.API_KEY}`);
    } catch (error: any) {
      console.error("Video Error:", error);
      if (isAuthOrQuotaError(error)) window.aistudio?.openSelectKey();
      setVideoStatus("Render Failed.");
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <Header onSwitchKey={() => window.aistudio?.openSelectKey().then(() => window.location.reload())} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 pointer-events-none">
            <Cpu className="w-96 h-96 mx-auto animate-pulse" />
          </div>
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase italic relative z-10 leading-none">
            Java <span className="text-orange-600">Pro</span> Studio
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto relative z-10 font-medium">
            Generate viral scripts, code assets, and cinematic intros for your Java channel.
          </p>
        </section>

        <div className="glass-panel rounded-[3rem] p-10 shadow-2xl mb-12 border border-white/5">
          <textarea
            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-8 text-slate-200 focus:ring-2 focus:ring-orange-600 focus:outline-none min-h-[160px] mb-8 transition-all placeholder:text-slate-700 font-mono text-base shadow-inner"
            placeholder="Topic: (e.g., 'Modern Java 21 Records vs Classes', 'Spring Boot 3 WebFlux Architecture'...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          {errorMsg && (
            <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                 <p className="font-black uppercase tracking-widest text-[10px] mb-1">Alert</p>
                 <p className="font-bold">{errorMsg}</p>
              </div>
              <button onClick={generateBlueprint} className="p-2 hover:bg-red-500/20 rounded-full transition-colors">
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl border border-white/5">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ultra Performance</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl border border-white/5">
                <Tv className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YouTube Optimized</span>
              </div>
            </div>
            
            <button
              onClick={generateBlueprint}
              disabled={loading || !input.trim()}
              className="w-full sm:w-auto bg-white text-slate-950 hover:bg-orange-600 hover:text-white disabled:bg-slate-800 font-black py-5 px-16 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 uppercase tracking-widest text-sm shadow-xl"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              Generate Production Deck
            </button>
          </div>
        </div>

        {blueprint && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="lg:col-span-2 space-y-10">
              <div className="glass-panel rounded-[4rem] overflow-hidden shadow-2xl border border-white/5">
                <div className="p-12 border-b border-white/5 bg-slate-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-orange-600/20 rounded-[2rem] border border-orange-500/30">
                      <MonitorPlay className="text-orange-500 w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white leading-tight uppercase italic tracking-tighter">{blueprint.title}</h2>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> Content Engine Ready
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={generateVideo}
                    disabled={videoLoading}
                    className="flex items-center gap-3 px-10 py-4 bg-slate-900 hover:bg-orange-600 border border-white/10 rounded-[2rem] text-[11px] font-black text-white transition-all uppercase tracking-widest shadow-lg"
                  >
                    {videoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                    {videoUrl ? 'Regenerate Video' : 'Generate Intro'}
                  </button>
                </div>
                
                <div className="p-12 space-y-16">
                  {(videoLoading || videoUrl) && (
                    <div className="bg-slate-950 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                      {videoLoading ? (
                        <div className="aspect-video flex flex-col items-center justify-center p-16 text-center space-y-8 bg-gradient-to-br from-slate-950 to-slate-900">
                          <Loader2 className="w-16 h-16 text-orange-600 animate-spin" />
                          <div className="space-y-3">
                            <p className="font-black text-3xl text-white uppercase italic tracking-tighter">Rendering Engine Active</p>
                            <p className="text-[10px] text-slate-500 font-mono tracking-[0.3em] uppercase">{videoStatus}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <video src={videoUrl!} controls autoPlay muted className="w-full aspect-video" />
                          <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={videoUrl!} download={`${blueprint.title}.mp4`} className="flex items-center gap-3 px-8 py-4 bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] text-[11px] font-black text-white hover:bg-orange-600 transition-all uppercase tracking-widest shadow-2xl">
                              <Download className="w-5 h-5" /> Download MP4
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-12">
                    <div className="p-10 bg-slate-900/30 rounded-[3rem] border border-white/5 relative">
                      <div className="absolute -top-4 -left-4 p-4 bg-orange-600 rounded-2xl shadow-xl shadow-orange-600/20">
                        <Layers className="text-white w-6 h-6" />
                      </div>
                      <h3 className="text-[11px] font-black text-slate-500 mb-6 uppercase tracking-[0.3em] ml-8">Core Narrative</h3>
                      <p className="text-slate-200 leading-relaxed text-lg font-medium italic mb-10">"{blueprint.narrative}"</p>
                      <CodeBlock code={blueprint.codeSnippet} />
                    </div>

                    <div>
                      <h3 className="text-[11px] font-black text-slate-500 mb-10 flex items-center gap-3 uppercase tracking-[0.3em]">
                        <Terminal className="w-5 h-5 text-orange-500" /> Production Script
                      </h3>
                      <div className="space-y-8">
                        {blueprint.script.map((seg: any, i: number) => (
                          <div key={i} className="flex gap-8 p-8 bg-slate-950/30 rounded-[2.5rem] border border-white/5 hover:border-orange-500/20 transition-all group shadow-sm">
                            <div className="text-orange-500 font-mono text-[11px] font-bold pt-1.5 bg-orange-500/10 px-4 py-1.5 rounded-full h-fit border border-orange-500/10">{seg.timestamp}</div>
                            <div className="flex-1">
                              <p className="text-base font-bold text-slate-100 mb-6 leading-relaxed">"{seg.talk}"</p>
                              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                <ImageIcon className="w-5 h-5 text-slate-500" />
                                <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest">{seg.visual}</span>
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

            <div className="space-y-10">
              <div className="glass-panel rounded-[4rem] overflow-hidden shadow-2xl border border-white/5">
                <div className="p-8 border-b border-white/5 bg-slate-800/20 flex items-center justify-between">
                  <h2 className="text-[11px] font-black text-white flex items-center gap-4 uppercase tracking-[0.3em]">
                    <ImageIcon className="w-6 h-6 text-orange-500" /> Pro Thumbnail
                  </h2>
                  <button onClick={generateThumbnail} disabled={thumbnailLoading} className="p-3 hover:bg-slate-800 rounded-2xl transition-all text-slate-400">
                    {thumbnailLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCcw className="w-6 h-6" />}
                  </button>
                </div>
                <div className="p-8">
                  {thumbnail ? (
                    <img src={thumbnail} className="w-full rounded-[2.5rem] border border-white/10 aspect-video object-cover shadow-2xl" alt="Thumbnail" />
                  ) : (
                    <div className="aspect-video bg-slate-950/50 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-800 group hover:border-orange-500/30 transition-all">
                      <ImageIcon className="w-16 h-16 opacity-5 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-[11px] font-black uppercase tracking-widest opacity-20">Awaiting Pro Key</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-panel rounded-[4rem] overflow-hidden shadow-2xl p-10 border border-white/5">
                <h2 className="text-[11px] font-black text-white mb-10 flex items-center gap-4 uppercase tracking-[0.3em]">
                  <Music className="text-orange-500 w-6 h-6" /> Soundscape
                </h2>
                <div className="space-y-8">
                  <div className="p-6 bg-slate-950/50 rounded-[2rem] border border-white/5 shadow-inner">
                    <span className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em] mb-3 block">Background</span>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{blueprint.atmosphere.music}</p>
                  </div>
                  <div className="p-6 bg-slate-950/50 rounded-[2rem] border border-white/5 shadow-inner">
                    <span className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em] mb-3 block">Digital Effects</span>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{blueprint.atmosphere.vfx}</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-[4rem] overflow-hidden shadow-2xl p-10 border border-white/5">
                <h2 className="text-[11px] font-black text-white mb-10 flex items-center gap-4 uppercase tracking-[0.3em]">
                  <Youtube className="text-orange-500 w-6 h-6" /> SEO Optimizer
                </h2>
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2.5">
                    {blueprint.seo.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-4 py-1.5 bg-slate-800/80 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5">#{tag}</span>
                    ))}
                  </div>
                  <div className="p-6 bg-slate-950/50 rounded-[2rem] border border-white/5">
                    <span className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em] mb-3 block">YouTube Description</span>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{blueprint.seo.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!blueprint && !loading && (
          <div className="mt-32 flex flex-col items-center justify-center opacity-5 grayscale py-20 select-none">
            <Code2 className="w-48 h-48 mb-10 text-orange-500" />
            <p className="text-5xl font-black uppercase italic tracking-tighter text-slate-400">Production Standby</p>
          </div>
        )}
      </main>

      <footer className="py-24 border-t border-white/5 text-center bg-[#020617] relative overflow-hidden">
        <p className="text-slate-800 text-[11px] font-black uppercase tracking-[0.8em] mb-4 italic">Java Production Studio v4.0</p>
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
