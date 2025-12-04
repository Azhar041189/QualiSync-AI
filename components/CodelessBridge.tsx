import React, { useState, useRef } from 'react';
import { UploadCloud, Video, FileCode, CheckCircle, Play, Loader2, Code, Disc, Square, Plus, Trash2, Github, MousePointer2, StopCircle, MonitorPlay, AlertCircle, Cpu, Scan, FileText } from 'lucide-react';
import { generateCodeFromVideoEvents, generateAutomationCode } from '../services/geminiService';

const MOCK_VISION_EVENTS = [
  "00:02 - User clicked element '#login-btn' (Confidence: 99%)",
  "00:04 - User typed 'standard_user' into input '#user-name' (Confidence: 98%)",
  "00:06 - User typed '********' into input '#password' (Confidence: 98%)",
  "00:08 - User clicked element '#login-button' (Confidence: 99%)",
  "00:10 - Navigation detected to '/inventory.html' (Confidence: 100%)"
];

const CodelessBridge: React.FC = () => {
  const [mode, setMode] = useState<'upload' | 'record'>('record'); // Default to 'The Mirror' mode
  const [step, setStep] = useState<'idle' | 'recording' | 'processing' | 'review' | 'generating' | 'complete'>('idle');
  
  // Recorder State (Live DOM)
  const [contextInput, setContextInput] = useState("Verify successful user login with valid credentials.");
  const [recordedSteps, setRecordedSteps] = useState<string[]>([]);
  const [mockBrowserUrl, setMockBrowserUrl] = useState("https://www.saucedemo.com");
  const [mockBrowserView, setMockBrowserView] = useState<'login' | 'dashboard'>('login');
  
  // Recorder State (Screen Video)
  const [isScreenRecording, setIsScreenRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Common State
  const [selectedFramework, setSelectedFramework] = useState<'Playwright' | 'Selenium' | 'Cypress'>('Playwright');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("Initializing...");
  const [visionEvents, setVisionEvents] = useState<string[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  // --- Handlers for LIVE DOM RECORDING ---

  const startLiveRecording = () => {
    setRecordedSteps([`Open URL '${mockBrowserUrl}'`]);
    setStep('recording');
  };

  const stopLiveRecording = () => {
    setStep('review');
  };

  const handleMockInteraction = (action: string) => {
    if (step !== 'recording') return;
    setRecordedSteps(prev => [...prev, action]);
    
    // Simulating page transition for demo
    if (action.includes("Click 'Login'")) {
       setTimeout(() => {
         setMockBrowserView('dashboard');
         setRecordedSteps(prev => [...prev, "Verify page redirected to '/inventory.html'"]);
         setMockBrowserUrl("https://www.saucedemo.com/inventory.html");
       }, 500);
    }
  };

  const addManualStep = () => {
    const newStep = prompt("Enter new test step:");
    if (newStep) setRecordedSteps(prev => [...prev, newStep]);
  };

  const deleteStep = (index: number) => {
    setRecordedSteps(prev => prev.filter((_, i) => i !== index));
    if (mode === 'upload') {
      setVisionEvents(prev => prev.filter((_, i) => i !== index));
    }
  };

  // --- Handlers for SCREEN RECORDING ---

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        stream.getTracks().forEach(track => track.stop()); // Stop sharing
        setIsScreenRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsScreenRecording(true);
      setStep('recording');
    } catch (err) {
      console.error("Error starting screen record:", err);
      alert("Could not start screen recording. Please check permissions.");
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && isScreenRecording) {
      mediaRecorderRef.current.stop();
      // State update happens in onstop event
    }
  };

  // --- Handlers for GENERATION ---

  const handleGenerateCode = async () => {
    setStep('generating');
    let code = "";
    if (mode === 'record') {
       code = await generateAutomationCode(contextInput, recordedSteps, selectedFramework);
    } else {
       code = await generateCodeFromVideoEvents(visionEvents);
    }
    setGeneratedCode(code);
    setStep('complete');
  };

  const handleCommit = () => {
    alert("Simulating Commit to GitHub Repo 'qualysis-tests/main'...");
  };

  // --- Handlers for UPLOAD/PROCESS ---
  
  const handleProcessVideo = () => {
    setStep('processing');
    setUploadProgress(0);
    setProcessingStage("Initializing Video Stream...");
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2; // Slower increment for realism
      setUploadProgress(progress);
      
      // Dynamic Stage Text
      if (progress > 10 && progress < 30) setProcessingStage("Decomposing Frames (FPS Analysis)...");
      if (progress > 30 && progress < 60) setProcessingStage("Computer Vision: Detecting UI Elements...");
      if (progress > 60 && progress < 85) setProcessingStage("OCR: Extracting Labels & Text...");
      if (progress > 85) setProcessingStage("Synthesizing Interaction Events...");

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setVisionEvents(MOCK_VISION_EVENTS);
          setStep('review');
        }, 800);
      }
    }, 80); // 80ms * 50 steps = 4 seconds approx
  };

  const handleFileUpload = () => {
    // Simulating file selection by just jumping to process
    handleProcessVideo();
  };

  // Reset state when mode changes
  const changeMode = (newMode: 'upload' | 'record') => {
    setMode(newMode);
    setStep('idle');
    setRecordedVideoUrl(null);
    setRecordedSteps([]);
    setVisionEvents([]);
    setGeneratedCode("");
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Video className="text-blue-600" /> The Mirror <span className="text-sm font-normal text-slate-500 ml-2 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Manual-to-Auto Converter</span>
          </h1>
          <p className="text-slate-500">Perform tests manually. The AI watches, learns, and generates self-healing code.</p>
        </div>
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex gap-1 shadow-sm">
          <button 
            onClick={() => changeMode('record')}
            className={`px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors ${mode === 'record' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Disc size={14} /> Live Record
          </button>
          <button 
             onClick={() => changeMode('upload')}
             className={`px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors ${mode === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UploadCloud size={14} /> Video/Screen
          </button>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
        
        {/* LEFT PANEL: Input & Recording */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col relative overflow-hidden h-full shadow-sm">
          
          {/* --- MODE: LIVE RECORD (Mock Browser) --- */}
          {mode === 'record' && (
            <div className="flex flex-col h-full">
              {/* Context Input */}
              {step === 'idle' && (
                 <div className="mb-6 animate-fadeIn">
                   <label className="block text-sm font-bold text-slate-500 mb-2">1. Define Context</label>
                   <div className="relative">
                     <input 
                       type="text" 
                       value={contextInput}
                       onChange={(e) => setContextInput(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500"
                       placeholder="e.g. Verify user can update profile picture..."
                     />
                     <div className="absolute right-3 top-3 text-xs text-slate-400">helps generate function names</div>
                   </div>
                   <button 
                     onClick={startLiveRecording}
                     className="mt-4 w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                   >
                     <Disc className="animate-pulse" /> Start Recording Session
                   </button>
                 </div>
              )}

              {/* Mock Browser */}
              {(step === 'recording' || step === 'idle') && (
                <div className={`flex-grow border border-slate-300 rounded-lg overflow-hidden flex flex-col shadow-inner ${step === 'idle' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                  {/* Browser Bar */}
                  <div className="bg-slate-100 p-2 flex items-center gap-2 border-b border-slate-300">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-grow bg-white rounded px-3 py-1 text-xs text-slate-600 font-mono border border-slate-200 shadow-sm">
                      {mockBrowserUrl}
                    </div>
                  </div>

                  {/* Browser Content */}
                  <div className="flex-grow bg-white relative p-4 overflow-hidden">
                    {mockBrowserView === 'login' ? (
                      <div className="max-w-xs mx-auto mt-10 p-6 border rounded shadow-sm bg-gray-50 text-center">
                        <div className="text-xl font-bold text-slate-800 mb-6">Swag Labs</div>
                        <input 
                          className="w-full p-2 border mb-3 rounded text-sm text-slate-800 border-red-500 ring-2 ring-red-100 cursor-pointer hover:bg-blue-50"
                          placeholder="Username"
                          onClick={() => handleMockInteraction("Type 'standard_user' into 'Username'")}
                          readOnly
                        />
                        <input 
                          className="w-full p-2 border mb-4 rounded text-sm text-slate-800 cursor-pointer hover:bg-blue-50"
                          placeholder="Password"
                          type="password"
                          onClick={() => handleMockInteraction("Type 'secret_sauce' into 'Password'")}
                          readOnly
                        />
                        <button 
                           className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 active:scale-95 transition-transform"
                           onClick={() => handleMockInteraction("Click 'Login' button")}
                        >
                          LOGIN
                        </button>
                        <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded pointer-events-none">
                           The Mirror: Recording Clicks...
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-6 border-b pb-2">
                          <div className="text-slate-800 font-bold text-lg">Products</div>
                          <div className="bg-slate-200 p-2 rounded-full cursor-pointer hover:bg-blue-100" onClick={() => handleMockInteraction("Click 'Cart' icon")}>🛒</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="border p-4 rounded bg-gray-50">
                             <div className="h-20 bg-slate-200 mb-2 rounded"></div>
                             <div 
                               className="font-bold text-red-600 cursor-pointer hover:underline"
                               onClick={() => handleMockInteraction("Verify text 'Sauce Labs Backpack' exists")}
                             >
                               Sauce Labs Backpack
                             </div>
                             <div className="text-sm text-slate-600">$29.99</div>
                             <button 
                               className="mt-2 text-xs border border-slate-400 px-2 py-1 rounded hover:bg-slate-200"
                               onClick={() => handleMockInteraction("Click 'Add to Cart' (Backpack)")}
                             >Add to Cart</button>
                           </div>
                           <div className="border p-4 rounded bg-gray-50">
                             <div className="h-20 bg-slate-200 mb-2 rounded"></div>
                             <div className="font-bold text-slate-800">Bike Light</div>
                             <div className="text-sm text-slate-600">$9.99</div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {step === 'recording' && (
                    <div className="bg-slate-100 p-3 flex justify-center border-t border-slate-300">
                      <button 
                        onClick={stopLiveRecording}
                        className="px-6 py-2 bg-slate-800 text-white font-bold rounded flex items-center gap-2 hover:bg-slate-700 transition-colors"
                      >
                        <Square fill="currentColor" size={14} /> Stop Recording
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- MODE: UPLOAD / SCREEN RECORD --- */}
          {mode === 'upload' && step !== 'review' && step !== 'generating' && step !== 'complete' && (
             step === 'processing' ? (
                // Processing View
                <div className="h-full flex flex-col items-center justify-center animate-fadeIn">
                  <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-xl shadow-xl">
                    <div className="flex items-center gap-3 mb-6 justify-center">
                       <Cpu className="text-blue-500 animate-spin-slow" size={32} />
                       <h3 className="text-xl font-bold text-slate-800">AI Vision Processing</h3>
                    </div>
                    
                    <div className="mb-2 flex justify-between text-xs font-mono text-slate-500">
                      <span>STATUS</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 relative" 
                        style={{ width: `${uploadProgress}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>

                    <div className="text-center h-6">
                       <p className="text-sm text-blue-600 font-medium animate-pulse">{processingStage}</p>
                    </div>
                  </div>
                </div>
             ) : (
                // Selection / Recording Zone
                <div className="h-full flex flex-col gap-4 animate-fadeIn">
                  
                  {/* Video Preview (if recorded) */}
                  {recordedVideoUrl ? (
                    <div className="flex-grow flex flex-col bg-black rounded-lg border border-slate-200 overflow-hidden relative group">
                       <video src={recordedVideoUrl} controls className="w-full h-full object-contain" />
                       <div className="absolute top-4 left-4 bg-green-500/90 text-black text-xs font-bold px-3 py-1 rounded backdrop-blur flex items-center gap-2">
                         <CheckCircle size={14} /> Capture Complete
                       </div>
                       <div className="absolute bottom-4 right-4 flex gap-2">
                         <button 
                           onClick={() => setRecordedVideoUrl(null)} 
                           className="px-4 py-2 bg-white/80 text-slate-900 rounded hover:bg-white backdrop-blur-sm text-xs font-bold border border-slate-300"
                         >
                           Discard & Retake
                         </button>
                         <button 
                           onClick={handleProcessVideo} 
                           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 backdrop-blur-sm text-xs font-bold shadow-lg flex items-center gap-2"
                         >
                           <Scan size={14} /> Analyze Video with AI
                         </button>
                       </div>
                    </div>
                  ) : (
                    // Default State: Choose Upload or Record
                    <div className="flex-grow flex flex-col gap-4">
                      
                      {/* Option 1: Screen Record */}
                      <div className={`flex-1 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center transition-all relative overflow-hidden ${isScreenRecording ? 'bg-red-50 border-red-500/50' : 'hover:border-blue-500 hover:bg-blue-50'}`}>
                        {isScreenRecording ? (
                          <div className="text-center z-10">
                            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 animate-ping-slow">
                              <div className="w-10 h-10 rounded bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"></div>
                            </div>
                            <h3 className="text-xl font-bold text-red-500 animate-pulse">Recording In Progress...</h3>
                            <p className="text-sm text-slate-500 mt-2 mb-6">Capture your manual test steps</p>
                            <button 
                              onClick={stopScreenRecording}
                              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-500/20 flex items-center gap-2 mx-auto"
                            >
                              <StopCircle size={20} /> Stop Recording
                            </button>
                          </div>
                        ) : (
                          <div className="text-center cursor-pointer z-10" onClick={startScreenRecording}>
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                               <MonitorPlay size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">Record Screen</h3>
                            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Capture your desktop or specific browser window.</p>
                          </div>
                        )}
                        {/* Background Decoration */}
                        {!isScreenRecording && <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-transparent pointer-events-none"></div>}
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-4">
                        <div className="h-px bg-slate-300 flex-grow"></div>
                        <span className="text-slate-500 text-xs font-bold uppercase">Or</span>
                        <div className="h-px bg-slate-300 flex-grow"></div>
                      </div>

                      {/* Option 2: Upload File */}
                      <div 
                        onClick={handleFileUpload}
                        className="h-24 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl flex items-center justify-center cursor-pointer gap-4 transition-all group"
                      >
                        <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                           <UploadCloud size={24} className="text-slate-500 group-hover:text-blue-500" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-slate-700">Upload Video File</h3>
                          <p className="text-xs text-slate-500">.mp4, .mov, .webm (Max 50MB)</p>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
             )
          )}

          {/* --- REVIEW PHASE (Common) --- */}
          {(step === 'review' || step === 'generating' || step === 'complete') && (
            <div className="flex flex-col h-full animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   <CheckCircle size={18} className="text-green-500" /> Review Steps
                 </h3>
                 <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">NLP Engine Active</span>
              </div>
              
              <div className="flex-grow bg-slate-50 rounded-lg p-4 border border-slate-200 overflow-y-auto space-y-2 font-mono text-sm">
                {(mode === 'record' ? recordedSteps : visionEvents).map((s, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded border border-slate-200 group hover:border-blue-400 transition-colors shadow-sm">
                    <span className="text-slate-400 select-none pt-0.5">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div className="flex-grow">
                      <div className="text-slate-800">{s.split('(')[0]}</div>
                      {s.includes('Confidence') && (
                        <div className="text-[10px] text-green-600/80 mt-1 flex items-center gap-1">
                           <Scan size={10} /> Computer Vision detected (Confidence: {s.match(/Confidence: (\d+%)/)?.[1]})
                        </div>
                      )}
                    </div>
                    <button onClick={() => deleteStep(idx)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {mode === 'record' && (
                  <button 
                    onClick={addManualStep}
                    className="w-full py-2 border border-dashed border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-700 rounded flex items-center justify-center gap-2 text-xs"
                  >
                    <Plus size={12} /> Add Verification Step
                  </button>
                )}
              </div>
              
              {step === 'review' && (
                <div className="mt-6 space-y-4">
                   {mode === 'record' && (
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Framework</label>
                       <div className="flex gap-2">
                          {['Playwright', 'Selenium', 'Cypress'].map((fw) => (
                             <button 
                               key={fw}
                               onClick={() => setSelectedFramework(fw as any)}
                               className={`flex-1 py-2 rounded border text-sm font-bold ${selectedFramework === fw ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}
                             >
                               {fw}
                             </button>
                          ))}
                       </div>
                     </div>
                   )}
                   <button 
                    onClick={handleGenerateCode}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                  >
                    <FileCode size={18} /> Generate Automation Script
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Code Output */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Code size={18} className="text-purple-600" /> Generated Code
          </h3>
          
          {/* Changed background from bg-slate-900 to bg-slate-50 and text from slate-300 to slate-800 */}
          <div className="flex-grow bg-slate-50 rounded-lg border border-slate-200 p-4 font-mono text-sm text-slate-800 overflow-auto relative shadow-inner">
             {step !== 'complete' && step !== 'generating' && (
               <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col opacity-60">
                 <MousePointer2 size={48} className="mb-4" />
                 <p className="text-center">Interact with the Mirror<br/>to generate code.</p>
               </div>
             )}

             {step === 'generating' && (
               <div className="absolute inset-0 flex items-center justify-center text-blue-500 flex-col bg-white/80 backdrop-blur-sm z-10">
                 <Loader2 size={48} className="mb-4 animate-spin" />
                 <p className="animate-pulse font-bold">Synthesizing {selectedFramework} code...</p>
                 <p className="text-xs text-slate-500 mt-2">Designing Smart Selectors...</p>
               </div>
             )}

             {generatedCode && (
               <pre className="whitespace-pre-wrap">{generatedCode}</pre>
             )}
          </div>
          
          {step === 'complete' && (
            <div className="mt-4 flex gap-3">
               <button 
                 onClick={handleCommit}
                 className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-300"
               >
                 <Github size={16} /> Commit to GitHub
               </button>
               <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md">
                 <Play size={16} /> Run in Pipeline
               </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CodelessBridge;