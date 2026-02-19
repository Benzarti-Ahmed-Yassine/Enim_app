
"use client"

import { useEffect, useState, useRef } from "react"
import { Thermometer, Loader2, AlertTriangle, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc, collection } from "firebase/firestore"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { sendAlertEmail } from "@/ai/flows/send-alert-email"

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
  const [isSendingAlert, setIsSendingAlert] = useState(false)
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

      // Enregistrement Firestore
      if (user && firestore) {
        const measurementsCol = collection(firestore, "users", user.uid, "temperatureMeasurements")
        addDocumentNonBlocking(measurementsCol, {
          ownerUserId: user.uid,
          value: next,
          unit: "Celsius",
          timestamp: new Date().toISOString(),
        })
      }

      // Alerte visuelle et e-mail (si activé et seuil dépassé)
      if (next > threshold) {
        const now = Date.now()
        // Anti-spam de 2 minutes (120000ms)
        if (now - lastAlertTime.current > 120000) {
          toast({
            variant: "destructive",
            title: "Dépassement de seuil !",
            description: `Température actuelle : ${next.toFixed(1)}°C. Tentative d'envoi d'alerte...`,
          })
          
          if (settings?.emailAlerts !== false && settings?.alertEmail) {
            setIsSendingAlert(true)
            const recipients = settings.alertEmail.split(',').map(e => e.trim()).filter(e => e !== "")
            
            // On envoie à tous les destinataires
            Promise.all(recipients.map(recipient => 
              sendAlertEmail({
                recipientEmail: recipient,
                temperature: next,
                threshold: threshold,
                unit: "Celsius"
              })
            )).then(() => {
              toast({
                title: "Alertes envoyées",
                description: `E-mails envoyés à : ${settings.alertEmail}`,
              })
            }).catch(err => {
              console.error("Erreur d'envoi d'e-mail:", err)
              toast({
                variant: "destructive",
                title: "Erreur d'envoi",
                description: "Vérifiez votre configuration SMTP ou le plan Firebase.",
              })
            }).finally(() => {
              setIsSendingAlert(false)
            })
          }
          
          lastAlertTime.current = now
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [threshold, user, firestore, toast, settings])

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
        
        {isSendingAlert && (
          <div className="absolute top-4 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2">
            <Send className="w-3 h-3 animate-bounce" />
            ENVOI...
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm font-medium">Seuil : <span className="text-primary">{threshold.toFixed(1)}°C</span></p>
        <p className="text-[10px] text-muted-foreground max-w-[200px]">
          Mode dynamique actif (App Hosting). Les alertes IA et e-mails sont opérationnels.
        </p>
      </div>
    </div>
  )
}
