"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, History, Settings, LogOut, User, Bell, AlertTriangle, Shield } from "lucide-react"
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
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b h-16 flex items-center px-4 md:px-8 shadow-sm">
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
          <div className="hidden sm:flex flex-col border-l border-slate-200 pl-3 h-8 justify-center">
            <span className="font-bold text-sm leading-none text-slate-900 tracking-tight">ENIM MONASTIR</span>
            <span className="text-[8px] font-bold text-primary uppercase tracking-widest mt-0.5">TempAlert Precision</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn(
            "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
            isAlertActive ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
          )}>
            <Shield className={cn("w-3 h-3", isAlertActive && "animate-pulse")} />
            {isAlertActive ? "Alerte Thermique" : "Système Optimal"}
          </div>

          <div className="relative">
            <Button variant="ghost" size="icon" className={cn("rounded-full h-9 w-9", isAlertActive ? "bg-red-100 text-red-600" : "text-muted-foreground")}>
              {isAlertActive ? <AlertTriangle className="w-5 h-5 animate-bounce" /> : <Bell className="w-5 h-5" />}
            </Button>
            {isAlertActive && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            )}
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-slate-100 p-0 overflow-hidden border border-slate-200">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-primary text-white text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal py-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Membre ENIM</p>
                    <p className="text-[11px] leading-none text-muted-foreground truncate font-mono">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 py-3 cursor-pointer text-xs font-bold">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>DÉCONNEXION</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <nav className="fixed top-16 left-0 right-0 z-40 bg-white/60 backdrop-blur-md border-b h-12 hidden md:flex items-center justify-center">
         <div className="flex gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all py-1.5 px-4 rounded-lg",
                    isActive 
                      ? "text-primary bg-primary/10 shadow-sm" 
                      : "text-muted-foreground hover:text-primary hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              )
            })}
         </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t pb-safe-area-inset-bottom md:hidden shadow-lg">
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
                <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}