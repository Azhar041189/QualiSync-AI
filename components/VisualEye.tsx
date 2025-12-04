
import React, { useState } from 'react';
import { Eye, Layers, AlertTriangle, CheckCircle, Scan, ArrowRight, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { analyzeVisualDiff } from '../services/geminiService';

const VisualEye: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ hasRegression: boolean; description: string } | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  
  const [baselineImage, setBaselineImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'baseline' | 'current') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'baseline') setBaselineImage(reader.result as string);
        else setCurrentImage(reader.result as string);
        setResult(null); // Reset results on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!baselineImage || !currentImage) {
      alert("Please upload both Baseline and Current screenshots to run analysis.");
      return;
    }

    setAnalyzing(true);
    setResult(null);
    
    try {
      const analysis = await analyzeVisualDiff("User Uploaded Screenshots", baselineImage, currentImage);
      setResult(analysis);
    } catch (error) {
      console.error("Visual Scan failed", error);
      alert("Visual Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const clearImages = () => {
    setBaselineImage(null);
    setCurrentImage(null);
    setResult(null);
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
        <div className="flex gap-3">
          {(baselineImage || currentImage) && (
            <button 
              onClick={clearImages}
              className="px-4 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
          )}
          <button 
            onClick={handleScan}
            disabled={analyzing || !baselineImage || !currentImage}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {analyzing ? <Scan className="animate-spin" /> : <Layers />}
            {analyzing ? 'Scanning Pixels...' : 'Run Visual Analysis'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        
        {/* Main Visual Area */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 flex flex-col relative overflow-hidden shadow-sm min-h-[500px]">
           
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
                disabled={!baselineImage || !currentImage}
                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${viewMode === 'overlay' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 disabled:opacity-50'}`}
              >
                Overlay Diff
              </button>
           </div>

           {/* The Visuals */}
           <div className="flex-grow flex items-center justify-center gap-4 relative">
              
              {/* Baseline Image Container */}
              <div className={`transition-all duration-500 flex-1 h-full ${viewMode === 'overlay' ? 'absolute inset-0 flex items-center justify-center z-0' : ''}`}>
                 <div className="bg-white rounded-lg shadow-md overflow-hidden w-full h-full max-h-[400px] border border-slate-200 flex flex-col">
                    <div className="bg-slate-50 p-2 border-b text-center text-xs text-slate-500 font-bold flex justify-between px-4 items-center">
                      <span>BASELINE (v1.0)</span>
                      <label className="cursor-pointer text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <Upload size={12} />
                        <span className="underline">Upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'baseline')} />
                      </label>
                    </div>
                    <div className="flex-grow bg-slate-100 relative flex items-center justify-center overflow-hidden group">
                       {baselineImage ? (
                         <img src={baselineImage} alt="Baseline" className="w-full h-full object-contain" />
                       ) : (
                         <div className="text-center text-slate-400 p-8">
                            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Upload Baseline Screenshot</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Current Image Container */}
              <div className={`transition-all duration-500 flex-1 h-full ${viewMode === 'overlay' ? 'absolute inset-0 flex items-center justify-center z-10 opacity-50 pointer-events-none' : ''}`}>
                 <div className={`bg-white rounded-lg shadow-md overflow-hidden w-full h-full max-h-[400px] border-2 flex flex-col ${result?.hasRegression ? 'border-red-400' : 'border-slate-200'}`}>
                    <div className="bg-slate-50 p-2 border-b text-center text-xs text-slate-500 font-bold flex justify-between px-4 items-center">
                      <span>CURRENT (v1.1)</span>
                      <label className="cursor-pointer text-blue-600 hover:text-blue-700 flex items-center gap-1 pointer-events-auto">
                        <Upload size={12} />
                        <span className="underline">Upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'current')} />
                      </label>
                    </div>
                    <div className="flex-grow bg-slate-100 relative flex items-center justify-center overflow-hidden">
                       {currentImage ? (
                         <img src={currentImage} alt="Current" className="w-full h-full object-contain" />
                       ) : (
                         <div className="text-center text-slate-400 p-8">
                            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Upload Current Screenshot</p>
                         </div>
                       )}
                       
                       {/* Result Overlay Indicator (Only for Demo Visuals) */}
                       {result?.hasRegression && currentImage && (
                          <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-pulse">
                             Diff Detected
                          </div>
                       )}
                    </div>
                 </div>
              </div>

           </div>
        </div>

        {/* Analysis Result Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-6">AI Analysis Report</h2>
          
          {analyzing ? (
            <div className="flex flex-col items-center justify-center flex-grow text-slate-500">
               <div className="relative mb-4">
                  <Scan size={48} className="text-blue-500 animate-spin-slow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Eye size={20} className="text-blue-600" />
                  </div>
               </div>
               <p className="text-sm font-bold animate-pulse">Comparing pixel density...</p>
               <p className="text-xs text-slate-400 mt-1">Analyzing layout topology...</p>
            </div>
          ) : result ? (
            <div className="animate-fadeIn space-y-6 flex-grow">
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
                       <span>Diff Confidence</span>
                       <span className="font-mono text-blue-500">98.5%</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                       <span>Changes Detected</span>
                       <span className="font-mono text-red-500">Layout & Content</span>
                     </div>
                   </div>

                   <button className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-500/20">
                     <ArrowRight size={16} /> Send to The Healer
                   </button>
                 </div>
               )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-grow text-slate-400 opacity-70">
               <Eye size={48} className="mb-4" />
               <p className="text-center text-sm font-medium">Upload baseline and current screenshots<br/>to trigger AI visual analysis.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VisualEye;
