import { Suspense } from "react"
import Header from "@/components/header"
import Hero from "@/components/hero"
import TokenTable from "@/components/token-table"
import HowItWorks from "@/components/how-it-works"
import { ChevronRight, Copy, BookOpen, Box } from "lucide-react";

export default function Home() {
  return (
     <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#111111] shadow-[0_0_50px_rgba(0,0,0,.7)]">

        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10">
              ←
            </button>

            <span className="text-sm font-semibold text-zinc-400">
              1/2
            </span>

            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10">
              →
            </button>
          </div>

          {/* Right */}
          <div className="rounded-full border border-white/10 bg-[#181818] px-4 py-2 text-sm text-zinc-400">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-orange-400" />
            Next.js 16.0.10 (stale)
            <span className="ml-1 text-violet-400">Turbopack</span>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-8 p-8">

          {/* Badge */}
          <div>
            <span className="rounded-md bg-[#3B1718] px-3 py-2 text-sm font-semibold text-[#FF6B6B]">
              Console Error
            </span>
          </div>

          {/* Error Title */}
          <h2 className="max-w-5xl text-[20px] font-semibold leading-snug text-[#FF6B6B]">
            A tree hydrated but some attributes of the server rendered HTML
            didn't match the client properties. This won't be patched up.
            This can happen if a SSR-ed Client Component used:
          </h2>

          {/* List */}
          <div className="space-y-2 text-lg leading-8 text-zinc-400">
            <p>- A server/client branch if (typeof window !== "undefined").</p>
            <p>- Variable input such as Date.now() or Math.random().</p>
            <p>- Date formatting in a user's locale.</p>
            <p>- External changing data without sending a snapshot.</p>
            <p>- Invalid HTML tag nesting.</p>
          </div>

          <p className="text-lg leading-8 text-zinc-400">
            It can also happen if the client has a browser extension installed
            which messes with the HTML before React loaded.
          </p>

          {/* Link */}
          <div className="text-lg">
            <span className="font-semibold text-white">
              See more info here:
            </span>{" "}
            <a
              href="#"
              className="text-[#4EA8FF] hover:underline"
            >
              https://nextjs.org/docs/messages/react-hydration-error
            </a>
          </div>

          {/* Code Block */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

              <ChevronRight className="text-zinc-400" size={18} />

              <div className="flex gap-3">

                <button className="rounded-lg p-2 hover:bg-white/5">
                  <Copy size={18} className="text-zinc-500" />
                </button>

                <button className="rounded-lg p-2 hover:bg-white/5">
                  <BookOpen size={18} className="text-zinc-500" />
                </button>

                <button className="rounded-lg p-2 hover:bg-white/5">
                  <Box size={18} className="text-zinc-500" />
                </button>

              </div>
            </div>

            <pre className="overflow-x-auto p-6 font-mono text-[15px] leading-7 text-zinc-300">
{`<input
  placeholder="Search..."
  className="bg-transparent text-sm text-gray-300 outline-none w-32"
  fdprocessedid="vxy8b"
/>`}
            </pre>

            <div className="h-8 bg-[#5B2224]" />
          </div>

        </div>
      </div>
    </div>
    // <div className="min-h-screen bg-[#050d1a]">
    //   <div className="relative">
    //     <Header />
    //     <main>
    //       <Hero />
    //       <Suspense fallback={<div className="text-white text-center py-20">Loading tokens...</div>}>
    //         <TokenTable />
    //       </Suspense>
    //       <HowItWorks />
    //     </main>

    //     <footer className="border-t border-blue-900/30 py-12 mt-20">
    //       <div className="container mx-auto px-[10px]">
    //         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
    //           <div>
    //             <div className="text-2xl font-bold mb-4">
    //               <span className="text-white">X</span>
    //               <span className="text-blue-400">Snipe</span>
    //             </div>
    //             <p className="text-gray-400 text-sm">
    //               The fastest way to snipe and trade Solana tokens with AI-powered tools.
    //             </p>
    //           </div>
    //           <div>
    //             <h4 className="text-white font-semibold mb-3">Products</h4>
    //             <ul className="space-y-2 text-sm text-gray-400">
    //               <li>
    //                 <a href="/ai-snipers" className="hover:text-blue-400 transition-colors">
    //                   AI Snipers
    //                 </a>
    //               </li>
    //               <li>
    //                 <a href="/copy-trade" className="hover:text-blue-400 transition-colors">
    //                   Copy Trade
    //                 </a>
    //               </li>
    //               <li>
    //                 <a href="/trader-lens" className="hover:text-blue-400 transition-colors">
    //                   Trader Lens
    //                 </a>
    //               </li>
    //             </ul>
    //           </div>
    //           <div>
    //             <h4 className="text-white font-semibold mb-3">Resources</h4>
    //             <ul className="space-y-2 text-sm text-gray-400">
    //               <li>
    //                 <a href="/trending" className="hover:text-blue-400 transition-colors">
    //                   Trending
    //                 </a>
    //               </li>
    //               <li>
    //                 <a href="/new-pairs" className="hover:text-blue-400 transition-colors">
    //                   New Pairs
    //                 </a>
    //               </li>
    //               <li>
    //                 <a href="/meme-vision" className="hover:text-blue-400 transition-colors">
    //                   Meme Vision
    //                 </a>
    //               </li>
    //             </ul>
    //           </div>
    //           <div>
    //             <h4 className="text-white font-semibold mb-3">Legal</h4>
    //             <ul className="space-y-2 text-sm text-gray-400">
    //               <li>
    //                 <a href="/privacy-policy" className="hover:text-blue-400 transition-colors">
    //                   Privacy Policy
    //                 </a>
    //               </li>
    //               <li>
    //                 <a href="/terms" className="hover:text-blue-400 transition-colors">
    //                   Terms of Use
    //                 </a>
    //               </li>
    //             </ul>
    //           </div>
    //         </div>
    //         <div className="border-t border-blue-900/30 mt-8 pt-8 text-center text-sm text-gray-500">
    //           © 2025 xsnipe. All rights reserved.
    //         </div>
    //       </div>
    //     </footer>
    //   </div>
    // </div>
  )
}