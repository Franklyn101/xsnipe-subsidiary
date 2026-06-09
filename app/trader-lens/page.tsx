"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import { Users, Award, TrendingUp, Target, BarChart3, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

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

export default function TraderLensPage() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await fetch("/api/tokens")
        const data = await response.json()
        const sortedTokens = (data.data || []).sort((a: TokenData, b: TokenData) => {
          const volA = a.pairData.volume?.h24 || 0
          const volB = b.pairData.volume?.h24 || 0
          return volB - volA
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

  const generateTraderStats = (index: number, volume: any) => {
    const baseWinRate = 92 - index * 2
    const baseReturn = 250 - index * 20
    const volumeNum = volume?.h24 || 0
    const followers = Math.floor(volumeNum / 1000) + 500
    const trades = Math.floor(volumeNum / 10000) + 50

    return {
      winRate: Math.max(70, baseWinRate),
      returns: Math.max(80, baseReturn),
      followers: Math.min(5000, followers),
      trades: Math.min(500, trades),
    }
  }

  return (
    <div className="min-h-screen bg-[#050d1a]">
      <div className="relative">
        <Header />
        <main className="container mx-auto px-2.5 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Trader Lens</h1>
                <p className="text-gray-400">Track and analyze top performing traders</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading top traders...</div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No trader data available</div>
          ) : (
            <div className="grid gap-4">
              {tokens.slice(0, 10).map((token, index) => {
                const stats = generateTraderStats(index, token.pairData.volume)
                return (
                  <div
                    key={index}
                    className="group relative bg-[#0a1628] border border-blue-900/30 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-900/20"
                  >
                    <div className="absolute inset-0 rounded-xl bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />

                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/30">
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
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                              <Award className="w-4 h-4 text-black" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-xl mb-2">
                            Pro Trader #{index + 1} •{" "}
                            <span className="text-blue-400">
                              {token.profile.tokenAddress.slice(0, 4)}...{token.profile.tokenAddress.slice(-4)}
                            </span>
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-[#050d1a] rounded-lg p-3 border border-blue-900/20">
                              <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                                <Target className="w-3 h-3" />
                                <span>Win Rate</span>
                              </div>
                              <p className="text-blue-400 font-bold text-lg">{stats.winRate}%</p>
                            </div>
                            <div className="bg-[#050d1a] rounded-lg p-3 border border-blue-900/20">
                              <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>30d Return</span>
                              </div>
                              <p className="text-blue-400 font-bold text-lg">+{stats.returns}%</p>
                            </div>
                            <div className="bg-[#050d1a] rounded-lg p-3 border border-blue-900/20">
                              <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                                <Users className="w-3 h-3" />
                                <span>Followers</span>
                              </div>
                              <p className="text-white font-bold text-lg">{stats.followers}</p>
                            </div>
                            <div className="bg-[#050d1a] rounded-lg p-3 border border-blue-900/20">
                              <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                                <BarChart3 className="w-3 h-3" />
                                <span>Volume</span>
                              </div>
                              <p className="text-white font-bold text-lg">{formatVolume(token.pairData.volume)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-900/30">
                        View Profile
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}