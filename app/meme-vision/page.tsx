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
    <div className="min-h-screen bg-[#050d1a]">
      <div className="relative">
        <Header />
        <main className="container mx-auto px-2.5 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Meme Vision</h1>
                <p className="text-gray-400">Discover the hottest viral meme coins</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Scanning for meme coins...</div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No meme coins found</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokens.slice(0, 12).map((token, i) => (
                <div
                  key={i}
                  className="group relative bg-[#0a1628] border border-blue-900/30 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-900/20"
                >
                  <div className="absolute inset-0 rounded-xl bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-blue-700 flex items-center justify-center">
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
                          <p className="text-gray-400 text-sm">Meme Token</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-600/30">
                        <Flame className="w-4 h-4" />
                        <span className="font-bold text-sm">{Math.floor(Math.random() * 500) + 100}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#050d1a] rounded-lg p-3 border border-blue-900/20">
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span>Volume</span>
                        </div>
                        <p className="text-white font-bold">{formatVolume(token.pairData.volume)}</p>
                      </div>
                      <div className="bg-[#050d1a] rounded-lg p-3 border border-blue-900/20">
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                          <Users className="w-3 h-3" />
                          <span>Holders</span>
                        </div>
                        <p className="text-white font-bold">{Math.floor(Math.random() * 5000) + 500}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-lg text-xs border border-blue-700/30">
                        Trending
                      </span>
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-lg text-xs border border-blue-700/30">
                        High Volume
                      </span>
                    </div>

                    <Button
                      onClick={() => handleBuyClick(token)}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-900/30"
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