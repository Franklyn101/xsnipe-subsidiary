"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Filter, Settings, TrendingUp } from "lucide-react"
import TokenCard from "./token-card"

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

export default function TokenTable() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("24h")

  useEffect(() => {
    async function fetchTokens() {
      try {
        console.log("[v0] Fetching tokens from API...")
        const response = await fetch("/api/tokens")
        const data = await response.json()
        console.log("[v0] Received token data:", data)
        setTokens(data.data || [])
      } catch (error) {
        console.error("[v0] Error fetching tokens:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [])

  const tokenGroups = []
  for (let i = 0; i < tokens.length; i += 7) {
    tokenGroups.push(tokens.slice(i, i + 7))
  }
  const limitedGroups = tokenGroups.slice(0, 4)

  return (
    <section className="relative py-12 px-[10px] bg-black">
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#1d9bf0] rounded-lg shadow-lg shadow-[#1d9bf0]/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Trending Tokens</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-[#16181c] rounded-xl p-1 border border-[#2f3336]">
              <Button
                variant={timeFilter === "24h" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeFilter("24h")}
                className={
                  timeFilter === "24h"
                    ? "bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] shadow-lg shadow-[#1d9bf0]/20"
                    : "text-gray-500 hover:text-white hover:bg-[#2f3336]"
                }
              >
                24h
              </Button>
              <Button
                variant={timeFilter === "6h" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeFilter("6h")}
                className={
                  timeFilter === "6h"
                    ? "bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] shadow-lg shadow-[#1d9bf0]/20"
                    : "text-gray-500 hover:text-white hover:bg-[#2f3336]"
                }
              >
                6h
              </Button>
              <Button
                variant={timeFilter === "1h" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeFilter("1h")}
                className={
                  timeFilter === "1h"
                    ? "bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] shadow-lg shadow-[#1d9bf0]/20"
                    : "text-gray-500 hover:text-white hover:bg-[#2f3336]"
                }
              >
                1h
              </Button>
              <Button
                variant={timeFilter === "5m" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeFilter("5m")}
                className={
                  timeFilter === "5m"
                    ? "bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] shadow-lg shadow-[#1d9bf0]/20"
                    : "text-gray-500 hover:text-white hover:bg-[#2f3336]"
                }
              >
                5m
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-[#2f3336] text-gray-400 hover:bg-[#1d9bf0]/10 bg-[#16181c] hover:border-[#1d9bf0]/50 hover:text-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-[#2f3336] text-gray-400 hover:bg-[#1d9bf0]/10 bg-[#16181c] hover:border-[#1d9bf0]/50 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-gray-500 font-medium">Try our filters for a secure experience:</span>
            <span className="px-3 py-1.5 bg-[#16181c] border border-[#2f3336] rounded-full text-gray-400 hover:bg-[#1d9bf0]/10 hover:border-[#1d9bf0]/30 transition-colors cursor-pointer">
              Hide Scams
            </span>
            <span className="px-3 py-1.5 bg-[#16181c] border border-[#2f3336] rounded-full text-gray-400 hover:bg-[#1d9bf0]/10 hover:border-[#1d9bf0]/30 transition-colors cursor-pointer">
              Hide Rugs
            </span>
            <span className="px-3 py-1.5 bg-[#16181c] border border-[#2f3336] rounded-full text-gray-400 hover:bg-[#1d9bf0]/10 hover:border-[#1d9bf0]/30 transition-colors cursor-pointer">
              Mint Auth Disabled
            </span>
            <span className="px-3 py-1.5 bg-[#16181c] border border-[#2f3336] rounded-full text-gray-400 hover:bg-[#1d9bf0]/10 hover:border-[#1d9bf0]/30 transition-colors cursor-pointer">
              Freeze Auth Disabled
            </span>
            <button className="px-3 py-1.5 bg-[#1d9bf0]/10 border border-[#1d9bf0]/40 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/20 transition-all font-medium">
              + All Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading tokens...</div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No tokens found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {limitedGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <TokenCard tokens={group} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}