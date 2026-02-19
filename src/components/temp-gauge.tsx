"use client"

import { useEffect, useState, useRef } from "react"
import { Thermometer, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc, collection } from "firebase/firestore"
import { sendAlertEmail } from "@/ai/flows/send-alert-email"
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
  const lastAlertSentTime = useRef<number>(0)
  
  const threshold = settings?.temperatureThreshold || 30
  const alertEmail = settings?.alertEmail
  const isEmailAlertEnabled = settings?.emailAlerts !== false

  const handleTriggerAlert = (currentTemp: number) => {
    toast({
      variant: "destructive",
      title: "ALERTE : Seuil dépassé",
      description: `${currentTemp.toFixed(1)}°C détectés.`,
    })

    if (user && firestore) {
      const alertsCol = collection(firestore, "users", user.uid, "alertEvents")
      addDocumentNonBlocking(alertsCol, {
        ownerUserId: user.uid,
        userPreferenceId: "current",
        triggeredValue: currentTemp,
        thresholdSetAtTrigger: threshold,
        unitAtTrigger: "Celsius",
        alertEmailSentTo: alertEmail || "non-configuré",
        timestamp: new Date().toISOString(),
      })

      if (alertEmail && isEmailAlertEnabled) {
        sendAlertEmail({
          recipientEmail: alertEmail,
          temperature: currentTemp,
          threshold: threshold,
          unit: "Celsius"
        }).catch(err => console.error("Email error:", err))
      }
    }
  }

  useEffect(() => {
    if (currentTempRef.current === null) {
      const initial = 24.5 + Math.random() * 5
      setTemp(initial)
      currentTempRef.current = initial
    }

    const interval = setInterval(() => {
      const prev = currentTempRef.current ?? 25
      const change = (Math.random() - 0.5) * 1.5
      const next = prev + change
      
      setTemp(next)
      currentTempRef.current = next

      if (next > threshold && prev <= threshold) {
        const now = Date.now()
        if (now - lastAlertSentTime.current > 120000) {
          handleTriggerAlert(next)
          lastAlertSentTime.current = now
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [threshold, alertEmail, isEmailAlertEnabled, user, firestore])

  if (isLoading || temp === null) return (
    <div className="h-64 flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )

  const isHigh = temp > threshold

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className={`w-64 h-64 rounded-full border-8 flex flex-col items-center justify-center relative bg-card transition-all duration-500 ${isHigh ? 'border-accent shadow-lg' : 'border-primary shadow-sm'}`}>
        <Thermometer className={`w-8 h-8 mb-2 ${isHigh ? 'text-accent' : 'text-primary'}`} />
        <span className={`text-6xl font-bold ${isHigh ? 'text-accent' : 'text-primary'}`}>
          {temp.toFixed(1)}°
        </span>
        <span className="text-sm text-muted-foreground">Celsius</span>
        
        {isHigh && (
          <div className="absolute -bottom-4 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold animate-pulse">
            ALERTE ACTIVE
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium">Seuil : {threshold.toFixed(1)}°C</p>
        {!alertEmail && (
          <p className="text-[10px] text-destructive font-bold uppercase mt-1">E-mail manquant dans les réglages</p>
        )}
      </div>
    </div>
  )
}