import React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '../ui/button'

/**
 * ThemeToggle.tsx
 * Tombol toggle untuk berpindah antara light dan dark mode.
 */

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme, resolvedTheme } = useTheme()

  /**
   * toggle
   * Membalik state tema antara 'light' dan 'dark'.
   */
  const toggle = (): void => {
    const current = theme ?? resolvedTheme
    setTheme(current === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      aria-label="Toggle theme"
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={toggle}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default ThemeToggle
