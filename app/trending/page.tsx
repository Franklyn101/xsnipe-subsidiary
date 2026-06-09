"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import { TrendingUp, Filter, Settings, Clock, DollarSign, Activity, ChevronLeft, ChevronRight } from "lucide-react"
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

export default function TrendingPage() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("24h")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const tokensPerPage = 12

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await fetch("/api/tokens")
        const data = await response.json()
        setTokens(data.data || [])
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

  const indexOfLastToken = currentPage * tokensPerPage
  const indexOfFirstToken = indexOfLastToken - tokensPerPage
  const currentTokens = tokens.slice(indexOfFirstToken, indexOfLastToken)
  const totalPages = Math.ceil(tokens.length / tokensPerPage)

  const handleTradeClick = (token: TokenData) => {
    setSelectedToken(token)
    setIsBuyModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#050d1a]">
      <div className="relative">
        <Header />
        <main className="container mx-auto px-2.5 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Trending Tokens</h1>
                <p className="text-gray-400">Discover the hottest tokens on Solana</p>
              </div>
            </div>

            {/* Time filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-[#0a1628] rounded-xl p-1 border border-blue-900/30">
                {["24h", "6h", "1h", "5m"].map((filter) => (
                  <Button
                    key={filter}
                    variant={timeFilter === filter ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeFilter(filter)}
                    className={
                      timeFilter === filter
                        ? "bg-blue-700 text-white hover:bg-blue-800 shadow-lg shadow-blue-900/50"
                        : "text-gray-400 hover:text-white hover:bg-blue-900/30"
                    }
                  >
                    {filter}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-gray-300 hover:bg-blue-900/20 bg-[#0a1628] hover:border-blue-500/50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-gray-300 hover:bg-blue-900/20 bg-[#0a1628] hover:border-blue-500/50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-gray-400 font-medium">Try our filters for a secure experience:</span>
              {["Hide Scams", "Hide Rugs", "Mint Auth Disabled", "Freeze Auth Disabled"].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1.5 bg-[#0a1628] border border-blue-500/30 rounded-full text-gray-300 hover:bg-blue-900/20 transition-colors cursor-pointer"
                >
                  {label}
                </span>
              ))}
              <button className="px-3 py-1.5 bg-blue-900/20 border border-blue-500/40 rounded-full text-blue-300 hover:bg-blue-900/30 transition-all font-medium">
                + All Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading tokens...</div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No tokens found</div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentTokens.map((token, i) => (
                  <div
                    key={i}
                    className="group relative bg-[#0a1628] border border-blue-900/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-900/20"
                  >
                    {/* Hover tint */}
                    <div className="absolute inset-0 rounded-2xl bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-blue-700 flex items-center justify-center">
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
                            <p className="text-gray-400 text-sm font-mono">
                              {token.profile.tokenAddress.slice(0, 20)}...
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-blue-700 rounded-full text-white text-sm font-bold shadow-lg shadow-blue-900/30">
                          #{i + 1}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-[#050d1a] rounded-xl p-4 border border-blue-900/20">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span>24h Volume</span>
                          </div>
                          <p className="text-white font-bold text-lg">{formatVolume(token.pairData.volume)}</p>
                        </div>
                        <div className="bg-[#050d1a] rounded-xl p-4 border border-blue-900/20">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>Market Cap</span>
                          </div>
                          <p className="text-white font-bold text-lg">{formatMarketCap(token.pairData.volume)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-blue-900/20">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Clock className="w-4 h-4" />
                          {token.pairData.pairCreatedAt ? (
                            <span>
                              {formatDistanceToNow(new Date(token.pairData.pairCreatedAt * 1000), { addSuffix: true })}
                            </span>
                          ) : (
                            <span>Recently created</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleTradeClick(token)}
                          className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-900/30"
                        >
                          Trade Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="border-blue-500/30 text-gray-300 hover:bg-blue-900/20 bg-[#0a1628] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        className={
                          currentPage === page
                            ? "bg-blue-700 text-white hover:bg-blue-800"
                            : "border-blue-500/30 text-gray-300 hover:bg-blue-900/20 bg-[#0a1628]"
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="border-blue-500/30 text-gray-300 hover:bg-blue-900/20 bg-[#0a1628] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      {selectedToken && (
        <BuyTokenModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} token={selectedToken} />
      )}
    </div>
  )
}