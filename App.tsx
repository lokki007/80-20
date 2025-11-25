import React, { useState, useEffect } from 'react';
import { analyzeTopic, generateParetoIllustration } from './services/geminiService';
import { ParetoAnalysis, AppState, FractalLayer } from './types';
import { 
  ArrowRightIcon, 
  LoaderIcon, 
  TargetIcon, 
  ScissorIcon, 
  DiamondIcon, 
  DollarIcon, 
  CheckListIcon 
} from './components/Icons';
import { ImpactChart, FractalGrid, ResourceAllocationChart } from './components/Visualizations';

// Declare the aistudio interface on window
declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App = () => {
  const [input, setInput] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [analysis, setAnalysis] = useState<ParetoAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [apiKeyVerified, setApiKeyVerified] = useState(false);
  
  // Interactive State
  const [fractalLevel, setFractalLevel] = useState<number>(1); // 1 = 20%, 2 = 4%, 3 = 1%

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const has = await window.aistudio.hasSelectedApiKey();
        setApiKeyVerified(has);
      } else {
        // In local development or environments without the wrapper, we might default to true 
        // if we assume env vars are set, but for this strict context:
        setApiKeyVerified(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success after interaction
      setApiKeyVerified(true);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Double check key existence before call
    if (window.aistudio) {
        const has = await window.aistudio.hasSelectedApiKey();
        if (!has) {
            await window.aistudio.openSelectKey();
        }
    }

    setState(AppState.ANALYZING);
    setAnalysis(null);
    setImageUrl(null);
    setFractalLevel(1);

    try {
      const result = await analyzeTopic(input);
      setAnalysis(result);
      
      setState(AppState.GENERATING_IMAGE);
      const image = await generateParetoIllustration(input, result.focus.content);
      setImageUrl(image);
      
      setState(AppState.COMPLETE);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('403') || error.status === 403) {
          // If 403, prompt for key again
          setApiKeyVerified(false);
      }
      setState(AppState.ERROR);
    }
  };

  const getCurrentFractalLayer = (): FractalLayer | undefined => {
    if (!analysis) return undefined;
    return analysis.fractalAnalysis.find(f => f.level === fractalLevel) || analysis.fractalAnalysis[0];
  };

  const currentLayer = getCurrentFractalLayer();

  if (!apiKeyVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black font-sans p-6">
         <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in duration-700">
            <h1 className="text-6xl font-black tracking-tighter">80/20</h1>
            <p className="text-xl text-gray-600 font-serif">
               Access to advanced Gemini 3.0 models is required to perform high-fidelity Pareto analysis.
            </p>
            <div className="pt-4">
              <button 
                onClick={handleSelectKey}
                className="px-10 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-all"
              >
                Connect API Key
              </button>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-black">
                Billing Required
              </a> — Secure connection via Google AI Studio
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-black selection:bg-black selection:text-white font-sans">
      
      {/* 20% Sidebar - Control & Navigation */}
      <aside className="w-full md:w-[20%] border-b md:border-b-0 md:border-r border-black/10 p-6 flex flex-col justify-between sticky top-0 md:h-screen z-10 bg-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl font-black tracking-tighter">80/20</h1>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-12">Protocol v3.0</p>
          
          <nav className="hidden md:flex flex-col gap-6 text-sm font-medium">
             <div className={`flex items-center gap-3 transition-colors ${!analysis ? 'text-black' : 'text-gray-400'}`}>
                <span className="text-xs font-mono">01</span>
                <span>Input</span>
             </div>
             <div className={`flex items-center gap-3 transition-colors ${analysis ? 'text-black' : 'text-gray-400'}`}>
                <span className="text-xs font-mono">02</span>
                <span>Analysis</span>
             </div>
             {analysis && (
               <div className="pl-7 flex flex-col gap-3 border-l border-black/10 ml-2">
                  <button 
                    onClick={() => setFractalLevel(1)}
                    className={`text-left text-xs uppercase tracking-wide transition-all ${fractalLevel === 1 ? 'font-bold text-black translate-x-1' : 'text-gray-400'}`}
                  >
                    The Vital 20%
                  </button>
                  <button 
                    onClick={() => setFractalLevel(2)}
                    className={`text-left text-xs uppercase tracking-wide transition-all ${fractalLevel === 2 ? 'font-bold text-black translate-x-1' : 'text-gray-400'}`}
                  >
                    The Critical 4%
                  </button>
                  <button 
                    onClick={() => setFractalLevel(3)}
                    className={`text-left text-xs uppercase tracking-wide transition-all ${fractalLevel === 3 ? 'font-bold text-black translate-x-1' : 'text-gray-400'}`}
                  >
                    The Top 1%
                  </button>
               </div>
             )}
          </nav>
        </div>

        <div className="text-[10px] text-gray-400 font-mono hidden md:block">
          RECURSIVE ANALYSIS<br/>
          ENGINE ONLINE
        </div>
      </aside>

      {/* 80% Main Content */}
      <main className="w-full md:w-[80%] min-h-screen relative overflow-x-hidden">
        
        {/* Landing View */}
        {state === AppState.IDLE && (
          <div className="h-full flex flex-col items-center justify-center p-8 md:p-24 animate-in fade-in duration-500">
            <div className="max-w-2xl w-full space-y-12">
              <div className="space-y-4">
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter">
                  FIND THE<br/>SIGNAL.
                </h2>
                <p className="text-xl text-gray-500 max-w-lg">
                  Advanced recursive Pareto analysis to identify the 1% that generates 50% of your results.
                </p>
              </div>
              
              <form onSubmit={handleSearch} className="relative group w-full">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter a topic, business model, or challenge..."
                  className="w-full bg-transparent border-b-2 border-black py-4 text-2xl md:text-3xl font-serif outline-none placeholder:text-gray-300 placeholder:font-sans focus:placeholder-transparent transition-all"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity disabled:opacity-0"
                  disabled={!input.trim()}
                >
                  <ArrowRightIcon className="w-8 h-8 hover:scale-110 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Loading View */}
        {(state === AppState.ANALYZING || state === AppState.GENERATING_IMAGE) && (
          <div className="h-full flex flex-col items-center justify-center p-12">
            <div className="flex flex-col items-center gap-6">
              <LoaderIcon className="w-16 h-16 animate-spin text-black" />
              <div className="text-xs font-mono uppercase tracking-[0.2em] animate-pulse">
                {state === AppState.ANALYZING ? 'Calculating Leverage Points...' : 'Rendering Visualization...'}
              </div>
            </div>
          </div>
        )}

        {state === AppState.ERROR && (
           <div className="h-full flex flex-col items-center justify-center p-12">
             <div className="bg-red-50 p-8 border border-red-100 max-w-lg text-center">
               <p className="text-red-600 font-mono mb-4">Error: Analysis sequence failed.</p>
               <p className="text-sm text-gray-600 mb-6">Ensure your API key has the required permissions for Gemini 3.0 models.</p>
               <div className="flex gap-4 justify-center">
                 <button onClick={() => setState(AppState.IDLE)} className="text-sm font-bold uppercase underline hover:text-black">Return to Input</button>
                 <button onClick={handleSelectKey} className="text-sm font-bold uppercase underline hover:text-black">Switch API Key</button>
               </div>
             </div>
           </div>
        )}

        {/* Results View */}
        {state === AppState.COMPLETE && analysis && currentLayer && (
          <div className="p-6 md:p-12 lg:p-20 max-w-[1600px] mx-auto animate-in slide-in-from-bottom-8 duration-700">
            
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row gap-12 items-start justify-between mb-24">
               <div className="max-w-4xl">
                  <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
                    <span>Topic Analysis</span>
                    <span className="w-8 h-[1px] bg-gray-300"></span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-8 break-words">
                    {analysis.topic}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 font-serif leading-relaxed max-w-2xl">
                    {analysis.focus.content}
                  </p>
               </div>
               
               {/* AI Generated Visualization */}
               <div className="w-full xl:w-auto shrink-0 flex flex-col gap-2">
                 <div className="w-full xl:w-72 aspect-square bg-black p-1 border border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-crosshair">
                   {imageUrl && (
                     <img src={imageUrl} alt="AI Visualization" className="w-full h-full object-cover filter contrast-125 grayscale" />
                   )}
                 </div>
                 <div className="text-[10px] font-mono text-gray-400 uppercase text-right">Fig 1.0 - Generated Abstract</div>
               </div>
            </div>

            {/* Interactive Fractal Section */}
            <section className="mb-32">
              <div className="flex flex-col md:flex-row items-end justify-between border-b-4 border-black pb-4 mb-12">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Recursive Analysis</h2>
                
                {/* Level Toggles */}
                <div className="flex gap-2 mt-4 md:mt-0">
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFractalLevel(level)}
                      className={`
                        px-4 py-2 text-xs font-bold uppercase tracking-widest border border-black transition-all
                        ${fractalLevel === level ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}
                      `}
                    >
                      {level === 1 ? '20%' : level === 2 ? '4%' : '1%'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* The Graphic (Left) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                   <div className="w-full max-w-[300px] mx-auto lg:mx-0 shadow-xl border border-black">
                      <FractalGrid level={fractalLevel} />
                   </div>
                   <div className="text-sm text-gray-500 font-mono">
                      <p>Active Scope: <span className="text-black font-bold">Top {fractalLevel === 1 ? '20%' : fractalLevel === 2 ? '4%' : '1%'}</span></p>
                      <p>Result Driver: <span className="text-black font-bold">~{fractalLevel === 1 ? '80%' : fractalLevel === 2 ? '64%' : '50%'}</span></p>
                   </div>
                </div>

                {/* The Content (Right) */}
                <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500" key={fractalLevel}>
                   <div>
                      <div className="flex items-center gap-3 mb-4">
                         <DiamondIcon className="w-6 h-6" />
                         <h3 className="text-2xl font-bold uppercase">{currentLayer.title}</h3>
                      </div>
                      <p className="text-xl md:text-2xl leading-relaxed font-serif text-gray-800">
                        {currentLayer.description}
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-black/10">
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">Identified Entities</h4>
                        <ul className="space-y-3">
                          {currentLayer.keyEntities.map((entity, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 shrink-0"></span>
                              <span className="font-bold text-lg">{entity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-6 border-l-2 border-black">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Justification</h4>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed italic">
                          "{currentLayer.justification}"
                        </p>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Data Visualization Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-24">
              
              {/* Chart 1: Impact Breakdown */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                      <TargetIcon className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-bold uppercase tracking-wide">Impact Distribution</h3>
                </div>
                <ImpactChart data={analysis.chartData} />
                <p className="mt-6 text-sm text-gray-500 max-w-md">
                   These identified inputs represent the "Vital Few". Allocating resources outside of these categories yields diminishing returns.
                </p>
              </div>

              {/* Chart 2: Revenue Leverage */}
              <div>
                 <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 border-2 border-black text-black flex items-center justify-center">
                      <DollarIcon className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-bold uppercase tracking-wide">Leverage Economics</h3>
                </div>
                <ResourceAllocationChart streams={analysis.monetization.streams} />
                <div className="mt-8 p-6 bg-black text-white">
                   <h4 className="font-mono text-xs uppercase tracking-widest text-white/60 mb-2">Strategy Note</h4>
                   <p className="text-sm leading-relaxed">{analysis.monetization.content}</p>
                </div>
              </div>

              {/* The Cuts (Bottom 80%) */}
              <div className="lg:col-span-2">
                 <div className="border-t border-black pt-12 flex flex-col md:flex-row gap-12">
                    <div className="md:w-1/3">
                      <div className="flex items-center gap-3 mb-4">
                         <ScissorIcon className="w-6 h-6" />
                         <h3 className="text-2xl font-bold uppercase">The Elimination List</h3>
                      </div>
                      <p className="text-gray-500">The "Trivial Many" that dilute focus.</p>
                    </div>
                    <div className="md:w-2/3">
                        <div className="p-8 border-2 border-dashed border-gray-300 hover:border-black transition-colors">
                           <h4 className="text-xl font-serif font-bold mb-4">{analysis.problems.title}</h4>
                           <p className="text-lg text-gray-700 leading-relaxed">{analysis.problems.content}</p>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Action Plan */}
              <div className="lg:col-span-2 mb-24">
                 <div className="bg-gray-50 p-8 md:p-16 border-t-8 border-black">
                    <div className="flex items-center gap-4 mb-12">
                       <CheckListIcon className="w-8 h-8" />
                       <h3 className="text-3xl font-black uppercase tracking-tight">Execution Protocol</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {analysis.actionPlan.map((step, idx) => (
                          <div key={idx} className="relative group">
                             <div className="text-6xl font-black text-gray-200 absolute -top-4 -left-2 z-0 group-hover:text-black/10 transition-colors select-none">
                                0{idx + 1}
                             </div>
                             <div className="relative z-10 pt-6">
                                <p className="text-lg font-bold leading-tight">{step}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

            </div>

            {/* Footer / Reset */}
            <div className="flex justify-center pb-24">
               <button 
                 onClick={() => {
                   setInput('');
                   setState(AppState.IDLE);
                   setAnalysis(null);
                   setImageUrl(null);
                   setFractalLevel(1);
                 }}
                 className="px-12 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-all"
               >
                 Start New Analysis
               </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;