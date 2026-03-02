import type { ReactNode } from 'react'

interface MainContentProps {
  children: ReactNode
}

function MainContent({ children }: MainContentProps) {
  return (
    <section className="space-y-6 rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-5 shadow-soft md:space-y-8 md:p-7">
      {children}
    </section>
  )
}

export default MainContent

