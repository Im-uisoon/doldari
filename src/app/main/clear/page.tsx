'use client'

import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'

type SafetyItem = {
  key: string
  name: string
  img: string
  href: string
}

const SAFETY_TYPES: SafetyItem[] = [
  {
    key: 'fall_from_height',
    name: '추락',
    img: '/safe/fall_from_height.png',
    href: '/main/clear/detail/fall_from_height',
  },
  {
    key: 'entrapment',
    name: '끼임',
    img: '/safe/entrapment.png',
    href: '/main/clear/detail/entrapment',
  },
  {
    key: 'electric_shock',
    name: '감전',
    img: '/safe/electric_shock.png',
    href: '/main/clear/detail/electric_shock',
  },
  {
    key: 'slip_and_fall',
    name: '넘어짐',
    img: '/safe/slip_and_fall.png',
    href: '/main/clear/detail/slip_and_fall',
  },
  {
    key: 'falling_object',
    name: '낙하물',
    img: '/safe/falling_object.png',
    href: '/main/clear/detail/falling_object',
  },
  {
    key: 'heatstroke',
    name: '열사병·탈진',
    img: '/safe/heatstroke.png',
    href: '/main/clear/detail/heatstroke',
  },
  {
    key: 'fire',
    name: '화재',
    img: '/safe/fire.png',
    href: '/main/clear/detail/fire',
  },
  {
    key: 'collapse',
    name: '붕괴',
    img: '/safe/collapse.png',
    href: '/main/clear/detail/collapse',
  },
]

export default function ClearPage() {
  return (
    <div className="min-h-screen bg-neutral-100 text-zinc-600">
      <nav className="h-14 bg-gray-300 flex justify-between items-center px-4 border-b border-zinc-400">
        <Header />
      </nav>

      <div className=" py-3 text-center border-b">
        <h1 className="text-3xl font-bold text-zinc-700">안전조치</h1>
      </div>

      <main className="max-w-4xl mx-auto p-5">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {SAFETY_TYPES.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="relative bg-[#1A1806] rounded-3xl overflow-hidden aspect-square flex items-center justify-center hover:brightness-90"
            >
              <img
                src={item.img}
                alt={item.name}
                className="max-w-full max-h-full object-contain"
              />
              <span className="sr-only">{item.name}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
