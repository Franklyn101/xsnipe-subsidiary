"use client"

import Header from "@/components/header"
import { Brain, TrendingUp, DollarSign, Activity, Zap, Target, BarChart3, Settings, Play, Pause } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"

export default function AISnipersPage() {
  const [isSniperActive, setIsSniperActive] = useState(false)
  const [profits, setProfits] = useState(0)
  const [snipeHistory, setSnipeHistory] = useState<any[]>([])
  const [liveSnipes, setLiveSnipes] = useState<any[]>([])
  const [availableCoins, setAvailableCoins] = useState<any[]>([])
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [configCode, setConfigCode] = useState("")
  const [configCodeEnabled, setConfigCodeEnabled] = useState(false)
  const [adminConfigCode, setAdminConfigCode] = useState("BOOST75")
  const [config, setConfig] = useState({
    minBuyAmount: "0.01",
    maxBuyAmount: "0.1",
    slippage: "5",
    gasPrice: "auto",
    snipeInterval: "2500",
  })
  const [stats, setStats] = useState({
    totalSnipes: 0,
    successfulSnipes: 0,
    failedSnipes: 0,
    totalVolume: 0,
  })

  useEffect(() => {
    const address = localStorage.getItem("walletAddress")
    if (address) {
      setWalletAddress(address)
      setupSnipeListener(address)
      fetchMemecoins()
      fetchAdminConfigCode()
    }

    const handleWalletConnected = () => {
      const newAddress = localStorage.getItem("walletAddress")
      if (newAddress) {
        setWalletAddress(newAddress)
        setupSnipeListener(newAddress)
        fetchMemecoins()
        fetchAdminConfigCode()
      }
    }

    window.addEventListener("walletConnected", handleWalletConnected)
    return () => window.removeEventListener("walletConnected", handleWalletConnected)
  }, [])

  const setupSnipeListener = (address: string) => {
    const snipesQuery = query(collection(db, "snipes"), where("walletId", "==", address), orderBy("timestamp", "desc"))

    const unsubscribe = onSnapshot(snipesQuery, (snapshot) => {
      const history = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setSnipeHistory(history.slice(0, 20))

      const completedSnipes = history.filter((snipe) => snipe.status !== "pending")
      const successfulSnipes = completedSnipes.filter((snipe) => snipe.status === "success")
      const totalProfit = completedSnipes.reduce((sum, snipe) => sum + (snipe.profit || 0), 0)
      const totalVolume = completedSnipes.reduce((sum, snipe) => sum + (snipe.amount || 0), 0)

      setStats({
        totalSnipes: completedSnipes.length,
        successfulSnipes: successfulSnipes.length,
        failedSnipes: completedSnipes.length - successfulSnipes.length,
        totalVolume,
      })
      setProfits(totalProfit)
    })

    return unsubscribe
  }

  const fetchMemecoins = async () => {
    try {
      const response = await fetch("/api/tokens?timeframe=24h")
      const data = await response.json()
      if (data.data && data.data.length > 0) setAvailableCoins(data.data)
    } catch (error) {
      console.error("[v0] Error fetching coins:", error)
    }
  }

  const fetchAdminConfigCode = async () => {
    try {
      const { ref: realtimeRef, get } = await import("firebase/database")
      const { realtimeDb } = await import("@/lib/firebase")
      const codeRef = realtimeRef(realtimeDb, "settings/aiSniperConfigCode")
      const snapshot = await get(codeRef)
      if (snapshot.exists()) setAdminConfigCode(snapshot.val())
    } catch (error) {
      console.error("[v0] Error fetching config code:", error)
    }
  }

  const handleConfigCodeSubmit = () => {
    if (configCode.trim() === adminConfigCode) {
      setConfigCodeEnabled(true)
      setConfigCode("")
      alert("Configuration code activated! Win rate boosted to 75%")
    } else {
      alert("Invalid configuration code")
      setConfigCode("")
    }
  }

  const simulateSnipe = useCallback(async () => {
    if (!isSniperActive || availableCoins.length === 0 || !walletAddress) return

    const randomCoin = availableCoins[Math.floor(Math.random() * availableCoins.length)]
    const buyPrice = Number.parseFloat(randomCoin.pairData?.priceUsd) || 0.00001
    const minAmount = Number.parseFloat(config.minBuyAmount) || 0.01
    const maxAmount = Number.parseFloat(config.maxBuyAmount) || 0.1
    const amountInSOL = Math.random() * (maxAmount - minAmount) + minAmount

    const newSnipe = {
      id: Date.now() + Math.random(),
      token: randomCoin.profile?.tokenAddress.slice(0, 8) || "Unknown",
      buyPrice,
      sellPrice: 0,
      amount: amountInSOL,
      status: "pending",
      timestamp: new Date(),
      profit: 0,
      walletId: walletAddress,
    }

    setLiveSnipes((prev) => [newSnipe, ...prev.slice(0, 4)])

    try {
      const docRef = await addDoc(collection(db, "snipes"), {
        ...newSnipe,
        timestamp: serverTimestamp(),
      })

      setTimeout(
        async () => {
          const winRate = configCodeEnabled ? 0.75 : 0.7
          const isWin = Math.random() < winRate
          const priceMultiplier = isWin ? 1 + (Math.random() * 0.5 + 0.15) : 1 - (Math.random() * 0.2 + 0.05)
          const sellPrice = buyPrice * priceMultiplier
          const profitInSOL = amountInSOL * (priceMultiplier - 1)

          await updateDoc(doc(db, "snipes", docRef.id), {
            sellPrice,
            status: profitInSOL > 0 ? "success" : "failed",
            profit: profitInSOL,
            completedAt: serverTimestamp(),
          })

          if (walletAddress) {
            await updateDoc(doc(db, "wallets", walletAddress), {
              balance: increment(profitInSOL),
            })
          }

          setLiveSnipes((prev) => prev.filter((snipe) => snipe.id !== newSnipe.id))
        },
        Math.random() * 4000 + 1000,
      )
    } catch (error) {
      console.error("Error simulating snipe:", error)
    }
  }, [isSniperActive, availableCoins, walletAddress, config, configCodeEnabled])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSniperActive && availableCoins.length > 0 && walletAddress) {
      const intervalTime = Number.parseInt(config.snipeInterval) || 2500
      interval = setInterval(simulateSnipe, intervalTime)
    }
    return () => clearInterval(interval)
  }, [isSniperActive, simulateSnipe, availableCoins.length, walletAddress, config.snipeInterval])

  const winRate = stats.totalSnipes > 0 ? (stats.successfulSnipes / stats.totalSnipes) * 100 : 0
  const expectedWinRate = configCodeEnabled ? 75 : 70

  return (
    <div className="min-h-screen bg-[#050d1a]">
      <Header />
      <main className="container mx-auto px-2.5 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                {isSniperActive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-pulse border-2 border-[#050d1a]" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  AI Snipers
                  {isSniperActive && (
                    <span className="text-sm font-normal text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/30">
                      Live
                    </span>
                  )}
                  {configCodeEnabled && (
                    <span className="text-sm font-normal text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/30">
                      Boosted
                    </span>
                  )}
                </h1>
                <p className="text-gray-400">Automated trading bot with {expectedWinRate}% win rate</p>
              </div>
            </div>
          </div>
        </div>

        {!walletAddress ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#0a1628] border border-red-500/30 rounded-2xl p-12 text-center">
              <Brain className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Wallet Not Connected</h2>
              <p className="text-gray-400">Please connect your wallet to start using the AI Sniper</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {/* Control Panel */}
              <div className="bg-blue-900/15 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Control Panel</h2>
                  <div
                    className={`w-3 h-3 rounded-full ${isSniperActive ? "bg-blue-400 animate-pulse" : "bg-gray-500"}`}
                  />
                </div>

                <Button
                  onClick={() => setIsSniperActive(!isSniperActive)}
                  className={`w-full py-6 rounded-xl font-bold text-lg mb-4 ${
                    isSniperActive ? "bg-red-600 hover:bg-red-700" : "bg-blue-700 hover:bg-blue-800"
                  } text-white transition-all transform hover:scale-105`}
                >
                  {isSniperActive ? (
                    <><Pause className="w-5 h-5 mr-2" />Stop Sniper</>
                  ) : (
                    <><Play className="w-5 h-5 mr-2" />Start Sniper</>
                  )}
                </Button>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-semibold ${isSniperActive ? "text-blue-400" : "text-gray-400"}`}>
                      {isSniperActive ? "Active" : "Idle"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="font-semibold text-blue-400">{winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Interval</span>
                    <span className="font-semibold text-blue-400">{config.snipeInterval}ms</span>
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div className="bg-[#0a1628] border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Configuration</h2>
                </div>

                <div className="mb-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                  <label className="text-gray-300 text-sm mb-2 block font-semibold">Configuration Code</label>
                  <p className="text-gray-400 text-xs mb-3">Enter code to boost win rate to 75%</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={configCode}
                      onChange={(e) => setConfigCode(e.target.value)}
                      placeholder="Enter code..."
                      disabled={configCodeEnabled}
                      className="flex-1 bg-[#050d1a] border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Button
                      onClick={handleConfigCodeSubmit}
                      disabled={configCodeEnabled || !configCode.trim()}
                      className="bg-blue-700 hover:bg-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {configCodeEnabled ? "Activated" : "Activate"}
                    </Button>
                  </div>
                  {configCodeEnabled && (
                    <p className="text-blue-400 text-xs mt-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Configuration code activated - Win rate boosted to 75%!
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Min Buy Amount (SOL)", key: "minBuyAmount", step: "0.01", type: "number" },
                    { label: "Max Buy Amount (SOL)", key: "maxBuyAmount", step: "0.01", type: "number" },
                    { label: "Slippage Tolerance (%)", key: "slippage", step: "0.5", type: "number" },
                    { label: "Snipe Interval (ms)", key: "snipeInterval", step: "100", type: "number" },
                  ].map(({ label, key, step, type }) => (
                    <div key={key}>
                      <label className="text-gray-400 text-sm mb-2 block">{label}</label>
                      <input
                        type={type}
                        step={step}
                        value={config[key as keyof typeof config]}
                        onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                        disabled={isSniperActive}
                        className="w-full bg-[#050d1a] border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Gas Price</label>
                    <select
                      value={config.gasPrice}
                      onChange={(e) => setConfig({ ...config, gasPrice: e.target.value })}
                      disabled={isSniperActive}
                      className="w-full bg-[#050d1a] border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="auto">Auto</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {isSniperActive && (
                  <p className="text-yellow-400 text-xs mt-4 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Stop the sniper to modify configuration
                  </p>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a1628] border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-semibold">Total</span>
                  </div>
                  <p className="text-white font-bold text-2xl">{stats.totalSnipes}</p>
                </div>
                <div className="bg-[#0a1628] border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-semibold">Success</span>
                  </div>
                  <p className="text-white font-bold text-2xl">{stats.successfulSnipes}</p>
                </div>
                <div className="bg-[#0a1628] border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-semibold">Profit</span>
                  </div>
                  <p className={`font-bold text-xl ${profits >= 0 ? "text-blue-400" : "text-red-400"}`}>
                    {profits >= 0 ? "+" : ""}
                    {profits.toFixed(4)}
                  </p>
                </div>
                <div className="bg-[#0a1628] border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-semibold">Volume</span>
                  </div>
                  <p className="text-white font-bold text-xl">{stats.totalVolume.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Live Snipes */}
              <div className="bg-[#0a1628] border border-blue-500/30 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-blue-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white font-bold">Live Snipes</h3>
                  </div>
                  {liveSnipes.length > 0 && (
                    <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                      {liveSnipes.length} Active
                    </span>
                  )}
                </div>
                <div className="divide-y divide-blue-900/20 max-h-64 overflow-y-auto">
                  {liveSnipes.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      {isSniperActive ? "Scanning for opportunities..." : "No active snipes"}
                    </div>
                  ) : (
                    liveSnipes.map((snipe) => (
                      <div key={snipe.id} className="p-4 flex items-center justify-between bg-yellow-400/5 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{snipe.token}</p>
                            <p className="text-gray-400 text-sm">Amount: {snipe.amount.toFixed(4)} SOL</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold text-sm">Processing</div>
                          <div className="flex gap-1 mt-1">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce delay-100" />
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Snipe History */}
              <div className="bg-[#0a1628] border border-blue-500/30 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-blue-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-bold">Snipe History</h3>
                  </div>
                  {snipeHistory.length > 0 && (
                    <span className="text-xs text-blue-400">{snipeHistory.length} total</span>
                  )}
                </div>
                <div className="divide-y divide-blue-900/20 max-h-[600px] overflow-y-auto">
                  {snipeHistory.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No snipes yet. Start the bot to begin!</div>
                  ) : (
                    snipeHistory.map((snipe, index) => (
                      <div
                        key={snipe.id}
                        className="p-4 hover:bg-blue-900/10 transition-colors"
                        style={{ animation: `fadeIn 0.3s ease-in ${index * 0.05}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                snipe.status === "success"
                                  ? "bg-blue-900/30 border border-blue-500/30"
                                  : "bg-red-900/30 border border-red-500/30"
                              }`}
                            >
                              {snipe.status === "success" ? (
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                              ) : (
                                <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{snipe.token}</p>
                              <p className="text-gray-400 text-sm">
                                {snipe.timestamp
                                  ? formatDistanceToNow(
                                      snipe.timestamp.toDate ? snipe.timestamp.toDate() : new Date(snipe.timestamp),
                                      { addSuffix: true },
                                    )
                                  : "Just now"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${snipe.profit > 0 ? "text-blue-400" : "text-red-400"}`}>
                              {snipe.profit > 0 ? "+" : ""}
                              {snipe.profit?.toFixed(4) || "0.0000"} SOL
                            </p>
                            <p className="text-gray-400 text-sm">{snipe.amount?.toFixed(4)} SOL</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}