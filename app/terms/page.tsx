import Header from "@/components/header"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/20 via-black to-purple-950/10 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(0,0,0,0))] pointer-events-none" />

      <div className="relative">
        <Header />
        <main className="container mx-auto px-6 py-20 max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-white mb-8">Terms of Use</h1>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing and using TrexSnipeAI, you accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
              <p className="leading-relaxed mb-4">
                Permission is granted to temporarily use TrexSnipeAI for personal, non-commercial transitory viewing only.
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained on TrexSnipeAI</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Trading and Investment Risks</h2>
              <p className="leading-relaxed mb-4">
                TrexSnipeAI provides tools for cryptocurrency trading. You acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cryptocurrency trading carries substantial risk of loss</li>
                <li>You are solely responsible for all trading decisions</li>
                <li>Past performance does not guarantee future results</li>
                <li>TrexSnipeAI is not a financial advisor and does not provide investment advice</li>
                <li>You should only trade with funds you can afford to lose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Account Responsibilities</h2>
              <p className="leading-relaxed">
                You are responsible for maintaining the confidentiality of your wallet and account. You agree to accept
                responsibility for all activities that occur under your wallet address. You must notify us immediately
                of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Disclaimer</h2>
              <p className="leading-relaxed">
                The materials on TrexSnipeAI are provided on an 'as is' basis. TrexSnipeAI makes no warranties, expressed or
                implied, and hereby disclaims and negates all other warranties including, without limitation, implied
                warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
                intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Limitations of Liability</h2>
              <p className="leading-relaxed">
                In no event shall TrexSnipeAI or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability
                to use TrexSnipeAI, even if TrexSnipeAI or a TrexSnipeAI authorized representative has been notified orally or
                in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Service Modifications</h2>
              <p className="leading-relaxed">
                TrexSnipeAI reserves the right to modify or discontinue, temporarily or permanently, the service (or any
                part thereof) with or without notice. You agree that TrexSnipeAI shall not be liable to you or to any
                third party for any modification, suspension, or discontinuance of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Prohibited Activities</h2>
              <p className="leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the service for any illegal purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to any portion of the service</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use any automated system to access the service</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Governing Law</h2>
              <p className="leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably
                submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms of Use, please contact us through our live chat support or
                email us at legal@trexsnipe.com
              </p>
            </section>

            <div className="border-t border-purple-900/30 pt-8 mt-8">
              <p className="text-sm text-gray-500">Last updated: January 2025</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
