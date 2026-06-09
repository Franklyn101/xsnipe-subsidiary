"use client"

import { useEffect, useState } from "react"
import { CheckCircle, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WithdrawalSuccessModalProps {
  isOpen: boolean
  amount: number
  transactionHash: string
  onClose: () => void
}

export default function WithdrawalSuccessModal({
  isOpen,
  amount,
  transactionHash,
  onClose,
}: WithdrawalSuccessModalProps) {
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setShowCheckmark(false)
      setIsProcessing(true)

      // Show checkmark after 500ms
      const checkmarkTimer = setTimeout(() => {
        setShowCheckmark(true)
      }, 500)

      // Stop processing animation after 3 seconds
      const processingTimer = setTimeout(() => {
        setIsProcessing(false)
      }, 3000)

      return () => {
        clearTimeout(checkmarkTimer)
        clearTimeout(processingTimer)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Glow background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4aa]/20 to-green-500/20 rounded-2xl blur-2xl opacity-50" />

        {/* Main card */}
        <div className="relative bg-gradient-to-br from-[#1a1a24] to-[#0f0f14] border border-[#00d4aa]/30 rounded-2xl p-8 text-center">
          {/* Animated circle background */}
          <div className="relative mb-6 flex justify-center">
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-[#00d4aa]/20 border-t-[#00d4aa] rounded-full animate-spin" />
              </div>
            )}

            {/* Success checkmark */}
            {showCheckmark && (
              <div className="animate-bounce" style={{ animationDuration: "0.6s" }}>
                <CheckCircle className="w-24 h-24 text-[#00d4aa]" fill="#00d4aa" strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Text content */}
          <h2 className="text-3xl font-bold text-white mb-2">Withdrawal Successful!</h2>
          <p className="text-gray-400 mb-6">Your withdrawal is being processed</p>

          {/* Amount display */}
          <div className="bg-[#0a0a0f]/50 border border-[#00d4aa]/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ArrowUpRight className="w-5 h-5 text-[#00d4aa]" />
              <span className="text-2xl font-bold text-[#00d4aa]">{amount.toFixed(4)} SOL</span>
            </div>
            <p className="text-sm text-gray-500">Amount withdrawn</p>
          </div>

          {/* Transaction details */}
          <div className="bg-[#0a0a0f]/50 border border-[#1f1f2e] rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-2">Transaction Hash</p>
            <a
              href={`https://solscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#00d4aa] hover:text-[#00b894] break-all transition-colors"
            >
              {transactionHash.slice(0, 20)}...{transactionHash.slice(-20)}
            </a>
          </div>

          {/* Processing message */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-6">
            <p className="text-sm text-green-400">
              {isProcessing ? "Processing transaction..." : "Transaction confirmed!"}
            </p>
          </div>

          {/* Close button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] text-[#0a0a0f] hover:from-[#00b894] hover:to-[#009977] font-semibold py-2.5 rounded-lg transition-all"
          >
            Continue Trading
          </Button>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-[#00d4aa] rounded-full opacity-50" />
          <div className="absolute bottom-4 left-4 w-3 h-3 border border-[#00d4aa]/30 rounded-full opacity-50" />
        </div>
      </div>
    </div>
  )
}