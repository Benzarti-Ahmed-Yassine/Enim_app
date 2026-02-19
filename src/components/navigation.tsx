
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, History, Settings, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t pb-safe-area-inset-bottom md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 md:max-w-none md:px-8 md:justify-start md:gap-8">
        <div className="hidden md:flex items-center gap-2 mr-auto">
          <div className="bg-primary p-2 rounded-lg">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">TempAlert</span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
