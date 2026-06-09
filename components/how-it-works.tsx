import { Wallet, DollarSign, Zap, ArrowRight } from "lucide-react"

export default function HowItWorks() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[#050d1a]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-700/8 rounded-full blur-[150px]" />

      <div className="container mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/40 rounded-full px-5 py-2 mb-6 backdrop-blur-sm">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-bold">QUICK START</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
          Get Started in{" "}
          <span className="text-blue-400">
            3 Simple Steps
          </span>
        </h2>

        <p className="text-gray-400 text-lg mb-20 max-w-2xl mx-auto">
          Start trading in under 60 seconds. No complex setup, no hassle.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-blue-700/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-[#0a1628] border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/50 transition-all">
              <div className="w-20 h-20 mb-6 mx-auto rounded-2xl bg-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Connect Wallet</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Link your Phantom wallet securely in one click. Your keys, your crypto.
              </p>
            </div>
          </div>

          {/* Arrow connector - hidden on mobile */}
          <div className="hidden md:flex items-center justify-center -mx-4">
            <ArrowRight className="w-8 h-8 text-blue-500/40" />
          </div>

          {/* Step 2 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-blue-700/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-[#0a1628] border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/50 transition-all">
              <div className="w-20 h-20 mb-6 mx-auto rounded-2xl bg-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Deposit SOL</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Fund your TrexSnipeAI wallet with SOL. Minimum deposit just $5 worth.
              </p>
            </div>
          </div>

          {/* Arrow connector - hidden on mobile */}
          <div className="hidden md:flex items-center justify-center -mx-4">
            <ArrowRight className="w-8 h-8 text-blue-500/40" />
          </div>

          {/* Step 3 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-blue-700/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-[#0a1628] border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/50 transition-all">
              <div className="w-20 h-20 mb-6 mx-auto rounded-2xl bg-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Start Sniping</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Trade tokens at lightning speed with AI-powered sniper bots.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-20">
          <p className="text-gray-400 text-lg mb-4">Ready to start?</p>
          <div className="inline-flex items-center gap-2 text-blue-400 font-bold text-lg group cursor-pointer">
            <span>Create your account now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </section>
  )
}