import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-8 overflow-hidden relative">
      
      {/* Abstract Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="max-w-4xl w-full text-center z-10">
        <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter">
          <span className="bg-gradient-to-br from-indigo-400 via-purple-400 to-rose-400 text-transparent bg-clip-text uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
            RichUp
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          The ultimate real-time multiplayer board game experience. Buy properties, build monopolies, and bankrupt your friends.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            href="/rooms" 
            className="w-full sm:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 transition-all hover:-translate-y-1 hover:shadow-indigo-500/40 text-lg uppercase tracking-widest text-center"
          >
            Play Now
          </Link>
          
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 transition-all hover:-translate-y-1 text-lg text-center"
          >
            Sign In
          </Link>
          
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-2xl transition-all hover:-translate-y-1 text-lg text-center"
          >
            Create Account
          </Link>
        </div>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="text-3xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Build Your Empire</h3>
            <p className="text-slate-500 text-sm">Purchase properties, build houses and hotels, and charge massive rent to anyone who lands on your tiles.</p>
          </div>
          
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="text-3xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Trade & Negotiate</h3>
            <p className="text-slate-500 text-sm">Propose complex trades involving multiple properties and cash to complete your color sets.</p>
          </div>
          
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Real-Time Sync</h3>
            <p className="text-slate-500 text-sm">Experience buttery smooth gameplay with sub-millisecond WebSocket synchronization across all devices.</p>
          </div>
        </div>
      </main>
      
      <footer className="absolute bottom-8 text-slate-600 text-sm font-medium">
        © {new Date().getFullYear()} RichUp Clone. Built for the modern web.
      </footer>
    </div>
  );
}
