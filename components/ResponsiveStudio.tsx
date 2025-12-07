import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, Tablet, Monitor, RotateCw, ZoomIn, ZoomOut,
  X, LayoutGrid, Search, Save, Globe, RefreshCw, ChevronRight,
  Play, Palette, Check, MoveVertical, MousePointer2, Keyboard, CheckCircle2
} from 'lucide-react';
import { DeviceProfile, ResponsiveSession } from '../types';

interface ExtendedDeviceProfile extends DeviceProfile {
  badge?: 'PRO' | 'NEW';
  releaseYear?: string;
  skin: 'dynamic-island' | 'notch' | 'home-button' | 'punch-hole' | 'teardrop' | 'macbook' | 'ipad' | 'default';
}

const DEVICES: ExtendedDeviceProfile[] = [
  // ==================== APPLE ====================
  // --- Latest iPhones ---
  { id: 'iphone16promax', name: 'iPhone 16 Pro Max', width: 430, height: 932, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'dynamic-island', badge: 'NEW', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)...' },
  { id: 'iphone15pro', name: 'iPhone 15 Pro', width: 393, height: 852, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'dynamic-island', badge: 'PRO', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...' },
  { id: 'iphone14', name: 'iPhone 14', width: 390, height: 844, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'notch', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)...' },
  // --- Legacy iPhones ---
  { id: 'iphone8plus', name: 'iPhone 8 Plus', width: 414, height: 736, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'home-button', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X)...' },
  { id: 'iphone8', name: 'iPhone 8', width: 375, height: 667, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'home-button', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X)...' },
  { id: 'iphonese', name: 'iPhone SE (2022)', width: 375, height: 667, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'home-button', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...' },
  // --- iPads ---
  { id: 'ipadair', name: 'iPad Air', width: 820, height: 1180, type: 'tablet', vendor: 'Apple', os: 'ios', skin: 'ipad', userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)...' },
  // --- Macs ---
  { id: 'macbookair', name: 'MacBook Air', width: 1280, height: 832, type: 'desktop', vendor: 'Apple', os: 'mac', skin: 'macbook', badge: 'PRO', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...' },

  // ==================== SAMSUNG ====================
  { id: 's24ultra', name: 'Galaxy S24 Ultra', width: 412, height: 915, type: 'mobile', vendor: 'Samsung', os: 'android', skin: 'punch-hole', badge: 'PRO', userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B)...' },
  { id: 's23', name: 'Galaxy S23', width: 360, height: 780, type: 'mobile', vendor: 'Samsung', os: 'android', skin: 'punch-hole', userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B)...' },
  { id: 'galaxytab', name: 'Galaxy Tab S9', width: 800, height: 1280, type: 'tablet', vendor: 'Samsung', os: 'android', skin: 'default', userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-X710)...' },

  // ==================== GOOGLE ====================
  { id: 'pixel8pro', name: 'Pixel 8 Pro', width: 412, height: 915, type: 'mobile', vendor: 'Google', os: 'android', skin: 'punch-hole', badge: 'PRO', userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro)...' },
  { id: 'pixel5', name: 'Pixel 5', width: 393, height: 851, type: 'mobile', vendor: 'Google', os: 'android', skin: 'punch-hole', userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)...' },
];

// --- HARDWARE FRAME COMPONENT ---
const DeviceHardwareFrame: React.FC<{
  device: ExtendedDeviceProfile;
  zoom: number;
  isLandscape: boolean;
  children: React.ReactNode;
}> = ({ device, zoom, isLandscape, children }) => {
  
  const width = isLandscape ? device.height : device.width;
  const height = isLandscape ? device.width : device.height;
  const s = (val: number) => val * zoom;

  const isHomeButton = device.skin === 'home-button';
  const isNotch = device.skin === 'notch';
  const isDynamicIsland = device.skin === 'dynamic-island';
  const isPunchHole = device.skin === 'punch-hole';
  const isMacbook = device.skin === 'macbook';
  
  const sideBezel = 12;
  const topBezel = isHomeButton ? 80 : 12;
  const bottomBezel = isHomeButton ? 80 : 12; 
  const frameWidth = width + (sideBezel * 2);
  const frameHeight = height + topBezel + bottomBezel;

  if (isMacbook) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-[#0d0d0d] rounded-t-xl border-t border-l border-r border-gray-700 relative shadow-2xl"
          style={{ width: s(width + 20), height: s(height + 20), padding: s(10) }}>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full border border-gray-800"></div>
          <div className="w-full h-full bg-white overflow-hidden rounded-sm relative">
             {children}
          </div>
        </div>
        <div className="bg-[#c7c7cc] relative z-20 border-t border-slate-400 rounded-b-xl shadow-xl flex justify-center"
          style={{ width: s(width + 60), height: s(14) }}>
           <div className="w-16 h-1.5 bg-[#a1a1a6] rounded-b-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="bg-[#121212] relative shadow-[0_30px_60px_-10px_rgba(0,0,0,0.5)] transition-all duration-300"
        style={{
          width: s(frameWidth),
          height: s(frameHeight),
          borderRadius: s(isHomeButton ? 45 : 35),
          boxShadow: 'inset 0 0 0 2px #333, inset 0 0 0 6px #000, 0 20px 40px -10px rgba(0,0,0,0.4)'
        }}>
        {!isLandscape && device.skin !== 'ipad' && (
          <>
            <div className="absolute bg-[#222] right-[-2px] top-[120px] w-[3px] h-[60px] rounded-r-md border-l border-black"></div>
            <div className="absolute bg-[#222] left-[-2px] top-[100px] w-[3px] h-[40px] rounded-l-md border-r border-black"></div>
          </>
        )}
        {isHomeButton && (
          <div className="absolute bottom-0 left-0 w-full flex justify-center items-center" style={{ height: s(bottomBezel) }}>
             <div className="w-10 h-10 rounded-full border-2 border-[#222] bg-[#050505] shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"></div>
          </div>
        )}
        {isDynamicIsland && !isLandscape && (
          <div className="absolute left-1/2 -translate-x-1/2 bg-black z-20 rounded-full flex items-center justify-end pr-1 pointer-events-none"
               style={{ top: s(8), width: s(90), height: s(24) }}>
             <div className="w-4 h-4 bg-[#111] rounded-full mr-1 opacity-60"></div>
          </div>
        )}
        {isNotch && !isLandscape && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black z-20 rounded-b-2xl pointer-events-none"
               style={{ width: s(120), height: s(24) }}></div>
        )}
        {isPunchHole && !isLandscape && (
          <div className="absolute left-1/2 -translate-x-1/2 bg-black z-20 rounded-full pointer-events-none border border-[#222]"
               style={{ top: s(10), width: s(12), height: s(12) }}></div>
        )}

        <div className="absolute bg-white overflow-hidden"
          style={{ top: s(topBezel), left: s(sideBezel), width: s(width), height: s(height), borderRadius: s(isHomeButton ? 2 : 28) }}>
           {children}
        </div>
      </div>
    </div>
  );
};

const ResponsiveStudio: React.FC = () => {
  const [session, setSession] = useState<ResponsiveSession>({
    url: '', // Optimization: Start empty
    zoom: 0.5,
    orientation: 'portrait',
    theme: 'light',
    syncScroll: true,
    syncClick: true,
    syncInput: true,
    activeDevices: ['iphone15pro', 's24ultra', 'iphone8plus'],
    colorScheme: 'original'
  });

  const [inputUrl, setInputUrl] = useState(session.url);
  const [showDeviceDrawer, setShowDeviceDrawer] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'mobile' | 'tablet' | 'desktop'>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    setSession(prev => ({ ...prev, url: inputUrl }));
    setRefreshKey(prev => prev + 1);
  };

  const handleSaveSession = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(`Session Saved!`);
    }, 800);
  };

  const toggleDevice = (id: string) => {
    setSession(prev => {
      const isActive = prev.activeDevices.includes(id);
      return {
        ...prev,
        activeDevices: isActive 
          ? prev.activeDevices.filter(d => d !== id)
          : [...prev.activeDevices, id]
      };
    });
  };

  const toggleOrientation = () => {
    setSession(prev => ({ ...prev, orientation: prev.orientation === 'portrait' ? 'landscape' : 'portrait' }));
  };

  const activeDeviceList = DEVICES.filter(d => session.activeDevices.includes(d.id));
  
  const filteredLibrary = DEVICES.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesType = activeTypeTab === 'all' || d.type === activeTypeTab;
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden relative font-sans">
      
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shadow-sm z-30 shrink-0">
        <form onSubmit={handleGo} className="flex-grow max-w-2xl flex items-center gap-2">
          <div className="relative flex-grow group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
               <Globe size={16} />
            </div>
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-slate-100 border border-transparent hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg py-2 pl-10 pr-10 text-sm text-slate-800 focus:outline-none transition-all"
              placeholder="Enter URL (e.g. https://wikipedia.org)"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md flex items-center gap-2">
            <Play size={14} fill="currentColor"/> Launch
          </button>
        </form>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
           <ToggleIcon icon={<MoveVertical size={16} />} active={session.syncScroll} onClick={() => setSession(p => ({...p, syncScroll: !p.syncScroll}))} tooltip="Sync Scroll" />
           <ToggleIcon icon={<MousePointer2 size={16} />} active={session.syncClick} onClick={() => setSession(p => ({...p, syncClick: !p.syncClick}))} tooltip="Sync Click" />
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
           <button onClick={() => setSession(p => ({...p, zoom: Math.max(0.2, p.zoom - 0.1)}))} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded shadow-sm"><ZoomOut size={16}/></button>
           <span className="text-xs font-mono w-10 text-center font-bold text-slate-700">{Math.round(session.zoom * 100)}%</span>
           <button onClick={() => setSession(p => ({...p, zoom: Math.min(1.5, p.zoom + 0.1)}))} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded shadow-sm"><ZoomIn size={16}/></button>
        </div>

        <button onClick={toggleOrientation} className="p-2.5 rounded-lg bg-slate-100 hover:bg-white border border-slate-200 hover:border-slate-300 text-slate-600 shadow-sm" title="Rotate All">
           <RotateCw size={18} />
        </button>

        <div className="flex-grow"></div>
        
        <div className="flex items-center gap-3">
           <button onClick={handleSaveSession} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold shadow-sm">
             {isSaving ? <Check size={14}/> : <Save size={14} className="text-green-600"/>} 
             {isSaving ? 'Saved' : 'Save'}
           </button>
           <button onClick={() => setShowDeviceDrawer(!showDeviceDrawer)} className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm">
               <LayoutGrid size={16} /> Devices
           </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden relative">
         {showDeviceDrawer && (
           <div className="w-[380px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-2xl absolute top-0 bottom-0 left-0">
             <div className="flex bg-slate-900 pt-1 px-1 gap-1">
                {['all', 'mobile', 'tablet', 'desktop'].map(tab => (
                  <button key={tab} onClick={() => setActiveTypeTab(tab as any)} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded-t-lg transition-all ${activeTypeTab === tab ? 'bg-yellow-400 text-black translate-y-0.5' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>{tab}</button>
                ))}
             </div>

             <div className="p-4 border-b border-slate-200 bg-slate-50">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500" placeholder="Search..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} />
               </div>
             </div>
             
             <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-slate-50">
                {['mobile', 'tablet', 'desktop', 'watch'].map(type => {
                   if (activeTypeTab !== 'all' && activeTypeTab !== type) return null;
                   const typeDevices = filteredLibrary.filter(d => d.type === type);
                   if (typeDevices.length === 0) return null;
                   return (
                     <div key={type} className="space-y-3">
                        <div className="px-1 text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 tracking-wider">
                           {type === 'mobile' ? <Smartphone size={12}/> : type === 'tablet' ? <Tablet size={12}/> : <Monitor size={12}/>} {type}s
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                           {typeDevices.map(device => {
                             const isActive = session.activeDevices.includes(device.id);
                             return (
                               <button key={device.id} onClick={() => toggleDevice(device.id)} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 group ${isActive ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}>
                                  {isActive && <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-0.5 border-2 border-white shadow-sm z-10"><CheckCircle2 size={12} strokeWidth={3} /></div>}
                                  <div className={`mb-2 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                     {device.type === 'mobile' ? <Smartphone size={24} strokeWidth={1.5} /> : device.type === 'tablet' ? <Tablet size={24} strokeWidth={1.5} /> : <Monitor size={24} strokeWidth={1.5} />}
                                  </div>
                                  <span className={`text-[10px] font-bold leading-tight h-6 flex items-center ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{device.name}</span>
                               </button>
                             );
                           })}
                        </div>
                     </div>
                   );
                })}
             </div>
           </div>
         )}

         <div className={`flex-grow bg-[#f1f5f9] overflow-auto p-8 relative transition-all duration-300 ${showDeviceDrawer ? 'ml-[380px]' : 'ml-0'}`}>
            <div className="flex flex-wrap items-start justify-center gap-12 pb-20 min-h-full content-start pt-12">
              {activeDeviceList.map(device => {
                 const isLandscape = session.orientation === 'landscape';
                 return (
                   <div key={device.id} className="flex flex-col items-center group relative animate-scaleIn">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                         <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
                            {device.vendor} {device.name} 
                            <span className="opacity-50 border-l border-slate-600 pl-2">{isLandscape ? device.height : device.width} x {isLandscape ? device.width : device.height}</span>
                         </div>
                         <button onClick={() => toggleDevice(device.id)} className="bg-white text-slate-500 hover:text-red-500 p-1.5 rounded-full shadow-md border border-slate-200 transition-colors"><X size={12}/></button>
                      </div>

                      <DeviceHardwareFrame device={device} zoom={session.zoom} isLandscape={isLandscape}>
                         {session.url ? (
                            <iframe 
                                key={refreshKey}
                                src={session.url}
                                className="w-full h-full bg-white border-none"
                                style={{ 
                                  width: isLandscape ? device.height : device.width, 
                                  height: isLandscape ? device.width : device.height, 
                                  transform: `scale(${session.zoom})`, 
                                  transformOrigin: 'top left',
                                  filter: session.colorScheme === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'none'
                                }}
                                title={device.name}
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                loading="lazy"
                             />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400" style={{ width: isLandscape ? device.height : device.width, height: isLandscape ? device.width : device.height, transform: `scale(${session.zoom})`, transformOrigin: 'top left' }}>
                              <Globe size={32} className="mb-2 opacity-50"/>
                              <p className="text-sm font-bold">Enter URL to Launch</p>
                           </div>
                         )}
                      </DeviceHardwareFrame>
                   </div>
                 );
              })}
            </div>
         </div>
      </div>
    </div>
  );
};

const ToggleIcon = ({ icon, active, onClick, tooltip }: any) => (
  <button onClick={onClick} title={tooltip} className={`p-1.5 rounded transition-colors ${active ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-white hover:text-slate-600 shadow-sm'}`}>
    {icon}
  </button>
);

export default ResponsiveStudio;