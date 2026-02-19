
"use client"

import { useEffect, useState, useRef } from "react"
import { Thermometer, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc, collection } from "firebase/firestore"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"

export function TempGauge() {
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings", "current")
  }, [firestore, user])

  const { data: settings, isLoading } = useDoc(settingsRef)
  
  const [temp, setTemp] = useState<number | null>(null)
  const currentTempRef = useRef<number | null>(null)
  const lastAlertTime = useRef<number>(0)
  
  const threshold = settings?.temperatureThreshold || 30

  useEffect(() => {
    if (currentTempRef.current === null) {
      const initial = 24.5 + Math.random() * 5
      setTemp(initial)
      currentTempRef.current = initial
    }

    const interval = setInterval(() => {
      const prev = currentTempRef.current ?? 25
      const next = prev + (Math.random() - 0.5) * 2.5
      
      setTemp(next)
      currentTempRef.current = next

      // Enregistrement Firestore (Marche sur le plan gratuit)
      if (user && firestore) {
        const measurementsCol = collection(firestore, "users", user.uid, "temperatureMeasurements")
        addDocumentNonBlocking(measurementsCol, {
          ownerUserId: user.uid,
          value: next,
          unit: "Celsius",
          timestamp: new Date().toISOString(),
        })
      }

      // Alerte visuelle
      if (next > threshold) {
        const now = Date.now()
        if (now - lastAlertTime.current > 60000) {
          toast({
            variant: "destructive",
            title: "Dépassement de seuil !",
            description: `Température actuelle : ${next.toFixed(1)}°C`,
          })
          lastAlertTime.current = now
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [threshold, user, firestore, toast])

  if (isLoading || temp === null) return (
    <div className="h-64 flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )

  const isHigh = temp > threshold

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className={`w-64 h-64 rounded-full border-8 flex flex-col items-center justify-center relative bg-card transition-all duration-500 ${isHigh ? 'border-accent shadow-2xl scale-105' : 'border-primary shadow-sm'}`}>
        <Thermometer className={`w-8 h-8 mb-2 ${isHigh ? 'text-accent' : 'text-primary'}`} />
        <span className={`text-6xl font-bold ${isHigh ? 'text-accent' : 'text-primary'}`}>
          {temp.toFixed(1)}°
        </span>
        <span className="text-sm text-muted-foreground">Celsius</span>
        
        {isHigh && (
          <div className="absolute -bottom-4 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            CRITIQUE
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm font-medium">Seuil : <span className="text-primary">{threshold.toFixed(1)}°C</span></p>
        <p className="text-[10px] text-muted-foreground max-w-[200px]">
          Note: Les e-mails sont désactivés en mode plan gratuit (Spark).
        </p>
      </div>
    </div>
  )
}
