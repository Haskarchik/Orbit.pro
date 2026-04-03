export default function GlobalLoading() {
    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[200]">
            {/* Orbital Loader Animation */}
            <div className="relative w-24 h-24">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-orange-500/10 border-t-orange-500 animate-spin transition-all duration-1000" />
                
                {/* Inner Glow Circle */}
                <div className="absolute inset-4 rounded-full border border-cyan-500/20 border-b-cyan-500 animate-spin-reverse opacity-50" />
                
                {/* Core Node */}
                <div className="absolute inset-[38%] bg-orange-600 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)] animate-pulse" />
            </div>

            {/* Neural Handshake Text */}
            <div className="mt-12 space-y-3 text-center">
                <div className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] animate-pulse">
                    Orbit<span className="text-white">.</span>Pro Node
                </div>
                <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest italic">
                    Synchronizing Strategic Data...
                </div>
            </div>

            {/* Tactical Processing Bar */}
            <div className="mt-8 w-40 h-0.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-600 to-cyan-500 w-1/2 animate-slide-loading" />
            </div>
        </div>
    );
}
