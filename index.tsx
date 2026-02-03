import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type, Modality } from "@google/genai";
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
  Tv,
  Settings,
  Volume2,
  PlayCircle,
  FolderDown,
  Clock,
  Maximize2,
  Pause,
  Play,
  Activity
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

// --- Audio Utilities ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const bufferToWavBlob = (buffer: AudioBuffer) => {
  const length = buffer.length * 2;
  const view = new DataView(new ArrayBuffer(44 + length));
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true);
  view.setUint32(28, 48000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);
  const data = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }
  return new Blob([view], { type: 'audio/wav' });
};

// --- SDK Helpers ---
const isAuthOrQuotaError = (error: any) => {
  const errStr = JSON.stringify(error).toLowerCase();
  return errStr.includes("resource_exhausted") || 
         errStr.includes("429") || 
         errStr.includes("403") ||
         errStr.includes("requested entity was not found");
};

// --- Cinematic Player Component ---
const CinematicTheater = ({ blueprint, audioUrl, clips }: { blueprint: any, audioUrl: string, clips: any[] }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const duration = audioRef.current?.duration || 60;
  const segmentDuration = duration / blueprint.segments.length;
  const currentSegmentIndex = Math.min(Math.floor(currentTime / segmentDuration), blueprint.segments.length - 1);
  const currentClip = clips[currentSegmentIndex % clips.length];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', update);
    return () => audio.removeEventListener('timeupdate', update);
  }, []);

  const toggle = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="glass-panel rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl bg-black/40 mb-12 group">
      <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
        {currentClip ? (
          <video 
            key={currentClip.url}
            src={currentClip.url} 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-700">
            <Video className="w-16 h-16 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Generating Cinematic b-roll...</span>
          </div>
        )}
        
        <div className="absolute bottom-10 left-10 right-10 p-8 bg-slate-950/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl transition-all translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Transcript - Segment {currentSegmentIndex + 1}</span>
          </div>
          <p className="text-sm font-bold text-white leading-relaxed italic">"{blueprint.segments[currentSegmentIndex].talk}"</p>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={toggle} className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
            {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
          </button>
        </div>
      </div>

      <div className="p-8 bg-slate-900/50 flex items-center gap-8 border-t border-white/5">
        <div className="flex-1">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-600 transition-all duration-300 shadow-[0_0_12px_rgba(234,88,12,0.5)]" 
              style={{ width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%` }} 
            />
          </div>
        </div>
        <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
        <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">
          {Math.floor(currentTime)}s <span className="text-slate-700">/</span> {Math.floor(audioRef.current?.duration || 0)}s
        </span>
      </div>
    </div>
  );
};

// --- Header Component ---
const Header = ({ onConfig }: { onConfig: () => void }) => (
  <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-600/20">
          <Youtube className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter text-white italic leading-none uppercase">Java<span className="text-orange-600">Pro</span></span>
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1">AI Automation Suite</span>
        </div>
      </div>
      <button 
        onClick={onConfig}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-panel hover:bg-white hover:text-slate-950 text-[10px] font-black text-slate-400 transition-all uppercase tracking-widest border border-white/10"
      >
        <Settings className="w-3.5 h-3.5" />
        Studio Config
      </button>
    </div>
  </header>
);

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-3xl overflow-hidden bg-slate-950 border border-white/10 my-6 shadow-2xl">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/50">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/20" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
          <div className="w-2 h-2 rounded-full bg-green-500/20" />
        </div>
        <button onClick={copy} className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-8 overflow-x-auto bg-[#0d1117] font-mono text-sm leading-relaxed text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
};

function AppContent() {
  const [input, setInput] = useState('');
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [productionPipeline, setProductionPipeline] = useState({
    blueprint: 'idle',
    thumbnail: 'idle',
    voiceover: 'idle',
    visuals: 'idle'
  });

  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [fullAudioUrl, setFullAudioUrl] = useState<string | null>(null);
  const [videoClips, setVideoClips] = useState<{url: string, title: string}[]>([]);

  const startFullProduction = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setBlueprint(null);
    setThumbnail(null);
    setFullAudioUrl(null);
    setVideoClips([]);
    setProductionPipeline({ blueprint: 'loading', thumbnail: 'idle', voiceover: 'idle', visuals: 'idle' });

    try {
      // Create new AI instance using the built-in system key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const blueprintResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a senior Java YouTuber. Create a production blueprint for: "${input}". 
        Include full narration, code, and SEO. Return JSON format.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              hook: { type: Type.STRING },
              narrative: { type: Type.STRING },
              fullScript: { type: Type.STRING },
              segments: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    visual: { type: Type.STRING }, 
                    talk: { type: Type.STRING } 
                  } 
                } 
              },
              code: { type: Type.STRING },
              seo: {
                type: Type.OBJECT,
                properties: {
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING }
                }
              }
            },
            required: ["title", "hook", "fullScript", "segments", "code", "seo"]
          }
        }
      });

      const data = JSON.parse(blueprintResponse.text || '{}');
      setBlueprint(data);
      setProductionPipeline(p => ({ ...p, blueprint: 'done', thumbnail: 'loading', voiceover: 'loading', visuals: 'loading' }));
      generateAssets(data);

    } catch (e: any) {
      handleError(e);
      setProductionPipeline(p => ({ ...p, blueprint: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleError = (e: any) => {
    console.error(e);
    if (isAuthOrQuotaError(e)) {
      setErrorMsg("The AI engine is currently busy or out of free energy. You can wait a few minutes, or click 'Studio Config' above to connect your own project for unlimited power.");
    } else {
      setErrorMsg("The production system hit an error. Please try a simpler topic.");
    }
  };

  const generateAssets = async (data: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Thumbnail Generation
    try {
      const thumbResp = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: `YouTube thumbnail for: "${data.title}". Professional Java tech vibe, neon accents, high resolution.` }] },
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
      });
      const thumbPart = thumbResp.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (thumbPart) setThumbnail(`data:image/png;base64,${thumbPart.inlineData.data}`);
      setProductionPipeline(p => ({ ...p, thumbnail: 'done' }));
    } catch (e) { setProductionPipeline(p => ({ ...p, thumbnail: 'error' })); }

    // Voiceover (TTS) Generation
    try {
      const ttsResp = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Clear tutorial voice: ${data.fullScript}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
        },
      });
      const audioData = ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const ctx = new AudioContext({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decodeBase64(audioData), ctx, 24000, 1);
        setFullAudioUrl(URL.createObjectURL(bufferToWavBlob(buffer)));
      }
      setProductionPipeline(p => ({ ...p, voiceover: 'done' }));
    } catch (e) { setProductionPipeline(p => ({ ...p, voiceover: 'error' })); }

    // Video Visual (Veo) Generation
    try {
      const clips = [];
      // Generate only 1 clip initially to save user quota, can be scaled easily
      for (let i = 0; i < 1; i++) {
        const seg = data.segments[i];
        let op = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: `Cinematic 4K tech visual: ${seg.visual}. Minimalist studio look.`,
          config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
        });
        while (!op.done) {
          await new Promise(r => setTimeout(r, 8000));
          const pollAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
          op = await pollAi.operations.getVideosOperation({ operation: op });
        }
        const uri = op.response?.generatedVideos?.[0]?.video?.uri;
        if (uri) clips.push({ url: `${uri}&key=${process.env.API_KEY}`, title: `Cinematic Clip` });
      }
      setVideoClips(clips);
      setProductionPipeline(p => ({ ...p, visuals: 'done' }));
    } catch (e) { 
      setProductionPipeline(p => ({ ...p, visuals: 'error' }));
      handleError(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-32 selection:bg-orange-600/30">
      <Header onConfig={() => window.aistudio?.openSelectKey()} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
            <Cpu className="w-96 h-96 mx-auto animate-pulse" />
          </div>
          <h1 className="text-7xl font-black text-white mb-4 tracking-tighter uppercase italic relative z-10 leading-none">
            Java <span className="text-orange-600">Pro</span> Studio
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto relative z-10 font-medium">
            Next-gen Java content production. Powered by Gemini Pro.
          </p>
        </section>

        <div className="glass-panel rounded-[3.5rem] p-10 shadow-2xl mb-12 border border-white/5 bg-slate-900/10 backdrop-blur-3xl">
          <textarea
            className="w-full bg-slate-950/40 border border-white/5 rounded-3xl p-8 text-slate-100 focus:ring-2 focus:ring-orange-600/50 focus:outline-none min-h-[140px] mb-8 font-mono text-base placeholder:text-slate-800 transition-all shadow-inner"
            placeholder="What Java topic are we producing today? (e.g. 'Advanced Spring Boot Microservices')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          {errorMsg && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-6 text-red-400 animate-in slide-in-from-top-4">
              <AlertCircle className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Production Pipeline Alert</p>
                <p className="font-bold leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
            <div className="flex gap-4">
              <div className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-900/60 rounded-2xl border border-white/5">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auto-Engine</span>
              </div>
              <div className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-900/60 rounded-2xl border border-white/5">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Free Mode</span>
              </div>
            </div>
            
            <button
              onClick={startFullProduction}
              disabled={loading || !input.trim()}
              className="w-full sm:w-auto bg-white text-slate-950 hover:bg-orange-600 hover:text-white disabled:bg-slate-900 disabled:text-slate-700 font-black py-5 px-16 rounded-[2rem] flex items-center justify-center gap-4 transition-all active:scale-95 uppercase tracking-widest text-sm shadow-2xl group"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:animate-pulse" />}
              Produce Now
            </button>
          </div>
        </div>

        {blueprint && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {(fullAudioUrl || videoClips.length > 0) && (
              <CinematicTheater blueprint={blueprint} audioUrl={fullAudioUrl || ''} clips={videoClips} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              <div className="lg:col-span-1 space-y-8">
                <div className="glass-panel rounded-[2.5rem] p-10 border border-white/5 bg-slate-950/40">
                  <h3 className="text-[10px] font-black text-slate-500 mb-8 uppercase tracking-[0.4em] flex items-center gap-3">
                    <Cpu className="w-5 h-5" /> Pipeline
                  </h3>
                  <div className="space-y-4">
                    {[
                      { id: 'blueprint', label: 'Logic', icon: Terminal },
                      { id: 'thumbnail', label: 'Pro Art', icon: ImageIcon },
                      { id: 'voiceover', label: 'Audio', icon: Volume2 },
                      { id: 'visuals', label: 'Cinema', icon: Video },
                    ].map(step => (
                      <div key={step.id} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex items-center gap-4">
                          <step.icon className={`w-4 h-4 ${productionPipeline[step.id as keyof typeof productionPipeline] === 'done' ? 'text-orange-500' : 'text-slate-800'}`} />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{step.label}</span>
                        </div>
                        {productionPipeline[step.id as keyof typeof productionPipeline] === 'loading' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                        ) : productionPipeline[step.id as keyof typeof productionPipeline] === 'done' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                        ) : productionPipeline[step.id as keyof typeof productionPipeline] === 'error' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-900" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {thumbnail && (
                  <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/5 shadow-3xl group">
                    <div className="p-4 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 italic">4K Thumbnail</span>
                      <a href={thumbnail} download="thumbnail.png" className="p-1 hover:text-orange-500"><Download className="w-3.5 h-3.5" /></a>
                    </div>
                    <img src={thumbnail} className="w-full aspect-video object-cover transition-all duration-700" alt="Thumbnail" />
                  </div>
                )}
              </div>

              <div className="lg:col-span-3 space-y-12">
                <div className="glass-panel rounded-[3.5rem] p-12 border border-white/5 bg-slate-950/20">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-16 pb-12 border-b border-white/5">
                    <div className="flex items-center gap-8">
                      <div className="p-5 bg-orange-600/10 rounded-3xl border border-orange-500/10">
                        <MonitorPlay className="w-10 h-10 text-orange-500" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{blueprint.title}</h2>
                        <div className="flex items-center gap-3 mt-4">
                          <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/10">Production Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-16">
                     <div className="p-10 bg-slate-900/20 rounded-[3rem] border border-white/5 shadow-2xl relative">
                        <div className="absolute -top-6 -left-6 p-5 bg-orange-600 rounded-3xl shadow-xl shadow-orange-600/30">
                          <Layers className="text-white w-7 h-7" />
                        </div>
                        <h3 className="text-[11px] font-black text-slate-700 mb-8 uppercase tracking-[0.4em] ml-12">Architecture & Hook</h3>
                        <p className="text-2xl font-bold text-slate-200 italic leading-snug mb-10">"{blueprint.hook}"</p>
                        <CodeBlock code={blueprint.code} />
                     </div>

                     <div className="space-y-8">
                        <h3 className="text-[11px] font-black text-slate-700 flex items-center gap-4 uppercase tracking-[0.4em]">
                          <Clock className="w-5 h-5" /> Detailed Timeline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {blueprint.segments.map((seg: any, i: number) => (
                            <div key={i} className="p-8 bg-slate-950/40 rounded-[2.5rem] border border-white/5 hover:border-orange-500/10 transition-all flex flex-col justify-between shadow-xl group">
                              <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">SEGMENT {i+1}</span>
                                  <Volume2 className="w-4 h-4 text-slate-800 group-hover:text-orange-500 transition-colors" />
                                </div>
                                <p className="text-base text-slate-400 font-medium leading-relaxed italic">"{seg.talk}"</p>
                              </div>
                              <div className="pt-6 border-t border-white/5 flex items-center gap-4">
                                 <ImageIcon className="w-4 h-4 text-slate-700" />
                                 <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest leading-none">{seg.visual}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!blueprint && !loading && (
          <div className="mt-32 flex flex-col items-center justify-center opacity-10 grayscale select-none">
            <Youtube className="w-48 h-48 mb-8 text-orange-500" />
            <p className="text-5xl font-black uppercase italic tracking-tighter text-slate-700">Hub Active</p>
          </div>
        )}
      </main>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<AppContent />);