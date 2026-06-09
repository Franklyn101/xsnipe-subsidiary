import { Suspense } from "react"
import Header from "@/components/header"
import Hero from "@/components/hero"
import TokenTable from "@/components/token-table"
import HowItWorks from "@/components/how-it-works"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050d1a]">
      <div className="relative">
        <Header />
        <main>
          <Hero />
          <Suspense fallback={<div className="text-white text-center py-20">Loading tokens...</div>}>
            <TokenTable />
          </Suspense>
          <HowItWorks />
        </main>

        <footer className="border-t border-blue-900/30 py-12 mt-20">
          <div className="container mx-auto px-[10px]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-2xl font-bold mb-4">
                  <span className="text-white">X</span>
                  <span className="text-blue-400">Snipe</span>
                </div>
                <p className="text-gray-400 text-sm">
                  The fastest way to snipe and trade Solana tokens with AI-powered tools.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Products</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="/ai-snipers" className="hover:text-blue-400 transition-colors">
                      AI Snipers
                    </a>
                  </li>
                  <li>
                    <a href="/copy-trade" className="hover:text-blue-400 transition-colors">
                      Copy Trade
                    </a>
                  </li>
                  <li>
                    <a href="/trader-lens" className="hover:text-blue-400 transition-colors">
                      Trader Lens
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="/trending" className="hover:text-blue-400 transition-colors">
                      Trending
                    </a>
                  </li>
                  <li>
                    <a href="/new-pairs" className="hover:text-blue-400 transition-colors">
                      New Pairs
                    </a>
                  </li>
                  <li>
                    <a href="/meme-vision" className="hover:text-blue-400 transition-colors">
                      Meme Vision
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="/privacy-policy" className="hover:text-blue-400 transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="hover:text-blue-400 transition-colors">
                      Terms of Use
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-blue-900/30 mt-8 pt-8 text-center text-sm text-gray-500">
              © 2025 xsnipe. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}