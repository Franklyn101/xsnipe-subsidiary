"use client"

import { Zap, Shield, Lock, Sparkles, Rocket, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import WalletConnectModal from "./wallet-connect-modal"

export default function Hero() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress")
    if (storedWallet) {
      setWalletAddress(storedWallet)
    }
  }, [])

  const handlePhantomConnect = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        await window.solana.connect()
        if (window.solana.isConnected && window.solana.publicKey) {
          const address = window.solana.publicKey.toString()
          localStorage.setItem("walletAddress", address)
          setWalletAddress(address)
          setIsWalletModalOpen(false)
          window.location.reload()
        }
      }
    } catch (error) {
      console.error("Connection error:", error)
    }
  }

  return (
    <>
      <section className="relative py-32 px-4 overflow-hidden bg-black">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2f333615_1px,transparent_1px),linear-gradient(to_bottom,#2f333615_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Ambient glow orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#1d9bf0]/5 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[150px]" />

        <div className="container mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#16181c]/80 border border-[#2f3336] rounded-full px-6 py-3 mb-8 backdrop-blur-md hover:scale-105 transition-transform cursor-pointer">
            <Sparkles className="w-5 h-5 text-[#1d9bf0] animate-pulse" />
            <span className="text-gray-100 text-sm font-bold tracking-wide">NEXT-GEN AI SNIPER BOT</span>
            <Rocket className="w-5 h-5 text-[#1d9bf0]" />
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 text-balance leading-tight">
            Snipe Solana Tokens at
            <br />
            <span className="text-[#1d9bf0]">
              Lightning Speed
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto font-medium">
            Trade smarter with AI-powered algorithms, instant execution, and military-grade security.
            <span className="text-[#1d9bf0] font-bold"> Zero lag. Maximum profit.</span>
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <div className="group flex items-center gap-3 bg-[#16181c]/80 border border-[#2f3336] rounded-2xl px-6 py-4 shadow-2xl shadow-black/50 hover:shadow-black/70 hover:scale-105 transition-all backdrop-blur-md">
              <div className="w-12 h-12 bg-[#1d9bf0]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1d9bf0]/20 transition-colors">
                <Zap className="w-6 h-6 text-[#1d9bf0]" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm">ALL SOLANA MEMECOINS</div>
                <div className="text-gray-400 text-xs">Trade any token instantly</div>
              </div>
            </div>

            <div className="group flex items-center gap-3 bg-[#16181c]/80 border border-[#2f3336] rounded-2xl px-6 py-4 shadow-2xl shadow-black/50 hover:shadow-black/70 hover:scale-105 transition-all backdrop-blur-md">
              <div className="w-12 h-12 bg-[#1d9bf0]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1d9bf0]/20 transition-colors">
                <Shield className="w-6 h-6 text-[#1d9bf0]" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm">AUTO RUG DETECTION</div>
                <div className="text-gray-400 text-xs">AI protects your funds</div>
              </div>
            </div>

            <div className="group flex items-center gap-3 bg-[#16181c]/80 border border-[#2f3336] rounded-2xl px-6 py-4 shadow-2xl shadow-black/50 hover:shadow-black/70 hover:scale-105 transition-all backdrop-blur-md">
              <div className="w-12 h-12 bg-[#1d9bf0]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1d9bf0]/20 transition-colors">
                <Lock className="w-6 h-6 text-[#1d9bf0]" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm">MEV PROTECTED</div>
                <div className="text-gray-400 text-xs">No front-running</div>
              </div>
            </div>

            <div className="group flex items-center gap-3 bg-[#16181c]/80 border border-[#2f3336] rounded-2xl px-6 py-4 shadow-2xl shadow-black/50 hover:shadow-black/70 hover:scale-105 transition-all backdrop-blur-md">
              <div className="w-12 h-12 bg-[#1d9bf0]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1d9bf0]/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-[#1d9bf0]" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm">REAL-TIME ANALYTICS</div>
                <div className="text-gray-400 text-xs">Live market data</div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <Button
              onClick={() => setIsWalletModalOpen(true)}
              className="group relative bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-black px-12 py-8 text-xl rounded-2xl shadow-2xl shadow-[#1d9bf0]/20 hover:shadow-[#1d9bf0]/30 hover:scale-105 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
              <div className="relative flex items-center gap-3">
                <Zap className="w-7 h-7" />
                Sign In & Start Trading
                <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-black text-[#1d9bf0]">
                  $2.5M+
                </div>
                <div className="text-gray-500 text-sm font-semibold">Trading Volume</div>
              </div>
              <div className="w-px bg-[#2f3336]" />
              <div>
                <div className="text-3xl md:text-4xl font-black text-[#1d9bf0]">
                  50K+
                </div>
                <div className="text-gray-500 text-sm font-semibold">Active Users</div>
              </div>
              <div className="w-px bg-[#2f3336]" />
              <div>
                <div className="text-3xl md:text-4xl font-black text-[#1d9bf0]">
                  99.9%
                </div>
                <div className="text-gray-500 text-sm font-semibold">Uptime</div>
              </div>
            </div>
          </div>

          {/* Legal */}
          <p className="text-xs text-gray-600">
            {"By continuing, you agree to our "}
            <a href="/privacy-policy" className="text-[#1d9bf0] hover:underline font-semibold">
              Privacy Policy
            </a>
            {" and "}
            <a href="/terms" className="text-[#1d9bf0] hover:underline font-semibold">
              Terms of Use
            </a>
          </p>
        </div>

        {/* Floating elements */}
        <div
          className="absolute top-20 left-10 w-20 h-20 bg-[#1d9bf0]/5 rounded-full blur-xl animate-bounce"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute bottom-20 right-10 w-32 h-32 bg-[#1d9bf0]/5 rounded-full blur-xl animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        />
      </section>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handlePhantomConnect}
      />
    </>
  )
}