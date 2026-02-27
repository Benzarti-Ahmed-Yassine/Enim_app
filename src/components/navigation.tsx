
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, History, Settings, LogOut, User, Bell, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
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
import { collection, query, orderBy, limit, doc } from "firebase/firestore"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const navItems = [
  { href: "/", label: "Tableau de Bord", icon: LayoutDashboard },
  { href: "/history", label: "Historique", icon: History },
  { href: "/settings", label: "Paramètres", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const auth = useAuth()
  const firestore = useFirestore()
  
  const enimLogo = PlaceHolderImages.find(img => img.id === 'enim-logo')

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings", "current")
  }, [firestore, user])
  const { data: settings } = useDoc(settingsRef)
  
  const latestQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(
      collection(firestore, "users", user.uid, "temperatureMeasurements"),
      orderBy("timestamp", "desc"),
      limit(1)
    )
  }, [firestore, user])
  const { data: latestData } = useCollection(latestQuery)

  const isAlertActive = latestData?.[0] && settings && latestData[0].value > (settings.temperatureThreshold || 30)

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
      router.push('/login')
    }
  }

  if (pathname === '/login') return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b h-16 flex items-center px-4 md:px-8 shadow-sm">
        <div className="flex items-center gap-3 mr-auto">
          <Link href="/" className="relative w-10 h-10 flex items-center justify-center transition-transform hover:scale-105">
            {enimLogo && (
              <Image 
                src={enimLogo.imageUrl} 
                alt="ENIM Logo" 
                fill 
                className="object-contain"
                priority
              />
            )}
          </Link>
          <div className="flex flex-col border-l border-slate-200 pl-3 h-8 justify-center">
            <span className="font-bold text-base leading-none text-slate-900 tracking-tight">ENIM</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">TempAlert Precision</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Button variant="ghost" size="icon" className={cn("rounded-full h-9 w-9", isAlertActive ? "bg-accent/10 text-accent" : "text-muted-foreground")}>
              {isAlertActive ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <Bell className="w-5 h-5" />}
            </Button>
            {isAlertActive && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
            )}
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-slate-100 p-0 overflow-hidden border border-slate-200">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-transparent text-primary text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal py-2.5">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold text-slate-900">Compte Institutionnel</p>
                    <p className="text-[11px] leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive py-2 cursor-pointer text-xs">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Navigation Tablette/Bureau (Header) */}
      <nav className="fixed top-16 left-0 right-0 z-40 bg-white/40 backdrop-blur-sm border-b h-10 hidden md:flex items-center justify-center">
         <div className="flex gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-colors py-1 px-3 rounded-full",
                    isActive 
                      ? "text-primary bg-primary/5" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              )
            })}
         </div>
      </nav>

      {/* Navigation Mobile (Barre de Tabulation) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t pb-safe-area-inset-bottom md:hidden">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[70px] transition-all",
                  isActive ? "text-primary scale-110" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
