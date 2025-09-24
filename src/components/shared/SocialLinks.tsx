import React, { type JSX } from 'react'
import { Facebook, Instagram, ShoppingBag, MessageCircle, Clapperboard } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

/**
 * SocialLinks.tsx
 * Menampilkan deretan ikon social media dan tautan Shopee.
 */

export interface SocialLinksProps {
  instagram?: string
  facebook?: string
  tiktok?: string
  shopee?: string
  whatsapp?: string
  className?: string
}

/**
 * IconLink
 * Komponen kecil untuk satu ikon tautan dengan tooltip.
 */
function IconLink(props: {
  href?: string
  label: string
  children: React.ReactNode
}): JSX.Element | null {
  const { href, label, children } = props
  if (!href) return null
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/40 bg-white/70 text-amber-700 shadow-sm transition hover:scale-105 hover:border-amber-500 hover:bg-white hover:text-amber-800 dark:border-amber-300/30 dark:bg-neutral-900/60 dark:text-amber-300 dark:hover:border-amber-200 dark:hover:bg-neutral-900"
          >
            {children}
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function SocialLinks(props: SocialLinksProps): JSX.Element {
  const { instagram, facebook, tiktok, shopee, whatsapp, className } = props
  return (
    <div className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <IconLink href={instagram} label="Instagram">
        <Instagram className="h-4 w-4" />
      </IconLink>
      <IconLink href={facebook} label="Facebook">
        <Facebook className="h-4 w-4" />
      </IconLink>
      <IconLink href={tiktok} label="TikTok">
        <Clapperboard className="h-4 w-4" />
      </IconLink>
      <IconLink href={shopee} label="Shopee">
        <ShoppingBag className="h-4 w-4" />
      </IconLink>
      <IconLink href={whatsapp} label="WhatsApp">
        <MessageCircle className="h-4 w-4" />
      </IconLink>
    </div>
  )
}

export default SocialLinks
