"use client"

import { formatDistanceToNow } from "date-fns"
import { TrendingUp, DollarSign, Clock, Activity, Flame, ShoppingCart, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import BuyTokenModal from "./buy-token-modal"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface TokenData {
  profile: {
    chainId: string
    tokenAddress: string
    icon?: string
    description?: string
    url?: string
  }
  pairData: {
    priceUsd: string | null
    priceNative: string | null
    volume: any
    pairCreatedAt?: number
    [key: string]: any
  }
}

interface TokenCardProps {
  tokens: TokenData[]
}

export default function TokenCard({ tokens }: TokenCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatAge = (timestamp: number | undefined) => {
    if (!timestamp) return "--"
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: false })
    } catch (error) {
      return "--"
    }
  }

  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsConnected(!!user)
    })
    return () => unsubscribe()
  }, [])

  const handleBuyClick = (token: TokenData) => {
    if (!isConnected) {
      alert("Please connect your wallet to trade tokens")
      return
    }
    setSelectedToken(token)
    setIsBuyModalOpen(true)
  }

  return (
    <>
      <div className="relative bg-[#0a1628] border border-blue-500/30 rounded-2xl overflow-hidden h-full shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all duration-300">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-blue-700/3 pointer-events-none" />

        {/* Card Header */}
        <div className="relative bg-blue-900/30 px-4 py-3 border-b border-blue-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-bold text-sm">Top Trending Tokens</h3>
            </div>
            <div className="flex items-center gap-1 text-blue-400 text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Token List */}
        <div className="relative divide-y divide-blue-900/20">
          {tokens.map((token, index) => {
            const { profile, pairData } = token

            return (
              <div
                key={`${profile.tokenAddress}-${index}`}
                className="p-4 hover:bg-blue-900/10 transition-all duration-200 cursor-pointer group relative"
              >
                {/* Hover tint */}
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />

                <div className="relative flex items-center gap-3">
                  {/* Token Icon with rank badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50 border border-blue-500/30">
                      {profile.icon ? (
                        <img
                          src={profile.icon || "/placeholder.svg"}
                          alt="Token"
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <span className="text-xs">{profile.tokenAddress.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    {/* Rank badge */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#050d1a]">
                      {index + 1}
                    </div>
                  </div>

                  {/* Token Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-semibold truncate text-sm">
                          {profile.tokenAddress.slice(0, 6)}...{profile.tokenAddress.slice(-4)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-[#050d1a]/60 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          {formatAge(pairData.pairCreatedAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuyClick(token)}
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg ${
                          isConnected
                            ? "bg-blue-700 hover:bg-blue-800 shadow-blue-900/50"
                            : "bg-gray-700 cursor-not-allowed opacity-50"
                        }`}
                        disabled={!isConnected}
                      >
                        {isConnected ? (
                          <ShoppingCart className="w-4 h-4 text-white" />
                        ) : (
                          <Lock className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Volume */}
                      <div className="flex items-center gap-1.5 text-xs bg-[#050d1a]/60 rounded-lg px-2 py-1.5 border border-blue-900/30">
                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                        <div>
                          <div className="text-gray-500 text-[10px]">Volume</div>
                          <div className="text-blue-300 font-semibold">
                            {pairData.volume?.h24 ? formatNumber(pairData.volume.h24) : "--"}
                          </div>
                        </div>
                      </div>

                      {/* Market Cap */}
                      <div className="flex items-center gap-1.5 text-xs bg-[#050d1a]/60 rounded-lg px-2 py-1.5 border border-blue-900/30">
                        <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                        <div>
                          <div className="text-gray-500 text-[10px]">Market Cap</div>
                          <div className="text-blue-300 font-semibold">
                            {pairData.priceUsd ? formatNumber(Number.parseFloat(pairData.priceUsd) * 1000000) : "--"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Card Footer */}
        <div className="relative bg-blue-900/20 px-4 py-2.5 border-t border-blue-500/30 backdrop-blur-sm">
          <div className="text-center text-xs text-gray-400">
            <span className="text-blue-400 font-semibold">{tokens.length}</span> tokens displayed
          </div>
        </div>
      </div>

      {selectedToken && (
        <BuyTokenModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} token={selectedToken} />
      )}
    </>
  )
}