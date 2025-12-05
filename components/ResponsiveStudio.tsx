
import React, { useState } from 'react';
import { 
  Smartphone, Tablet, Monitor, RotateCw, ZoomIn, ZoomOut, Moon, Sun, Camera, 
  MousePointer2, Keyboard, MoveVertical, Globe, Terminal, X,
  LayoutGrid, Filter, Search, Watch, Laptop
} from 'lucide-react';
import { DeviceProfile, ResponsiveSession } from '../types';

const DEVICES: DeviceProfile[] = [
  // --- Apple Phones ---
  { id: 'iphone15promax', name: 'iPhone 15 Pro Max', width: 430, height: 932, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'dynamic-island', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...' },
  { id: 'iphone15pro', name: 'iPhone 15 Pro', width: 393, height: 852, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'dynamic-island', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...' },
  { id: 'iphone15plus', name: 'iPhone 15 Plus', width: 428, height: 926, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'dynamic-island', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...' },
  { id: 'iphone15', name: 'iPhone 15', width: 393, height: 852, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'dynamic-island', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...' },
  { id: 'iphone14promax', name: 'iPhone 14 Pro Max', width: 430, height: 932, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'dynamic-island', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)...' },
  { id: 'iphone14pro', name: 'iPhone 14 Pro', width: 393, height: 852, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'dynamic-island', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)...' },
  { id: 'iphone14plus', name: 'iPhone 14 Plus', width: 428, height: 926, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'notch', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)...' },
  { id: 'iphone13promax', name: 'iPhone 13 Pro Max', width: 428, height: 926, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'notch', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...' },
  { id: 'iphone13', name: 'iPhone 13', width: 390, height: 844, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'notch', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...' },
  { id: 'iphone13mini', name: 'iPhone 13 Mini', width: 375, height: 812, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'notch', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...' },
  { id: 'iphone12promax', name: 'iPhone 12 Pro Max', width: 428, height: 926, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'notch', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)...' },
  { id: 'iphone11pro', name: 'iPhone 11 Pro', width: 375, height: 812, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'notch', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X)...' },
  { id: 'iphonese', name: 'iPhone SE (2022)', width: 375, height: 667, type: 'mobile', vendor: 'Apple', os: 'ios', skin: 'default', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...' },

  // --- Android Phones (Samsung) ---
  { id: 's24ultra', name: 'Galaxy S24 Ultra', width: 412, height: 915, type: 'mobile', vendor: 'Samsung', os: 'android', skin: 'punch-hole', userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B)...' },
  { id: 's23ultra', name: 'Galaxy S23 Ultra', width: 384, height: 832, type: 'mobile', vendor: 'Samsung', os: 'android', skin: 'punch-hole', userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S918B)...' },
  { id: 's23', name: 'Galaxy S23', width: 360, height: 780, type: 'mobile', vendor: 'Samsung', os: 'android', skin: 'punch-hole', userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B)...' },
  { id: 'zfold5', name: 'Galaxy Z Fold 5', width: 344, height: 882, type: 'mobile', vendor: 'Samsung', os: 'android', skin: 'punch-hole', userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-F946B)...' }, // Folded
  { id: 'zflip5', name: 'Galaxy Z Flip 5', width: 412, height: 919, type: 'mobile', vendor: 'Samsung', os: 'android', skin: 'punch-hole', userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-F731B)...' },

  // --- Android Phones (Google) ---
  { id: 'pixel8pro', name: 'Pixel 8 Pro', width: 412, height: 915, type: 'mobile', vendor: 'Google', os: 'android', skin: 'punch-hole', userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro)...' },
  { id: 'pixel8', name: 'Pixel 8', width: 412, height: 915, type: 'mobile', vendor: 'Google', os: 'android', skin: 'punch-hole', userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)...' },
  { id: 'pixel7pro', name: 'Pixel 7 Pro', width: 412, height: 892, type: 'mobile', vendor: 'Google', os: 'android', skin: 'punch-hole', userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro)...' },

  // --- Tablets ---
  { id: 'ipadpro12', name: 'iPad Pro 12.9"', width: 1024, height: 1366, type: 'tablet', vendor: 'Apple', os: 'ios', skin: 'ipad', userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)...' },
  { id: 'ipadair', name: 'iPad Air', width: 820, height: 1180, type: 'tablet', vendor: 'Apple', os: 'ios', skin: 'ipad', userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)...' },
  { id: 'ipadmini', name: 'iPad Mini', width: 744, height: 1133, type: 'tablet', vendor: 'Apple', os: 'ios', skin: 'ipad', userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)...' },
  { id: 'galaxytab', name: 'Galaxy Tab S8', width: 800, height: 1280, type: 'tablet', vendor: 'Samsung', os: 'android', skin: 'default', userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-X700)...' },

  // --- Desktop/Laptop ---
  { id: 'macbookair', name: 'MacBook Air', width: 1280, height: 832, type: 'desktop', vendor: 'Apple', os: 'mac', skin: 'macbook', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...' },
  { id: 'macbookpro16', name: 'MacBook Pro 16"', width: 1728, height: 1117, type: 'desktop', vendor: 'Apple', os: 'mac', skin: 'macbook', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...' },
  { id: 'dellxps', name: 'Dell XPS 15', width: 1920, height: 1080, type: 'desktop', vendor: 'Microsoft', os: 'windows', skin: 'default', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...' },
  
  // --- Wearables/Others ---
  { id: 'applewatch8', name: 'Apple Watch S8', width: 198, height: 242, type: 'watch', vendor: 'Apple', os: 'ios', skin: 'default', userAgent: 'Mozilla/5.0 (Apple Watch)...' },
];

const ResponsiveStudio: React.FC = () => {
  const [session, setSession] = useState<ResponsiveSession>({
    url: 'https://www.saucedemo.com',
    zoom: 0.5,
    orientation: 'portrait',
    theme: 'light',
    syncScroll: true,
    syncClick: true,
    syncInput: true,
    activeDevices: ['iphone15pro', 'pixel8', 'ipadair']
  });

  const [inputUrl, setInputUrl] = useState(session.url);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showDeviceDrawer, setShowDeviceDrawer] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState<'All'|'Apple'|'Samsung'|'Google'|'Other'>('All');
  const [isCapturing, setIsCapturing] = useState(false);

  const handleGo = (e: React.FormEvent) => {
    e.preventDefault();
    setSession(prev => ({ ...prev, url: inputUrl }));
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

  const takeScreenshot = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      alert("High-Res Screenshot captured for all active devices!");
    }, 1500);
  };

  const activeDeviceList = DEVICES.filter(d => session.activeDevices.includes(d.id));
  
  const filteredLibrary = DEVICES.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesVendor = vendorFilter === 'All' || d.vendor === vendorFilter || (vendorFilter === 'Other' && !['Apple', 'Samsung', 'Google'].includes(d.vendor));
    return matchesSearch && matchesVendor;
  });

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white overflow-hidden relative">
      
      {/* --- TOP TOOLBAR --- */}
      <div className="h-16 bg-[#252526] border-b border-[#3e3e42] flex items-center px-4 gap-4 shadow-md z-30 shrink-0">
        <form onSubmit={handleGo} className="flex-grow max-w-2xl flex items-center gap-2">
          <div className="relative flex-grow">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-[#333333] border border-[#3e3e42] rounded-md py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-md text-sm font-bold transition-colors">Go</button>
        </form>

        <div className="w-px h-6 bg-[#3e3e42]"></div>
        <div className="flex items-center gap-1">
           <ToggleIcon icon={<MoveVertical size={16} />} active={session.syncScroll} onClick={() => setSession(p => ({...p, syncScroll: !p.syncScroll}))} tooltip="Sync Scroll" />
           <ToggleIcon icon={<MousePointer2 size={16} />} active={session.syncClick} onClick={() => setSession(p => ({...p, syncClick: !p.syncClick}))} tooltip="Sync Click" />
           <ToggleIcon icon={<Keyboard size={16} />} active={session.syncInput} onClick={() => setSession(p => ({...p, syncInput: !p.syncInput}))} tooltip="Sync Input" />
        </div>

        <div className="w-px h-6 bg-[#3e3e42]"></div>
        <div className="flex items-center gap-2">
          <button onClick={toggleOrientation} className="p-2 hover:bg-[#333] rounded text-gray-400 hover:text-white" title="Rotate All">
             <RotateCw size={18} />
          </button>
          <div className="flex items-center gap-2 bg-[#333] rounded px-2 py-1">
             <button onClick={() => setSession(p => ({...p, zoom: Math.max(0.2, p.zoom - 0.1)}))} className="text-gray-400 hover:text-white"><ZoomOut size={16}/></button>
             <span className="text-xs font-mono w-12 text-center">{Math.round(session.zoom * 100)}%</span>
             <button onClick={() => setSession(p => ({...p, zoom: Math.min(1.5, p.zoom + 0.1)}))} className="text-gray-400 hover:text-white"><ZoomIn size={16}/></button>
          </div>
        </div>

        <div className="flex-grow"></div>
        <button onClick={() => setShowDeviceDrawer(!showDeviceDrawer)} className={`px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors ${showDeviceDrawer ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#333]'}`}>
            <LayoutGrid size={16} /> Devices
        </button>
      </div>

      <div className="flex-grow flex overflow-hidden">
         {/* --- DEVICE DRAWER (LEFT SIDEBAR STYLE) --- */}
         {showDeviceDrawer && (
           <div className="w-72 bg-[#252526] border-r border-[#3e3e42] flex flex-col z-20 shadow-2xl animate-slide-right">
             <div className="p-3 border-b border-[#3e3e42]">
               <div className="relative mb-3">
                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                 <input 
                   className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-8 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                   placeholder="Search devices..."
                   value={searchFilter}
                   onChange={(e) => setSearchFilter(e.target.value)}
                 />
               </div>
               <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                 {['All', 'Apple', 'Samsung', 'Google', 'Other'].map((v) => (
                   <button 
                     key={v}
                     onClick={() => setVendorFilter(v as any)}
                     className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${vendorFilter === v ? 'bg-blue-600 text-white' : 'bg-[#333] text-gray-400 hover:text-gray-200'}`}
                   >
                     {v}
                   </button>
                 ))}
               </div>
             </div>
             
             <div className="flex-grow overflow-y-auto p-2 space-y-4">
                {/* Categorize by Type */}
                {['mobile', 'tablet', 'desktop', 'watch'].map(type => {
                   const typeDevices = filteredLibrary.filter(d => d.type === type);
                   if (typeDevices.length === 0) return null;
                   return (
                     <div key={type} className="space-y-1">
                        <div className="px-2 text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                           {type === 'mobile' ? <Smartphone size={10}/> : type === 'tablet' ? <Tablet size={10}/> : type === 'desktop' ? <Laptop size={10}/> : <Watch size={10}/>}
                           {type}s
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           {typeDevices.map(device => (
                             <button
                               key={device.id}
                               onClick={() => toggleDevice(device.id)}
                               className={`flex flex-col items-center justify-center p-2 rounded border text-center transition-all ${
                                 session.activeDevices.includes(device.id) 
                                   ? 'bg-blue-600/20 border-blue-500 text-white' 
                                   : 'bg-[#1e1e1e] border-[#3e3e42] text-gray-400 hover:border-gray-500'
                               }`}
                             >
                                <div className="mb-1">
                                   {device.type === 'mobile' ? <Smartphone size={16} /> : device.type === 'tablet' ? <Tablet size={16} /> : <Monitor size={16} />}
                                </div>
                                <span className="text-[10px] font-medium leading-tight">{device.name}</span>
                                <span className="text-[9px] text-gray-600 mt-0.5">{device.width}x{device.height}</span>
                             </button>
                           ))}
                        </div>
                     </div>
                   )
                })}
             </div>
           </div>
         )}

         {/* --- MAIN CANVAS --- */}
         <div className="flex-grow bg-[#111111] overflow-auto p-8 relative scrollbar-hide">
            {isCapturing && (
              <div className="absolute inset-0 bg-white/10 z-50 flex items-center justify-center backdrop-blur-sm animate-pulse pointer-events-none">
                <div className="bg-black/80 text-white px-6 py-4 rounded-xl flex items-center gap-3 border border-white/20">
                  <Camera className="animate-bounce" /> Capturing High-Res Snapshots...
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-start justify-center gap-12 pb-20">
              {activeDeviceList.length === 0 && (
                <div className="text-center text-gray-600 mt-20 flex flex-col items-center">
                   <LayoutGrid size={64} className="mb-4 opacity-20" />
                   <p>No devices active.</p>
                   <button onClick={() => setShowDeviceDrawer(true)} className="mt-4 text-blue-500 text-sm hover:underline">Open Device Library</button>
                </div>
              )}

              {activeDeviceList.map(device => {
                 const isLandscape = session.orientation === 'landscape';
                 const width = isLandscape ? device.height : device.width;
                 const height = isLandscape ? device.width : device.height;
                 
                 // CSS Frame Logic
                 const hasDynamicIsland = device.skin === 'dynamic-island';
                 const hasNotch = device.skin === 'notch';
                 const hasPunchHole = device.skin === 'punch-hole';
                 const isMacBook = device.skin === 'macbook';
                 
                 const borderRadius = isMacBook ? (session.zoom > 0.5 ? 12 : 6) : (session.zoom > 0.5 ? 40 : 20);

                 return (
                   <div key={device.id} className="flex flex-col items-center group relative">
                      {/* Device Header */}
                      <div className="mb-2 text-gray-400 text-xs font-bold flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                         {device.vendor === 'Apple' ? '' : device.vendor === 'Google' ? 'G' : device.vendor === 'Samsung' ? 'S' : '#'} {device.name} 
                         <span className="text-gray-600">({width}x{height})</span>
                         <button onClick={() => toggleDevice(device.id)} className="hover:text-red-400"><X size={12}/></button>
                      </div>

                      {/* Frame Container */}
                      <div 
                        className="bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative transition-transform duration-300 ring-1 ring-white/10"
                        style={{ 
                          width: width * session.zoom, 
                          height: height * session.zoom,
                          borderRadius: borderRadius,
                          border: isMacBook ? 'none' : `${12 * session.zoom}px solid #1a1a1a`,
                        }}
                      >
                         {/* Camera / Dynamic Island / Notch Overlays */}
                         {!isLandscape && !isMacBook && (
                             <>
                               {hasDynamicIsland && (
                                 <div 
                                    className="absolute left-1/2 -translate-x-1/2 bg-black z-20 rounded-full flex items-center justify-center pointer-events-none"
                                    style={{ top: `${8 * session.zoom}px`, width: `${100 * session.zoom}px`, height: `${28 * session.zoom}px` }}
                                 >
                                    <div className="w-[30%] h-[30%] bg-[#1a1a1a] rounded-full ml-auto mr-2"></div>
                                 </div>
                               )}
                               {hasNotch && (
                                  <div 
                                    className="absolute left-1/2 -translate-x-1/2 bg-[#1a1a1a] z-20 rounded-b-[16px] pointer-events-none"
                                    style={{ top: 0, width: `${140 * session.zoom}px`, height: `${24 * session.zoom}px` }}
                                  ></div>
                               )}
                               {hasPunchHole && (
                                  <div 
                                    className="absolute left-1/2 -translate-x-1/2 bg-[#1a1a1a] z-20 rounded-full pointer-events-none"
                                    style={{ top: `${10 * session.zoom}px`, width: `${12 * session.zoom}px`, height: `${12 * session.zoom}px` }}
                                  ></div>
                               )}
                             </>
                         )}

                         {/* MacBook Specific Styling */}
                         {isMacBook && (
                             <div className="absolute inset-0 border-[1px] border-gray-700 rounded-t-[12px] bg-[#0d0d0d] pointer-events-none" style={{ borderRadius: '12px 12px 0 0' }}></div>
                         )}

                         {/* Screen */}
                         <div 
                           className="w-full h-full bg-white overflow-hidden relative z-10"
                           style={{ borderRadius: isMacBook ? 0 : borderRadius/2 }}
                         >
                            <iframe 
                              src={session.url}
                              className="w-full h-full bg-white border-none"
                              style={{ 
                                width: width, 
                                height: height, 
                                transform: `scale(${session.zoom})`, 
                                transformOrigin: 'top left',
                              }}
                              title={device.name}
                              sandbox="allow-scripts allow-same-origin allow-forms"
                              loading="lazy"
                            />
                         </div>
                      </div>
                      
                      {/* MacBook Bottom Base */}
                      {isMacBook && (
                         <div 
                           className="bg-[#2c2c2e] mt-[-2px] rounded-b-lg shadow-xl relative z-20 border-t border-black"
                           style={{ width: (width * session.zoom) + 40, height: 12 * session.zoom }}
                         >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#1a1a1a] w-16 h-1.5 rounded-b-md"></div>
                         </div>
                      )}
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
  <button 
    onClick={onClick}
    title={tooltip}
    className={`p-2 rounded transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#333]'}`}
  >
    {icon}
  </button>
);

export default ResponsiveStudio;
