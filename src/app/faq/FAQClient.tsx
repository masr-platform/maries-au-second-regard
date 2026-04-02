'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Question {
  q: string
  a: string
}

export default function FAQClient({ questions }: { questions: Question[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {questions.map((faq, i) => (
        <div
          key={i}
          className="border border-purple-500/15 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-950/20 to-fuchsia-950/10 hover:border-purple-500/30 transition-colors"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex justify-between items-center p-5 text-left"
            aria-expanded={open === i}
          >
            <span className="text-white font-medium pr-4 text-sm md:text-base">{faq.q}</span>
            <ChevronDown
              size={18}
              className={`text-purple-400 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Accordion — CSS maxHeight transition, zéro framer-motion */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: open === i ? '400px' : '0px', opacity: open === i ? 1 : 0 }}
          >
            <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed">{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
