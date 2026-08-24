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
      <div className="relative bg-[#16181c] border border-[#2f3336] rounded-2xl overflow-hidden h-full shadow-lg shadow-black/40 hover:shadow-black/60 transition-all duration-300">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-[#1d9bf0]/[0.02] pointer-events-none" />

        {/* Card Header */}
        <div className="relative bg-[#1d9bf0]/5 px-4 py-3 border-b border-[#2f3336] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#1d9bf0]" />
              <h3 className="text-white font-bold text-sm">Top Trending Tokens</h3>
            </div>
            <div className="flex items-center gap-1 text-[#1d9bf0] text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Token List */}
        <div className="relative divide-y divide-[#2f3336]/60">
          {tokens.map((token, index) => {
            const { profile, pairData } = token

            return (
              <div
                key={`${profile.tokenAddress}-${index}`}
                className="p-4 hover:bg-[#1d9bf0]/5 transition-all duration-200 cursor-pointer group relative"
              >
                {/* Hover tint */}
                <div className="absolute inset-0 bg-[#1d9bf0]/0 group-hover:bg-[#1d9bf0]/5 transition-colors" />

                <div className="relative flex items-center gap-3">
                  {/* Token Icon with rank badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-[#2f3336] flex items-center justify-center text-white font-bold shadow-lg shadow-black/40 border border-[#3a3f44]">
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
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#1d9bf0] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-black">
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
                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-black/60 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          {formatAge(pairData.pairCreatedAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuyClick(token)}
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg ${
                          isConnected
                            ? "bg-[#1d9bf0] hover:bg-[#1a8cd8] shadow-[#1d9bf0]/20"
                            : "bg-[#2f3336] cursor-not-allowed opacity-50"
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
                      <div className="flex items-center gap-1.5 text-xs bg-black/60 rounded-lg px-2 py-1.5 border border-[#2f3336]">
                        <Activity className="w-3.5 h-3.5 text-[#1d9bf0]" />
                        <div>
                          <div className="text-gray-600 text-[10px]">Volume</div>
                          <div className="text-gray-300 font-semibold">
                            {pairData.volume?.h24 ? formatNumber(pairData.volume.h24) : "--"}
                          </div>
                        </div>
                      </div>

                      {/* Market Cap */}
                      <div className="flex items-center gap-1.5 text-xs bg-black/60 rounded-lg px-2 py-1.5 border border-[#2f3336]">
                        <DollarSign className="w-3.5 h-3.5 text-[#1d9bf0]" />
                        <div>
                          <div className="text-gray-600 text-[10px]">Market Cap</div>
                          <div className="text-gray-300 font-semibold">
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
        <div className="relative bg-[#1d9bf0]/5 px-4 py-2.5 border-t border-[#2f3336] backdrop-blur-sm">
          <div className="text-center text-xs text-gray-500">
            <span className="text-[#1d9bf0] font-semibold">{tokens.length}</span> tokens displayed
          </div>
        </div>
      </div>

      {selectedToken && (
        <BuyTokenModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} token={selectedToken} />
      )}
    </>
  )
}