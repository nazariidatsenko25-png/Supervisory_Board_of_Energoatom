import MockChatWidget from '@/components/MockChatWidget';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900 text-white pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-indigo-100">Agentic Studio is Live</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white drop-shadow-lg">
            Create Autonomous AI Agents <br className="hidden md:block"/> in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">60 Seconds</span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Stop hardcoding bots. Visually design agents, equip them with tools, and deploy a self-thinking AI widget to any website with a single line of code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/builder" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl text-lg transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transform hover:-translate-y-1">
              Build Agent Now &rarr;
            </a>
            <a href="#features" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-lg backdrop-blur-md transition-all border border-white/10 hover:border-white/30">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">Why Agentic Studio?</h2>
          <p className="text-xl text-slate-500">The platform designed for the next generation of AI.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
              🧩
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Visual Builder</h3>
            <p className="text-slate-600 leading-relaxed">
              Drag, drop, and connect logic nodes. Define system prompts, equip agents with tools like web search, and set strict guardrails without writing a single line of backend code.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
              🧠
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Live Thought Tracking</h3>
            <p className="text-slate-600 leading-relaxed">
              Don't leave users waiting. Our widget streams the AI's "thought process" in real-time. Watch as it reasons, calls external tools, and generates responses token by token.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
              🚀
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Deploy Anywhere</h3>
            <p className="text-slate-600 leading-relaxed">
              Click publish and get a universal JavaScript snippet. Embed your autonomous chat widget into Shopify, WordPress, or any custom HTML site instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Experience the Architecture</h2>
          <p className="text-lg text-slate-600 mb-12">
            Interact with the widget in the bottom right corner. See the Server-Sent Events (SSE) streaming in action.
          </p>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 inline-block text-left transform transition-all hover:scale-105">
             <h3 className="text-xl font-bold mb-4 text-slate-800">Tech Stack Powered By:</h3>
             <ul className="space-y-3 text-slate-600 font-medium text-lg">
               <li className="flex items-center gap-3"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm">✓</span> Next.js 14 App Router</li>
               <li className="flex items-center gap-3"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm">✓</span> React Flow & Zustand</li>
               <li className="flex items-center gap-3"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm">✓</span> FastAPI & Supabase</li>
               <li className="flex items-center gap-3"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm">✓</span> Gemini 2.0 Flash AI</li>
             </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-xl text-white tracking-tight">Agentic Studio</div>
          <p>© 2026 Agentic Studio. Built for the 48-hour Hackathon.</p>
        </div>
      </footer>

      {/* Віджет чату (Live Demo) */}
      <MockChatWidget />
    </main>
  );
}
