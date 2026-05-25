'use client'

import { ThemeProvider as NextThemes } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={['dark', 'light']}
      storageKey="crm-techmalhas-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  )
}
