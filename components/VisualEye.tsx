import React, { useState } from 'react';
import { Eye, Layers, AlertTriangle, CheckCircle, Scan, ArrowRight } from 'lucide-react';
import { analyzeVisualDiff } from '../services/geminiService';

const VisualEye: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ hasRegression: boolean; description: string } | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');

  const handleScan = async () => {
    setAnalyzing(true);
    setResult(null);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 2000));
    
    const analysis = await analyzeVisualDiff("Checkout Page Button Alignment");
    setResult(analysis);
    setAnalyzing(false);
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Eye className="text-blue-600" /> Visual Eye
          </h1>
          <p className="text-slate-500">AI-Powered Visual Regression Testing. Detects layout shifts, not just DOM changes.</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={analyzing}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50"
        >
          {analyzing ? <Scan className="animate-spin" /> : <Layers />}
          {analyzing ? 'Scanning Pixels...' : 'Run Visual Analysis'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        
        {/* Main Visual Area */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 flex flex-col relative overflow-hidden shadow-sm">
           
           {/* Controls */}
           <div className="flex justify-center mb-6 bg-slate-50 p-1 rounded-lg inline-flex self-center border border-slate-200">
              <button 
                onClick={() => setViewMode('side-by-side')}
                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${viewMode === 'side-by-side' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Side-by-Side
              </button>
              <button 
                onClick={() => setViewMode('overlay')}
                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${viewMode === 'overlay' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Overlay Diff
              </button>
           </div>

           {/* The Visuals (Simulated) */}
           <div className="flex-grow flex items-center justify-center gap-4 relative">
              
              {/* Baseline Image */}
              <div className={`transition-all duration-500 ${viewMode === 'overlay' ? 'absolute inset-0 opacity-50 flex items-center justify-center' : 'w-1/2'}`}>
                 <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full h-80 relative border border-slate-100">
                    <div className="bg-slate-50 p-2 border-b text-center text-xs text-slate-500 font-bold">BASELINE (v1.0)</div>
                    <div className="p-6">
                       <div className="h-4 bg-slate-100 w-3/4 mb-4 rounded"></div>
                       <div className="h-4 bg-slate-100 w-1/2 mb-8 rounded"></div>
                       <div className="flex justify-between items-center mt-12">
                          <div className="h-8 w-20 bg-slate-200 rounded"></div>
                          <div className="h-10 w-32 bg-green-500 rounded shadow-md flex items-center justify-center text-white font-bold text-sm">Checkout</div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Current Image (With Regression) */}
              <div className={`transition-all duration-500 ${viewMode === 'overlay' ? 'absolute inset-0 opacity-50 flex items-center justify-center' : 'w-1/2'}`}>
                 <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm w-full h-80 relative border-2 border-red-500/0">
                    <div className="bg-slate-50 p-2 border-b text-center text-xs text-slate-500 font-bold">CURRENT (v1.1)</div>
                    <div className="p-6">
                       <div className="h-4 bg-slate-100 w-3/4 mb-4 rounded"></div>
                       <div className="h-4 bg-slate-100 w-1/2 mb-8 rounded"></div>
                       {/* The Visual Bug: Button overlaps or moved improperly */}
                       <div className="flex justify-between items-center mt-10 relative"> {/* Shifted up margin */}
                          <div className="h-8 w-20 bg-slate-200 rounded"></div>
                          <div className="h-10 w-32 bg-green-500 rounded shadow-md flex items-center justify-center text-white font-bold text-sm transform -translate-x-4 translate-y-2">Checkout</div>
                          
                          {/* AI Highlighting */}
                          {result && (
                            <div className="absolute inset-0 border-2 border-red-500 bg-red-500/10 rounded animate-pulse ring-4 ring-red-500/20">
                               <div className="absolute -top-6 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                                 Detected Shift
                               </div>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>

        {/* Analysis Result Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6">AI Analysis Report</h2>
          
          {analyzing ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
               <Scan size={32} className="animate-spin mb-4 text-blue-500" />
               <p className="text-sm">Comparing pixel density...</p>
               <p className="text-sm">Ignoring dynamic regions...</p>
            </div>
          ) : result ? (
            <div className="animate-fadeIn space-y-6">
               <div className={`p-4 rounded-lg border ${result.hasRegression ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                 <div className="flex items-center gap-3 mb-2">
                    {result.hasRegression ? <AlertTriangle className="text-red-500" /> : <CheckCircle className="text-green-500" />}
                    <h3 className={`font-bold ${result.hasRegression ? 'text-red-600' : 'text-green-600'}`}>
                      {result.hasRegression ? 'Visual Regression Found' : 'Visual Match'}
                    </h3>
                 </div>
                 <p className="text-sm text-slate-600 leading-relaxed">
                   {result.description}
                 </p>
               </div>

               {result.hasRegression && (
                 <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Technical Details</h4>
                   <div className="space-y-2 text-sm text-slate-500">
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                       <span>Shift Delta</span>
                       <span className="font-mono text-red-500">x: -16px, y: +8px</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                       <span>Overlap Detected</span>
                       <span className="font-mono text-red-500">Yes (Element #checkout-btn)</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                       <span>Confidence</span>
                       <span className="font-mono text-blue-500">99.2%</span>
                     </div>
                   </div>

                   <button className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                     <ArrowRight size={16} /> Send to The Healer
                   </button>
                 </div>
               )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 opacity-70">
               <Eye size={48} className="mb-4" />
               <p className="text-center text-sm">Upload snapshots or run a pipeline<br/>to trigger visual analysis.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VisualEye;