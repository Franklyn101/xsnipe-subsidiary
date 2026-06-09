"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import { Copy, CheckCircle, Lock, TrendingUp, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

const traders = [
  { id: 1, name: "Pro Trader #1", followers: 1234, successRate: 95, avgReturn: 120, verified: true },
  { id: 2, name: "Pro Trader #2", followers: 892, successRate: 92, avgReturn: 95, verified: true },
  { id: 3, name: "Pro Trader #3", followers: 756, successRate: 89, avgReturn: 80, verified: true },
  { id: 4, name: "Pro Trader #4", followers: 543, successRate: 85, avgReturn: 65, verified: false },
  { id: 5, name: "Pro Trader #5", followers: 432, successRate: 82, avgReturn: 55, verified: false },
  { id: 6, name: "Pro Trader #6", followers: 321, successRate: 78, avgReturn: 45, verified: false },
]

export default function CopyTradePage() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsConnected(!!user)
    })
    return () => unsubscribe()
  }, [])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#050d1a]">
        <div className="relative">
          <Header />
          <main className="container mx-auto px-2.5 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/50">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Connect Wallet Required</h2>
                <p className="text-gray-400 mb-8">
                  Please connect your wallet to access copy trading features and start following top traders.
                </p>
                <div className="bg-[#0a1628] border border-blue-900/30 rounded-xl p-6">
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span>Follow professional traders automatically</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span>Copy trades in real-time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span>Manage your portfolio securely</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050d1a]">
      <div className="relative">
        <Header />
        <main className="container mx-auto px-2.5 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Copy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Copy Trade</h1>
                <p className="text-gray-400">Automatically mirror successful traders</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {traders.map((trader) => (
              <div
                key={trader.id}
                className="group relative bg-[#0a1628] border border-blue-900/30 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-900/20"
              >
                <div className="absolute inset-0 rounded-xl bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/30">
                      {trader.id}
                    </div>
                    {trader.verified && (
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-lg text-xs flex items-center gap-1 border border-blue-700/30">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <h3 className="text-white font-bold text-lg mb-2">{trader.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">Specialized in meme coins and early listings</p>

                  <div className="space-y-3 mb-4">
                    <div className="bg-[#050d1a] rounded-lg p-3 border border-blue-900/20">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Copy className="w-3 h-3" />
                          <span>Followers</span>
                        </div>
                        <span className="text-white font-bold">{trader.followers}</span>
                      </div>
                    </div>
                    <div className="bg-[#050d1a] rounded-lg p-3 border border-blue-900/20">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Award className="w-3 h-3" />
                          <span>Success Rate</span>
                        </div>
                        <span className="text-blue-400 font-bold">{trader.successRate}%</span>
                      </div>
                    </div>
                    <div className="bg-[#050d1a] rounded-lg p-3 border border-blue-900/20">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <TrendingUp className="w-3 h-3" />
                          <span>Avg. Return</span>
                        </div>
                        <span className="text-blue-400 font-bold">+{trader.avgReturn}%</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-lg shadow-blue-900/30">
                    Start Copying
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}