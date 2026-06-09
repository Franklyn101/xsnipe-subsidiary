"use client"

import Link from "next/link"
import { Menu, Search, TrendingUp, Brain, Eye, Copy, LogOut, WalletIcon, Zap, Sparkles, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import WalletConnectModal from "./wallet-connect-modal"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function Header() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress")
    if (storedWallet) {
      setWalletAddress(storedWallet)
      loadWalletData(storedWallet)
    }
  }, [])

  const loadWalletData = async (address: string) => {
    try {
      const walletRef = doc(db, "wallets", address)
      const walletSnap = await getDoc(walletRef)

      if (walletSnap.exists()) {
        const data = walletSnap.data()
        setBalance(data.balance || 0)
      }
    } catch (error) {
      console.error("[v0] Error loading wallet data:", error)
    }
  }

  const handlePhantomConnect = async () => {
    try {
      setIsConnecting(true)

      if (window.solana && window.solana.isPhantom) {
        await window.solana.connect()

        if (window.solana.isConnected && window.solana.publicKey) {
          const address = window.solana.publicKey.toString()
          console.log("[v0] Connected to Phantom:", address)

          localStorage.setItem("walletAddress", address)
          setWalletAddress(address)

          const walletRef = doc(db, "wallets", address)
          const walletSnap = await getDoc(walletRef)

          if (!walletSnap.exists()) {
            await setDoc(walletRef, {
              address,
              balance: 0,
              createdAt: serverTimestamp(),
              lastActive: serverTimestamp(),
            })
            setBalance(0)
          } else {
            await updateDoc(walletRef, {
              lastActive: serverTimestamp(),
            })
            setBalance(walletSnap.data().balance || 0)
          }

          window.dispatchEvent(new Event("walletConnected"))

          setIsWalletModalOpen(false)
        } else {
          throw new Error("Connection failed - no public key received")
        }
      } else {
        alert("Phantom wallet is not installed. Please install it from phantom.app")
      }
    } catch (error) {
      console.error("[v0] Phantom connection error:", error)
      alert("Failed to connect to Phantom. Please make sure the extension is enabled and try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (window.solana) {
      await window.solana.disconnect()
      localStorage.removeItem("walletAddress")
      setWalletAddress(null)
      setBalance(0)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 lg:hidden" />
      )}

      <header className="sticky top-0 z-50 bg-[#050d1a] border-b border-blue-900/30">
        <div className="container mx-auto px-9 py-5">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl font-bold">
                <span className="text-white text-4xl">x</span>
                <span className="text-blue-400">Snipe</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4 flex-1 justify-center">
              <Link
                href="/trending"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <TrendingUp className="w-4 h-4" />
                Trending
              </Link>
              <Link
                href="/new-pairs"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                New Pairs
              </Link>
              <Link
                href="/ai-snipers"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Brain className="w-4 h-4" />
                AI Snipers
              </Link>
              <Link
                href="/meme-vision"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Eye className="w-4 h-4" />
                Meme Vision
              </Link>
              <Link
                href="/trader-lens"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Target className="w-4 h-4" />
                Trader Lens
              </Link>
              <Link
                href="/copy-trade"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Copy className="w-4 h-4" />
                Copy Trade
              </Link>
              <Link
                href="/wallet"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <WalletIcon className="w-4 h-4" />
                Wallet
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Search Bar */}
              <div className="hidden xl:flex items-center gap-2 bg-[#0a1628] rounded-lg px-3 py-2 border border-blue-900/40">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm text-gray-300 outline-none w-32"
                />
              </div>

              {walletAddress ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/wallet"
                    className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 rounded-lg px-3 py-2 hover:bg-blue-900/40 transition-colors"
                  >
                    <WalletIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-semibold">{formatAddress(walletAddress)}</span>
                  </Link>
                  <Button
                    onClick={handleDisconnect}
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="hidden md:block bg-blue-700 hover:bg-blue-800 text-white font-semibold"
                >
                  Sign in
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="w-12 h-12 relative group">
                    <div className="absolute inset-0 bg-blue-700/20 rounded-lg group-hover:bg-blue-700/30 transition-colors" />
                    <Menu className="w-7 h-7 text-white relative z-10 group-hover:scale-110 transition-transform" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="bg-[#050d1a] border-blue-900/50 w-80 animate-in slide-in-from-right duration-300"
                >
                  <div className="flex flex-col h-full">
                    {/* Mobile menu header */}
                    <div className="py-8 px-4 border-b border-blue-900/30 flex-shrink-0 animate-in fade-in slide-in-from-top duration-500">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                          <span className="text-white">X</span>
                          <span className="text-blue-400">Snipe</span>
                        </h2>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">Navigate the platform</p>
                    </div>

                    {/* Navigation links */}
                    <nav className="flex flex-col gap-3 mt-8 flex-1 px-4 overflow-y-auto">
                      <Link
                        href="/trending"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-blue-900/20 transition-all p-4 rounded-lg group animate-in slide-in-from-right duration-300 delay-75"
                      >
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-700/30 group-hover:scale-110 transition-all">
                          <TrendingUp className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                          <div className="font-semibold">Trending</div>
                          <div className="text-xs text-gray-500">Hot tokens right now</div>
                        </div>
                      </Link>

                      <Link
                        href="/new-pairs"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-blue-900/20 transition-all p-4 rounded-lg group animate-in slide-in-from-right duration-300 delay-100"
                      >
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-700/30 group-hover:scale-110 transition-all">
                          <Sparkles className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                          <div className="font-semibold">New Pairs</div>
                          <div className="text-xs text-gray-500">Latest token launches</div>
                        </div>
                      </Link>

                      <Link
                        href="/ai-snipers"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-blue-900/20 transition-all p-4 rounded-lg group animate-in slide-in-from-right duration-300 delay-150"
                      >
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-700/30 group-hover:scale-110 transition-all">
                          <Brain className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                          <div className="font-semibold">AI Snipers</div>
                          <div className="text-xs text-gray-500">Automated trading bots</div>
                        </div>
                      </Link>

                      <Link
                        href="/meme-vision"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-blue-900/20 transition-all p-4 rounded-lg group animate-in slide-in-from-right duration-300 delay-200"
                      >
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-700/30 group-hover:scale-110 transition-all">
                          <Eye className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                          <div className="font-semibold">Meme Vision</div>
                          <div className="text-xs text-gray-500">Discover meme coins</div>
                        </div>
                      </Link>

                      <Link
                        href="/trader-lens"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-blue-900/20 transition-all p-4 rounded-lg group animate-in slide-in-from-right duration-300 delay-[250ms]"
                      >
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-700/30 group-hover:scale-110 transition-all">
                          <Target className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                          <div className="font-semibold">Trader Lens</div>
                          <div className="text-xs text-gray-500">Track smart traders</div>
                        </div>
                      </Link>

                      <Link
                        href="/copy-trade"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-blue-900/20 transition-all p-4 rounded-lg group animate-in slide-in-from-right duration-300 delay-300"
                      >
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-700/30 group-hover:scale-110 transition-all">
                          <Copy className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                          <div className="font-semibold">Copy Trade</div>
                          <div className="text-xs text-gray-500">Mirror successful trades</div>
                        </div>
                      </Link>

                      <Link
                        href="/wallet"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-blue-900/20 transition-all p-4 rounded-lg group animate-in slide-in-from-right duration-300 delay-[350ms]"
                      >
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-700/30 group-hover:scale-110 transition-all">
                          <WalletIcon className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                          <div className="font-semibold">Wallet</div>
                          <div className="text-xs text-gray-500">Manage your funds</div>
                        </div>
                      </Link>
                    </nav>

                    {/* Footer */}
                    <div className="pb-8 px-4 border-t border-blue-900/30 pt-6 flex-shrink-0 animate-in fade-in slide-in-from-bottom duration-500 delay-500">
                      {walletAddress ? (
                        <div className="space-y-3">
                          <Link
                            href="/wallet"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between bg-blue-900/30 border border-blue-500/30 rounded-lg px-4 py-3 hover:bg-blue-900/40 transition-all hover:scale-[1.02]"
                          >
                            <div className="flex items-center gap-2">
                              <WalletIcon className="w-4 h-4 text-blue-400" />
                              <span className="text-white text-sm font-semibold">{formatAddress(walletAddress)}</span>
                            </div>
                          </Link>
                          <Button
                            onClick={handleDisconnect}
                            variant="outline"
                            className="w-full border-blue-500/30 text-white hover:bg-blue-900/20 bg-transparent hover:scale-[1.02] transition-all"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setIsWalletModalOpen(true)}
                          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold hover:scale-[1.02] transition-all"
                        >
                          Connect Wallet
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handlePhantomConnect}
      />
    </>
  )
}