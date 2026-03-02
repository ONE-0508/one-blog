import type { ReactNode } from 'react'

import Header from '../components/layout/Header.tsx'
import Footer from '../components/layout/Footer.tsx'

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10 lg:py-12">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AppLayout

