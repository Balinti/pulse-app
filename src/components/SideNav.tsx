'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Home,
  CheckCircle,
  FlaskConical,
  BarChart3,
  Settings,
  CreditCard,
  Shield
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/checkin', label: 'Check-in', icon: CheckCircle },
  { href: '/experiments', label: 'Experiments', icon: FlaskConical },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/privacy', label: 'Privacy', icon: Shield },
]

export function SideNav() {
  const pathname = usePathname()

  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
    return null
  }

  return (
    <aside className="w-64 border-r bg-background p-6">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
