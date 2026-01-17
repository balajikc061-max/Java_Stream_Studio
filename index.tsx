
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Youtube, 
  Code2, 
  Cpu, 
  Layers, 
  Image as ImageIcon, 
  PlayCircle, 
  Terminal, 
  Sparkles,
  Loader2,
  Video,
  Download,
  Music,
  Volume2,
  Mic2,
  AlertCircle,
  FileVideo
} from 'lucide-react';

// --- Type Definitions for AI Studio Window Helpers ---
declare global {
  // Fix: Defining AIStudio interface to match environmental expectations and avoid declaration merging conflicts.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // Fix: Using the named AIStudio type to ensure compatibility with existing global definitions.
    aistudio: AIStudio;
  }
}

// --- Components ---

const Header = () => (
  <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-orange-500 p-1.5 rounded-lg">
          <Youtube className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Java<span className="text-orange-500">Stream</span> Studio</span>
      </div>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <a href="#" className="hover:text-white transition-colors">Dashboard</a>
        <a href="#" className="hover:text-white transition-colors">Resources</a>
        <a href="#" className="hover:text-white transition-colors">Channel Growth</a>
      </nav>
    </div>
  </header>
);

const CodeBlock = ({ code, language = 'java' }: { code: string, language?: string }) => (
  <div className="relative group rounded-xl overflow-hidden bg-slate-900 border border-white/10 my-4">
    <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-white/5">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
      </div>
      <span className="text-xs text-slate-400 font-mono uppercase">{language}</span>
    </div>
    <pre className="p-4 overflow-x-auto">
      <code className="text-sm text-slate-300 font-mono leading-relaxed">
        {code}
      </code>
    </pre>
  </div>
);

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  
  // Video Generation States
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string>('');

  const generateBlueprint = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setVideoUrl(null);
    try {
      // Fix: Always create new GoogleGenAI instance before API calls
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Act as a world-class Java technical content creator. 
        Transform the following Java content into an advanced, high-production-value YouTube video blueprint.
        
        Content: "${input}"

        Focus on:
        1. JVM internals and low-level mechanics.
        2. Modern Java features (Records, Sealed Types, Scoped Values, Virtual Threads).
        3. Design patterns and clean code architecture.

        Return a JSON object with:
        - title: Catchy YouTube title.
        - hook: A compelling 15-second intro hook.
        - deepDive: An advanced technical explanation of the core concept.
        - script: An array of objects [{timestamp: string, talk: string, visual: string}].
        - visualizationIdea: Description of a complex animation or diagram to show.
        - javaCode: A robust, advanced code snippet demonstrating the concept.
        - audioAtmosphere: {
            intro: string,
            background: string,
            sfx: string,
            outro: string
          }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              hook: { type: Type.STRING },
              deepDive: { type: Type.STRING },
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
              visualizationIdea: { type: Type.STRING },
              javaCode: { type: Type.STRING },
              audioAtmosphere: {
                type: Type.OBJECT,
                properties: {
                  intro: { type: Type.STRING },
                  background: { type: Type.STRING },
                  sfx: { type: Type.STRING },
                  outro: { type: Type.STRING }
                },
                required: ["intro", "background", "sfx", "outro"]
              }
            },
            required: ["title", "hook", "deepDive", "script", "visualizationIdea", "javaCode", "audioAtmosphere"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setBlueprint(data);
    } catch (error) {
      console.error("Blueprint generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnail = async () => {
    if (!blueprint?.title) return;

    // Fix: Upgrade to gemini-3-pro-image-preview for high-quality 4K support and ensure API key selection
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }

    setThumbnailLoading(true);
    try {
      // Fix: Create fresh instance right before call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: `A professional high-quality YouTube thumbnail for a Java programming video titled "${blueprint.title}". Visual style: Modern, high-contrast, dark mode, with glowing Java logo, abstract digital network, 4k resolution, cinematic lighting, coding aesthetic.` }]
        },
        config: {
          imageConfig: { 
            aspectRatio: "16:9",
            imageSize: "4K" // Explicitly enabled for gemini-3-pro-image-preview
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setThumbnail(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    } catch (error: any) {
      console.error("Thumbnail generation failed:", error);
      // Fix: Handle API key selection reset for pro models
      if (error?.message?.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setThumbnailLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!blueprint?.hook) return;
    
    // Check for API key selection as per Veo requirements
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }

    setVideoLoading(true);
    setVideoStatus('Initializing Cinematic Render...');
    
    try {
      // Fix: Create fresh instance right before call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const videoPrompt = `A cinematic, high-quality technical video clip for a Java tutorial titled "${blueprint.title}". Visuals: A futuristic 3D computer workspace, glowing Java code floating in the air, abstract data streams, high-end professional lighting, 4k. Scene: ${blueprint.hook}`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setVideoStatus('Processing frames (this may take a few minutes)...');
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        setVideoStatus('Finalizing neural patterns and lighting...');
        // Fix: Use fresh GoogleGenAI instance for each poll to ensure most up-to-date API key is used
        const pollAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        operation = await pollAi.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setVideoUrl(`${downloadLink}&key=${process.env.API_KEY}`);
      }
    } catch (error: any) {
      console.error("Video generation failed:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        setVideoStatus("API Key Error. Please reset selection.");
        await window.aistudio.openSelectKey();
      } else {
        setVideoStatus("Generation failed. Please try again.");
      }
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-orange-500/30">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Craft Your Next <span className="text-orange-500">Java Masterpiece</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Paste your raw code or concepts. We'll handle the advanced engineering and production planning.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
            <textarea
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none min-h-[160px] mb-4 transition-all"
              placeholder="Enter your Java topic (e.g., 'Concurrency with Virtual Threads' or 'Generic Type Erasure')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-2 text-xs text-slate-500 font-medium">
                <span className="px-2 py-1 bg-slate-800 rounded">Advanced JVM</span>
                <span className="px-2 py-1 bg-slate-800 rounded">Clean Architecture</span>
                <span className="px-2 py-1 bg-slate-800 rounded">Performance</span>
              </div>
              <button
                onClick={generateBlueprint}
                disabled={loading || !input.trim()}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/20 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate Blueprint
              </button>
            </div>
          </div>
        </section>

        {blueprint && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-8">
              {/* Main Content Area */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/5 bg-slate-800/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="text-orange-500 w-6 h-6" />
                    <h2 className="text-xl font-bold text-white">Video Blueprint: {blueprint.title}</h2>
                  </div>
                  <button
                    onClick={generateVideo}
                    disabled={videoLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 rounded-lg text-sm font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    {videoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                    Generate Hook Video
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Generated Video Section */}
                  {videoLoading || videoUrl ? (
                    <div className="bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                      {videoLoading ? (
                        <div className="aspect-video flex flex-col items-center justify-center p-12 text-center space-y-4">
                          <div className="relative">
                            <Video className="w-16 h-16 text-orange-500/20 animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-lg text-white">AI Cinematographer at work</p>
                            <p className="text-sm text-slate-400 max-w-sm">{videoStatus}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <video 
                            src={videoUrl!} 
                            controls 
                            className="w-full aspect-video rounded-lg shadow-2xl"
                            poster={thumbnail || undefined}
                          />
                          <a 
                            href={videoUrl!} 
                            download={`${blueprint.title}.mp4`}
                            className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-600"
                          >
                            <Download className="w-4 h-4" /> Download MP4
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                      <h3 className="text-xs uppercase font-bold text-orange-400 mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> The Hook
                      </h3>
                      <p className="text-slate-200 italic leading-relaxed">"{blueprint.hook}"</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-400" /> Advanced Deep Dive
                    </h3>
                    <p className="text-slate-400 leading-relaxed mb-4">{blueprint.deepDive}</p>
                    <CodeBlock code={blueprint.javaCode} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Video className="w-5 h-5 text-purple-400" /> Production Script
                    </h3>
                    <div className="space-y-4">
                      {blueprint.script.map((segment: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 bg-slate-800/30 rounded-xl border border-white/5">
                          <div className="text-orange-500 font-mono text-sm pt-0.5">{segment.timestamp}</div>
                          <div>
                            <p className="text-sm font-medium text-slate-300 mb-2 italic">"{segment.talk}"</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <ImageIcon className="w-3 h-3" />
                              <span>Visual: {segment.visual}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Thumbnail Design */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/5 bg-slate-800/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="text-emerald-500 w-6 h-6" />
                    <h2 className="text-lg font-bold text-white">Thumbnail Design</h2>
                  </div>
                  <button 
                    onClick={generateThumbnail}
                    disabled={thumbnailLoading}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    {thumbnailLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  </button>
                </div>
                <div className="p-6">
                  {thumbnail ? (
                    <div className="space-y-4">
                      <img src={thumbnail} className="w-full aspect-video object-cover rounded-lg border border-white/10" alt="Thumbnail Preview" />
                      <a href={thumbnail} download="thumbnail.png" className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" /> Download Image
                      </a>
                    </div>
                  ) : (
                    <div className="aspect-video bg-slate-950 border-2 border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center text-slate-600 gap-2">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                      <p className="text-xs">No thumbnail generated yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* API Key Alert for Video */}
              {!videoUrl && (
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-400 mb-1 uppercase">Video Feature</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Generating video hooks requires a paid API key from a Google Cloud Project with billing enabled. 
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="ml-1 text-blue-400 underline">Learn more</a>
                    </p>
                  </div>
                </div>
              )}

              {/* Audio Atmosphere */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/5 bg-slate-800/20 flex items-center gap-3">
                  <Music className="text-orange-500 w-6 h-6" />
                  <h2 className="text-lg font-bold text-white">Audio Atmosphere</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="mt-1"><PlayCircle className="w-4 h-4 text-orange-400" /></div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Intro Theme</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{blueprint.audioAtmosphere.intro}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1"><Volume2 className="w-4 h-4 text-blue-400" /></div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Background Vibe</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{blueprint.audioAtmosphere.background}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1"><Sparkles className="w-4 h-4 text-purple-400" /></div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Key SFX</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{blueprint.audioAtmosphere.sfx}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1"><Mic2 className="w-4 h-4 text-emerald-400" /></div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Outro Style</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{blueprint.audioAtmosphere.outro}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualization Idea */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/5 bg-slate-800/20 flex items-center gap-3">
                  <Cpu className="text-pink-500 w-6 h-6" />
                  <h2 className="text-lg font-bold text-white">Visualization Idea</h2>
                </div>
                <div className="p-6">
                  <div className="bg-slate-950 rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-slate-400 leading-relaxed italic">
                      {blueprint.visualizationIdea}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!blueprint && !loading && (
          <div className="mt-20 flex flex-col items-center justify-center opacity-20 select-none grayscale">
            <Code2 className="w-24 h-24 mb-4" />
            <p className="text-xl font-medium italic">Ready to transform your ideas...</p>
          </div>
        )}
      </main>

      <footer className="mt-20 py-12 border-t border-white/5 text-center">
        <p className="text-slate-500 text-sm">
          Built for creators who demand high-performance Java content. Powered by Gemini & Veo.
        </p>
      </footer>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
