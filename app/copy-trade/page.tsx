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
      <div className="min-h-screen bg-black">
        <div className="relative">
          <Header />
          <main className="container mx-auto px-2.5 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-[#1d9bf0] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#1d9bf0]/20">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Connect Wallet Required</h2>
                <p className="text-[#71767b] mb-8">
                  Please connect your wallet to access copy trading features and start following top traders.
                </p>
                <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-6">
                  <div className="space-y-3 text-sm text-[#71767b]">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#1d9bf0]" />
                      <span>Follow professional traders automatically</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#1d9bf0]" />
                      <span>Copy trades in real-time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#1d9bf0]" />
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
    <div className="min-h-screen bg-black">
      <div className="relative">
        <Header />
        <main className="container mx-auto px-2.5 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#1d9bf0] rounded-xl flex items-center justify-center shadow-lg shadow-[#1d9bf0]/20">
                <Copy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Copy Trade</h1>
                <p className="text-[#71767b]">Automatically mirror successful traders</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {traders.map((trader) => (
              <div
                key={trader.id}
                className="group relative bg-[#16181c] border border-[#2f3336] rounded-xl p-6 hover:border-[#536471] transition-all hover:shadow-xl hover:shadow-black/30"
              >
                <div className="absolute inset-0 rounded-xl bg-[#1d9bf0]/0 group-hover:bg-[#1d9bf0]/[0.03] transition-colors" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-[#1d9bf0] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#1d9bf0]/20">
                      {trader.id}
                    </div>
                    {trader.verified && (
                      <span className="px-2 py-1 bg-[#1d9bf0]/10 text-[#1d9bf0] rounded-lg text-xs flex items-center gap-1 border border-[#1d9bf0]/30">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <h3 className="text-white font-bold text-lg mb-2">{trader.name}</h3>
                  <p className="text-[#71767b] text-sm mb-4">Specialized in meme coins and early listings</p>

                  <div className="space-y-3 mb-4">
                    <div className="bg-[#0f1115] rounded-lg p-3 border border-[#2f3336]">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[#71767b] text-xs">
                          <Copy className="w-3 h-3" />
                          <span>Followers</span>
                        </div>
                        <span className="text-white font-bold">{trader.followers}</span>
                      </div>
                    </div>

                    <div className="bg-[#0f1115] rounded-lg p-3 border border-[#2f3336]">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[#71767b] text-xs">
                          <Award className="w-3 h-3" />
                          <span>Success Rate</span>
                        </div>
                        <span className="text-[#1d9bf0] font-bold">{trader.successRate}%</span>
                      </div>
                    </div>

                    <div className="bg-[#0f1115] rounded-lg p-3 border border-[#2f3336]">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[#71767b] text-xs">
                          <TrendingUp className="w-3 h-3" />
                          <span>Avg. Return</span>
                        </div>
                        <span className="text-[#1d9bf0] font-bold">+{trader.avgReturn}%</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-semibold shadow-lg shadow-[#1d9bf0]/20">
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