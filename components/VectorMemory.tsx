import React from 'react';
import { Database, Search, GitMerge, Activity, Cpu, ArrowRight } from 'lucide-react';

const MOCK_MEMORY = [
  {
    id: "mem_8921",
    timestamp: "2 mins ago",
    brokenSelector: "#submit-btn",
    healedSelector: "button[data-testid='submit-action-v2']",
    confidence: 0.985,
    embeddingId: "vec_9921_a"
  },
  {
    id: "mem_8915",
    timestamp: "2 hours ago",
    brokenSelector: ".cart_checkout_link",
    healedSelector: "a.shopping_cart_checkout",
    confidence: 0.942,
    embeddingId: "vec_8812_b"
  },
  {
    id: "mem_8801",
    timestamp: "1 day ago",
    brokenSelector: "//div[@id='user_menu']",
    healedSelector: "#react-burger-menu-btn",
    confidence: 0.910,
    embeddingId: "vec_7721_c"
  },
  {
    id: "mem_8755",
    timestamp: "2 days ago",
    brokenSelector: "input[name='zip']",
    healedSelector: "input[data-test='postalCode']",
    confidence: 0.991,
    embeddingId: "vec_6619_d"
  }
];

const VectorMemory: React.FC = () => {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Cpu className="text-purple-600" /> Neural Grid (Vector Memory)
          </h1>
          <p className="text-slate-500">The "Long-Term Memory" of the Healer Agent. Stores semantic embeddings of UI elements.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm shadow-sm">
              <span className="text-slate-500 block text-xs">Database Status</span>
              <span className="text-green-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online (Pinecone)
              </span>
           </div>
           <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm shadow-sm">
              <span className="text-slate-500 block text-xs">Total Embeddings</span>
              <span className="text-blue-600 font-bold">14,205 Vectors</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visualization Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-blue-500"/> Recent Self-Healing Events
            </h2>
            <div className="space-y-4">
              {MOCK_MEMORY.map((mem) => (
                <div key={mem.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-purple-300 transition-colors group">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs font-mono text-slate-500">{mem.id} • {mem.timestamp}</span>
                     <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                       mem.confidence > 0.95 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                     }`}>
                       Confidence: {(mem.confidence * 100).toFixed(1)}%
                     </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-mono">
                    <div className="flex-1 bg-red-50 border border-red-100 text-red-600 p-2 rounded">
                      <div className="text-[10px] text-red-400 uppercase mb-1">Broken Selector</div>
                      {mem.brokenSelector}
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
                    <div className="flex-1 bg-green-50 border border-green-100 text-green-600 p-2 rounded">
                      <div className="text-[10px] text-green-500 uppercase mb-1">Healed Selector (AI)</div>
                      {mem.healedSelector}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Semantic Search Engine</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Indexing Strategy</div>
                <div className="text-slate-800 font-medium">DOM Snapshot + Text Content</div>
              </div>
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Vector Dimension</div>
                <div className="text-slate-800 font-medium">1536 (OpenAI text-embedding-3)</div>
              </div>
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Similarity Metric</div>
                <div className="text-slate-800 font-medium">Cosine Similarity</div>
              </div>
            </div>
             <button className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
               <Database size={16} /> Re-Index DOM
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorMemory;