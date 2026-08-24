"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import { Sparkles, Filter, Settings, Clock, DollarSign, Activity, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import BuyTokenModal from "@/components/buy-token-modal"

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

export default function NewPairsPage() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await fetch("/api/tokens")
        const data = await response.json()
        const sortedTokens = (data.data || []).sort((a: TokenData, b: TokenData) => {
          const timeA = a.pairData.pairCreatedAt || 0
          const timeB = b.pairData.pairCreatedAt || 0
          return timeB - timeA
        })
        setTokens(sortedTokens)
      } catch (error) {
        console.error("Error fetching tokens:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTokens()
  }, [])

  const formatVolume = (vol: any) => {
    const volume = vol?.h24 || 0
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  const formatMarketCap = (vol: any) => {
    const mc = vol?.m5 * 1000 || vol?.h1 * 100 || vol?.h6 * 50 || 0
    if (mc >= 1000000) return `$${(mc / 1000000).toFixed(2)}M`
    if (mc >= 1000) return `$${(mc / 1000).toFixed(2)}K`
    return `$${mc.toFixed(2)}`
  }

  const handleTradeClick = (token: TokenData) => {
    setSelectedToken(token)
    setIsBuyModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        <Header />
        <main className="container mx-auto px-2.5 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#1d9bf0] rounded-xl flex items-center justify-center shadow-lg shadow-[#1d9bf0]/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">New Pairs</h1>
                <p className="text-[#71767b]">Freshly minted trading pairs on Solana</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                className="border-[#2f3336] text-[#e7e9ea] hover:bg-[#1d9bf0]/10 bg-[#16181c] hover:border-[#536471]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-[#2f3336] text-[#e7e9ea] hover:bg-[#1d9bf0]/10 bg-[#16181c] hover:border-[#536471]"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-[#71767b] font-medium">Try our filters for a secure experience:</span>
              {["Hide Scams", "Hide Rugs", "Mint Auth Disabled", "Freeze Auth Disabled"].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1.5 bg-[#16181c] border border-[#2f3336] rounded-full text-[#e7e9ea] hover:bg-[#1d9bf0]/10 hover:border-[#536471] transition-colors cursor-pointer"
                >
                  {label}
                </span>
              ))}
              <button className="px-3 py-1.5 bg-[#1d9bf0]/10 border border-[#1d9bf0]/30 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/20 transition-all font-medium">
                + All Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[#71767b]">Loading new pairs...</div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-20 text-[#71767b]">No new pairs found</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tokens.slice(0, 20).map((token, i) => (
                <div
                  key={i}
                  className="group relative bg-[#16181c] border border-[#2f3336] rounded-2xl p-6 hover:border-[#536471] transition-all hover:shadow-xl hover:shadow-black/30"
                >
                  <div className="absolute inset-0 rounded-2xl bg-[#1d9bf0]/0 group-hover:bg-[#1d9bf0]/[0.03] transition-colors" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#1d9bf0] flex items-center justify-center">
                          {token.profile.icon ? (
                            <Image
                              src={token.profile.icon || "/placeholder.svg"}
                              alt="Token"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Activity className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-xl mb-1">
                            {token.profile.tokenAddress.slice(0, 4)}...{token.profile.tokenAddress.slice(-4)}
                          </h3>
                          <p className="text-[#71767b] text-sm font-mono">
                            {token.profile.tokenAddress.slice(0, 20)}...
                          </p>
                        </div>
                      </div>

                      <div className="px-3 py-1 bg-[#00ba7c] rounded-full text-white text-xs font-bold shadow-lg shadow-[#00ba7c]/20">
                        NEW
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#0f1115] rounded-xl p-4 border border-[#2f3336]">
                        <div className="flex items-center gap-2 text-[#71767b] text-sm mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span>24h Volume</span>
                        </div>
                        <p className="text-white font-bold text-lg">{formatVolume(token.pairData.volume)}</p>
                      </div>

                      <div className="bg-[#0f1115] rounded-xl p-4 border border-[#2f3336]">
                        <div className="flex items-center gap-2 text-[#71767b] text-sm mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>Market Cap</span>
                        </div>
                        <p className="text-white font-bold text-lg">{formatMarketCap(token.pairData.volume)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#2f3336]">
                      <div className="flex items-center gap-2 text-[#71767b] text-sm">
                        <Clock className="w-4 h-4" />
                        {token.pairData.pairCreatedAt ? (
                          <span>
                            {formatDistanceToNow(new Date(token.pairData.pairCreatedAt * 1000), { addSuffix: true })}
                          </span>
                        ) : (
                          <span>Just now</span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleTradeClick(token)}
                        className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white shadow-lg shadow-[#1d9bf0]/20"
                      >
                        Trade Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedToken && (
        <BuyTokenModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} token={selectedToken} />
      )}
    </div>
  )
}