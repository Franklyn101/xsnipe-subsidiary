"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import { Eye, Flame, Users, DollarSign, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
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

export default function MemeVisionPage() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await fetch("/api/tokens")
        const data = await response.json()
        const memeTokens = (data.data || []).filter((token: TokenData) => token.pairData.volume?.h24 > 10000)
        setTokens(memeTokens)
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

  const handleBuyClick = (token: TokenData) => {
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
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Meme Vision</h1>
                <p className="text-[#71767b]">Discover the hottest viral meme coins</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[#71767b]">Scanning for meme coins...</div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-20 text-[#71767b]">No meme coins found</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokens.slice(0, 12).map((token, i) => (
                <div
                  key={i}
                  className="group relative bg-[#16181c] border border-[#2f3336] rounded-xl p-6 hover:border-[#536471] transition-all hover:shadow-xl hover:shadow-black/30"
                >
                  <div className="absolute inset-0 rounded-xl bg-[#1d9bf0]/0 group-hover:bg-[#1d9bf0]/[0.03] transition-colors" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#1d9bf0] flex items-center justify-center">
                          {token.profile.icon ? (
                            <Image
                              src={token.profile.icon || "/placeholder.svg"}
                              alt="Token"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Flame className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">
                            {token.profile.tokenAddress.slice(0, 4)}...{token.profile.tokenAddress.slice(-4)}
                          </h3>
                          <p className="text-[#71767b] text-sm">Meme Token</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                        <Flame className="w-4 h-4" />
                        <span className="font-bold text-sm">{Math.floor(Math.random() * 500) + 100}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#0f1115] rounded-lg p-3 border border-[#2f3336]">
                        <div className="flex items-center gap-1 text-[#71767b] text-xs mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span>Volume</span>
                        </div>
                        <p className="text-white font-bold">{formatVolume(token.pairData.volume)}</p>
                      </div>

                      <div className="bg-[#0f1115] rounded-lg p-3 border border-[#2f3336]">
                        <div className="flex items-center gap-1 text-[#71767b] text-xs mb-1">
                          <Users className="w-3 h-3" />
                          <span>Holders</span>
                        </div>
                        <p className="text-white font-bold">{Math.floor(Math.random() * 5000) + 500}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-[#1d9bf0]/10 text-[#1d9bf0] rounded-lg text-xs border border-[#1d9bf0]/20">
                        Trending
                      </span>
                      <span className="px-2 py-1 bg-[#1d9bf0]/10 text-[#1d9bf0] rounded-lg text-xs border border-[#1d9bf0]/20">
                        High Volume
                      </span>
                    </div>

                    <Button
                      onClick={() => handleBuyClick(token)}
                      className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white shadow-lg shadow-[#1d9bf0]/20"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Trade Now
                    </Button>
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