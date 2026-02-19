"use client"

import { useEffect, useState, useRef } from "react"
import { Thermometer, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc, collection } from "firebase/firestore"
import { sendAlertEmail } from "@/ai/flows/send-alert-email"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"

export function TempGauge() {
  const { firestore } = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings", "preferences")
  }, [firestore, user])

  const { data: settings, isLoading } = useDoc(settingsRef)
  
  const [temp, setTemp] = useState<number | null>(null)
  const threshold = settings?.temperatureThreshold || 30
  const alertEmail = settings?.alertEmail
  const isEmailAlertEnabled = settings?.emailAlerts !== false

  // Utiliser une ref pour éviter de déclencher plusieurs fois l'alerte
  const lastAlertSentTime = useRef<number>(0)

  useEffect(() => {
    // Valeur initiale aléatoire
    const initialTemp = 24.5 + Math.random() * 5
    setTemp(initialTemp)

    const interval = setInterval(() => {
      setTemp(prev => {
        if (prev === null) return 25
        const change = (Math.random() - 0.5) * 1.5 // Augmenter un peu la variation pour tester
        const next = prev + change
        
        // Vérifier le seuil
        if (next > threshold && prev <= threshold) {
          const now = Date.now()
          // Anti-spam : Une seule alerte toutes les 2 minutes
          if (now - lastAlertSentTime.current > 120000) {
            handleTriggerAlert(next)
            lastAlertSentTime.current = now
          }
        }
        
        return next
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [threshold, alertEmail, isEmailAlertEnabled])

  const handleTriggerAlert = async (currentTemp: number) => {
    toast({
      variant: "destructive",
      title: "Seuil de Température Dépassé !",
      description: `Température : ${currentTemp.toFixed(1)}°C (Seuil: ${threshold}°C).`,
    })

    if (user && firestore) {
      // Enregistrer l'événement d'alerte dans Firestore
      const alertsCol = collection(firestore, "users", user.uid, "alertEvents")
      addDocumentNonBlocking(alertsCol, {
        ownerUserId: user.uid,
        triggeredValue: currentTemp,
        thresholdSetAtTrigger: threshold,
        unitAtTrigger: "Celsius",
        alertEmailSentTo: alertEmail || "non-configuré",
        timestamp: new Date().toISOString(),
      })

      // Déclencher le flow Genkit si l'e-mail est configuré
      if (alertEmail && isEmailAlertEnabled) {
        try {
          await sendAlertEmail({
            recipientEmail: alertEmail,
            temperature: currentTemp,
            threshold: threshold,
            unit: "Celsius"
          })
          console.log("Alerte e-mail déclenchée avec succès via Genkit")
        } catch (error) {
          console.error("Erreur lors de l'envoi de l'alerte e-mail:", error)
        }
      }
    }
  }

  if (isLoading || temp === null) return (
    <div className="h-64 flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <span className="text-xs text-muted-foreground">Initialisation du capteur...</span>
    </div>
  )

  const isHigh = temp > threshold

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="relative group">
        <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${isHigh ? 'bg-accent' : 'bg-primary'}`} />
        <div className={`w-64 h-64 rounded-full border-8 flex flex-col items-center justify-center relative bg-card transition-colors duration-500 ${isHigh ? 'border-accent shadow-[0_0_20px_rgba(255,119,41,0.3)]' : 'border-primary shadow-[0_0_20px_rgba(41,98,255,0.2)]'}`}>
          <div className="absolute top-10 flex items-center gap-1 text-muted-foreground">
            <Thermometer className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-tighter">Actuelle</span>
          </div>
          <span className={`text-6xl font-bold font-headline tracking-tight transition-colors duration-500 ${isHigh ? 'text-accent' : 'text-primary'}`}>
            {temp.toFixed(1)}°
          </span>
          <span className="text-xl font-medium text-muted-foreground mt-2">Celsius</span>
          
          {isHigh && (
            <div className="absolute -bottom-4 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              ALERTE ACTIVE
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Seuil configuré : {threshold}°C</p>
        <p className="text-xs text-muted-foreground">Dernière mise à jour : instantanée</p>
        {!alertEmail && (
          <p className="text-[10px] text-destructive font-bold uppercase mt-2">E-mail non configuré dans les paramètres</p>
        )}
      </div>
    </div>
  )
}
