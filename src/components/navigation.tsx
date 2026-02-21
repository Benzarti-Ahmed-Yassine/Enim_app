
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, History, Settings, LogOut, LogIn, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Historique", icon: History },
  { href: "/settings", label: "Paramètres", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const auth = useAuth()
  
  const enimLogo = PlaceHolderImages.find(img => img.id === 'enim-logo')

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
      router.push('/login')
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t pb-safe-area-inset-bottom md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 md:max-w-none md:px-8 md:justify-start md:gap-8">
        <div className="hidden md:flex items-center gap-3 mr-auto">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg border bg-white flex items-center justify-center">
            {enimLogo && (
              <Image 
                src={enimLogo.imageUrl} 
                alt="ENIM Logo" 
                fill 
                className="object-contain p-1"
                data-ai-hint={enimLogo.imageHint}
              />
            )}
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-bold text-lg tracking-tight text-primary">ENIM</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">TempAlert</span>
          </div>
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

        <div className="flex items-center md:ml-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Mon Compte</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Connexion</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
