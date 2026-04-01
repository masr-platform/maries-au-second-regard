'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-purple-500/15 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-950/20 to-fuchsia-950/10 hover:border-purple-500/30 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-5 text-left"
      >
        <span className="text-white font-medium pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-purple-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}
